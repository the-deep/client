import React, { useCallback, useState, useMemo } from 'react';
import {
    useParams,
} from 'react-router-dom';
import {
    type PartialForm,
    type ObjectSchema,
    type PurgeNull,
    requiredCondition,
    removeNull,
    useFormObject,
    useFormArray,
    useForm,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    gql,
    useQuery,
    useMutation,
} from '@apollo/client';
import {
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    read,
    type WorkBook,
} from 'xlsx';
import {
    useAlert,
    Pager,
    Button,
    Modal,
    Container,
    useBooleanState,
    ListView,
} from '@the-deep/deep-ui';

import GalleryFileUpload from '#components/GalleryFileUpload';
import {
    ReportXlsxCsvFileMetadataQuery,
    ReportXlsxCsvFileMetadataQueryVariables,
    XlsxCsvFilesListQuery,
    XlsxCsvFilesListQueryVariables,
    CreateReportFileMutation,
    CreateReportFileMutationVariables,
    AnalysisReportVariableInputType,
    AnalysisReportUploadMetadataInputType,
    AnalysisReportUploadMetadataXlsxInputType,
} from '#generated/types';

import {
    categorizeData,
    getColumnType,
    getCompleteness,
    getColumnsFromWorkSheet,
    getRawDataForWorkSheet,
} from '../../utils';
import { DeepReplace } from '../../schema';
import DatasetItem from './DatasetItem';
import SheetItem from './SheetItem';
import styles from './styles.css';

const XLSX_CSV_FILES = gql`
    query XlsxCsvFilesList(
        $projectId: ID!,
        $reportId: ID!,
        $activePage: Int,
        $pageSize: Int,
    ) {
        project(id: $projectId) {
            analysisReportUploads(
                types: [CSV, XLSX],
                page: $activePage,
                pageSize: $pageSize,
                report: [$reportId],
            ) {
                page
                pageSize
                results {
                    id
                    file {
                        title
                        id
                    }
                    type
                }
                totalCount
            }
        }
    }
`;

const REPORT_XLSX_CSV_FILE_METADATA = gql`
    query ReportXlsxCsvFileMetadata(
        $reportUploadId: ID!,
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            analysisReportUpload(id: $reportUploadId) {
                id
                file {
                    id
                    file {
                        name
                        url
                    }
                    title
                }
                type
                metadata {
                    csv {
                        headerRow
                        variables {
                            clientId
                            completeness
                            name
                            type
                        }
                    }
                    xlsx {
                        sheets {
                            clientId
                            headerRow
                            name
                            variables {
                                clientId
                                completeness
                                name
                                type
                            }
                        }
                    }
                }
            }
        }
    }
`;

const CREATE_REPORT_FILE = gql`
    mutation CreateReportFile(
        $projectId: ID!,
        $data: AnalysisReportUploadInputType!,
    ) {
        project(id: $projectId) {
            id
            analysisReportUploadCreate(
                data: $data,
            ) {
                ok
                errors
                result {
                    id
                    file {
                        id
                        title
                        mimeType
                        metadata
                        file {
                            url
                            name
                        }
                    }
                    metadata {
                        csv {
                            headerRow
                            variables {
                                completeness
                                name
                                type
                            }
                        }
                        geojson {
                            variables {
                                completeness
                                name
                                type
                            }
                        }
                        xlsx {
                            sheets {
                                headerRow
                                name
                                variables {
                                    completeness
                                    name
                                    type
                                }
                            }
                        }
                    }
                    report
                    type
                }
            }
        }
    }
`;

type DatasetItemType = NonNullable<NonNullable<NonNullable<XlsxCsvFilesListQuery['project']>['analysisReportUploads']>['results']>[number];
const datasetKeySelector = (item: DatasetItemType) => item.id;

type InitialFormType = PartialForm<PurgeNull<AnalysisReportUploadMetadataInputType>>;
type InitialSheetType = PartialForm<NonNullable<NonNullable<NonNullable<AnalysisReportUploadMetadataXlsxInputType>['sheets']>[number]>>;
type FinalSheetType = PartialForm<Omit<InitialSheetType, 'clientId'>> & { clientId: string };

type InitialVariableType = NonNullable<InitialSheetType['variables']>[number];
type FinalVariableType = PartialForm<Omit<AnalysisReportVariableInputType, 'clientId'>> & { clientId: string };

type PartialFormType = DeepReplace<
    DeepReplace<InitialFormType, InitialSheetType, FinalSheetType>,
    InitialVariableType,
    FinalVariableType
>;
export type SheetType = NonNullable<NonNullable<PartialFormType['xlsx']>['sheets']>[number];
export type VariableType = NonNullable<NonNullable<NonNullable<NonNullable<PartialFormType['xlsx']>['sheets']>[number]>['variables']>[number];
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type XlsxFormType = NonNullable<PartialFormType['xlsx']>;
type XlsxFormSchema = ObjectSchema<XlsxFormType, PartialFormType>;
type XlsxFormSchemaFields = ReturnType<XlsxFormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        xlsx: {
            fields: (): XlsxFormSchemaFields => ({
                sheets: {
                    keySelector: (sheet) => sheet.clientId,
                    member: () => ({
                        fields: () => ({
                            name: [requiredCondition],
                            clientId: [requiredCondition],
                            headerRow: [requiredCondition],
                            variables: {
                                keySelector: (column: VariableType) => column.clientId,
                                member: () => ({
                                    fields: () => ({
                                        name: [requiredCondition],
                                        clientId: [requiredCondition],
                                        type: [requiredCondition],
                                        completeness: [],
                                    }),
                                }),
                            },
                        }),
                    }),
                },
            }),
        },
        csv: [],
        geojson: [],
    }),
};

const MAX_ITEMS_PER_PAGE = 10;
const defaultValue: PartialFormType = {};

const sheetKeySelector = (sheet: SheetType) => sheet.clientId;

interface Props {
    className?: string;
}

function DatasetsConfigureButton(props: Props) {
    const {
        className,
    } = props;

    const alert = useAlert();
    const {
        reportId,
        projectId,
    } = useParams<{
        projectId: string | undefined,
        reportId: string | undefined,
    }>();

    const [activePage, setActivePage] = useState(1);
    const [uploadedFileId, setUploadedFileId] = useState<string>();
    const [workbook, setWorkbook] = useState<WorkBook>();

    const [
        datasetToConfigure,
        setDatasetToConfigure,
    ] = useState<string | undefined>(undefined);

    const [
        modalVisibility,
        showModal,
        hideModal,
    ] = useBooleanState(false);

    const {
        setFieldValue,
        value,
        setValue,
        validate,
        setError,
        pristine,
    } = useForm(schema, defaultValue);

    const setXlsxFieldValue = useFormObject<'xlsx', XlsxFormType>('xlsx', setFieldValue, {});
    const {
        setValue: setSheetValue,
    } = useFormArray('sheets', setXlsxFieldValue);

    const variables = useMemo(() => ((projectId && reportId) ? ({
        projectId,
        reportId,
        activePage,
        pageSize: MAX_ITEMS_PER_PAGE,
    }) : undefined), [
        reportId,
        projectId,
        activePage,
    ]);

    const {
        data: datasetsList,
        loading: datasetsListLoading,
        refetch,
    } = useQuery<XlsxCsvFilesListQuery, XlsxCsvFilesListQueryVariables>(
        XLSX_CSV_FILES,
        {
            skip: !variables,
            variables,
        },
    );

    const reportFileVariables = useMemo(() => (
        (projectId && datasetToConfigure) ? ({
            projectId,
            reportUploadId: datasetToConfigure,
        }) : undefined
    ), [
        projectId,
        datasetToConfigure,
    ]);

    useQuery<
        ReportXlsxCsvFileMetadataQuery,
        ReportXlsxCsvFileMetadataQueryVariables
    >(
        REPORT_XLSX_CSV_FILE_METADATA,
        {
            skip: !reportFileVariables,
            variables: reportFileVariables,
            onCompleted: (response) => {
                if (
                    !response
                    || !response.project
                    || !response.project.analysisReportUpload
                ) {
                    return;
                }
                setUploadedFileId(undefined);
                /* TODO: Handle this gracefully with proper error handling
                 * Not needed at this point because, we don't need to edit any further
                const {
                    file,
                } = response.project.analysisReportUpload;
                if (file?.file?.url) {
                    const workbookFromUrl = read(
                        await (await fetch(file?.file?.url)).arrayBuffer(),
                    );
                    setWorkbook(workbookFromUrl);
                }
                */
                const newVal = removeNull(
                    response.project.analysisReportUpload.metadata as PartialFormType,
                );
                setValue(newVal);
            },
        },
    );

    const [
        uploadAttachment,
    ] = useMutation<CreateReportFileMutation, CreateReportFileMutationVariables>(
        CREATE_REPORT_FILE,
        {
            onCompleted: (response) => {
                if (!response || !response.project?.analysisReportUploadCreate?.result) {
                    alert.show(
                        'Failed to upload file.',
                        { variant: 'error' },
                    );
                    return;
                }

                const {
                    ok,
                    result,
                    errors,
                } = response.project.analysisReportUploadCreate;

                if (errors) {
                    alert.show(
                        'Failed to upload file.',
                        { variant: 'error' },
                    );
                } else if (ok) {
                    refetch();
                    setDatasetToConfigure(result.id);
                    setUploadedFileId(undefined);
                }
            },
            onError: () => {
                alert.show(
                    'Failed to upload file.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleSubmit = useCallback(() => {
        if (!projectId || !uploadedFileId || !reportId) {
            return;
        }
        const submit = createSubmitHandler(
            validate,
            setError,
            (sheetData) => {
                uploadAttachment({
                    variables: {
                        projectId,
                        data: {
                            file: uploadedFileId,
                            report: reportId,
                            type: 'XLSX',
                            metadata: sheetData as AnalysisReportUploadMetadataInputType,
                        },
                    },
                });
            },
        );
        submit();
    }, [
        uploadedFileId,
        reportId,
        projectId,
        uploadAttachment,
        setError,
        validate,
    ]);

    const handleDatasetToConfigureChange = useCallback(
        (newDatasetToConfigure: string | undefined) => {
            setUploadedFileId(undefined);
            setWorkbook(undefined);
            setValue(defaultValue);
            setDatasetToConfigure(newDatasetToConfigure);
        },
        [setValue],
    );

    const handleFileInputChange = useCallback(
        async ({ id: newFileId }: { id: string }, file: File | undefined) => {
            if (!file) {
                return;
            }

            setDatasetToConfigure(undefined);
            setUploadedFileId(newFileId);

            try {
                const arrayB = await file.arrayBuffer();
                const newWorkbook = read(arrayB, { type: 'binary' });
                setWorkbook(newWorkbook);

                const uploadedSheets: SheetType[] = Object.keys(newWorkbook.Sheets)?.map(
                    (sheet) => {
                        const workSheet = newWorkbook.Sheets[sheet];
                        const rawColumns = getColumnsFromWorkSheet(workSheet, 1);
                        const dataInObject = getRawDataForWorkSheet(
                            workSheet,
                            rawColumns,
                            1,
                        );

                        const columns = rawColumns.map((rawItem) => {
                            const categorizedData = categorizeData(dataInObject, rawItem);
                            const dataType = getColumnType(categorizedData);
                            return ({
                                clientId: randomString(),
                                name: rawItem,
                                type: dataType,
                                completeness: getCompleteness(categorizedData, dataType),
                            });
                        });

                        return ({
                            clientId: randomString(),
                            name: sheet,
                            headerRow: 1,
                            variables: columns,
                        });
                    },
                );
                setXlsxFieldValue(uploadedSheets, 'sheets');
            } catch {
                alert.show(
                    'There was an error parsing the excel sheet.',
                    { variant: 'error' },
                );
            }
        },
        [
            alert,
            setXlsxFieldValue,
        ],
    );

    const sheetItemRendererParams = useCallback(
        (
            _: string,
            datum: SheetType,
            index: number,
        ) => {
            const workSheet = datum.name ? workbook?.Sheets[datum.name] : undefined;
            return ({
                item: datum,
                setSheetValue,
                workSheet,
                index,
                disabled: isDefined(datasetToConfigure) && isNotDefined(workbook),
                readOnly: isDefined(datasetToConfigure),
            });
        }, [
            datasetToConfigure,
            setSheetValue,
            workbook,
        ],
    );

    const datasetRendererParams = useCallback((
        datasetId: string,
        datasetItem: DatasetItemType,
    ) => ({
        datasetId,
        title: datasetItem.file.title,
        active: datasetToConfigure === datasetId,
        onClick: handleDatasetToConfigureChange,
    }), [
        handleDatasetToConfigureChange,
        datasetToConfigure,
    ]);

    return (
        <>
            <Button
                className={className}
                name={undefined}
                onClick={showModal}
                variant="tertiary"
            >
                Configure
            </Button>
            {modalVisibility && (
                <Modal
                    className={styles.modal}
                    size="large"
                    heading="Manage datasets"
                    onCloseButtonClick={hideModal}
                    bodyClassName={styles.modalBody}
                >
                    <Container
                        heading="Uploaded files"
                        headingSize="extraSmall"
                        headerActions={(
                            <GalleryFileUpload
                                title="Upload excel"
                                onSuccess={handleFileInputChange}
                                projectIds={projectId ? [projectId] : undefined}
                                acceptFileType=".xlsx"
                                buttonOnly
                            />
                        )}
                        className={styles.leftContainer}
                    >
                        <ListView
                            data={datasetsList?.project?.analysisReportUploads?.results}
                            renderer={DatasetItem}
                            keySelector={datasetKeySelector}
                            rendererParams={datasetRendererParams}
                            pending={datasetsListLoading}
                            errored={false}
                            filtered={false}
                        />
                        <Pager
                            activePage={activePage}
                            itemsCount={
                                datasetsList?.project?.analysisReportUploads?.totalCount ?? 0
                            }
                            maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                            onActivePageChange={setActivePage}
                            itemsPerPageControlHidden
                            pageNextPrevControlHidden
                            pagesControlLabelHidden
                            infoVisibility="hidden"
                        />
                    </Container>
                    <div className={styles.rightContainer}>
                        <ListView
                            data={value?.xlsx?.sheets}
                            renderer={SheetItem}
                            keySelector={sheetKeySelector}
                            rendererParams={sheetItemRendererParams}
                            className={styles.sheets}
                            pending={false}
                            errored={false}
                            filtered={false}
                        />
                        {isNotDefined(datasetToConfigure) && (
                            <div className={styles.footer}>
                                <Button
                                    className={styles.saveButton}
                                    name={undefined}
                                    onClick={handleSubmit}
                                    disabled={pristine}
                                >
                                    Save
                                </Button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </>
    );
}

export default DatasetsConfigureButton;
