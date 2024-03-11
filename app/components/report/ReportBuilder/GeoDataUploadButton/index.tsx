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
    randomString,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import {
    featureEach,
} from '@turf/meta';
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
    ReportGeoFileMetadataQuery,
    ReportGeoFileMetadataQueryVariables,
    GeoFilesListQuery,
    GeoFilesListQueryVariables,
    CreateReportGeoFileMutation,
    CreateReportGeoFileMutationVariables,
    AnalysisReportUploadMetadataInputType,
    AnalysisReportUploadMetadataGeoJsonInputType,
} from '#generated/types';

import {
    categorizeData,
    getColumnType,
    getCompleteness,
} from '../../utils';
import { DeepReplace } from '../../schema';
import DatasetItem from '../DatasetItem';
import VariableItem from '../VariableItem';

import styles from './styles.css';

export declare type Properties = {
    [name: string]: unknown;
} | null;

const GEO_FILES = gql`
    query GeoFilesList(
        $projectId: ID!,
        $reportId: ID!,
        $activePage: Int,
        $pageSize: Int,
    ) {
        project(id: $projectId) {
            analysisReportUploads(
                types: [GEOJSON],
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

const REPORT_GEO_FILE_METADATA = gql`
    query ReportGeoFileMetadata(
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
                    geojson {
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
`;

const CREATE_REPORT_GEO_FILE = gql`
    mutation CreateReportGeoFile(
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
                        geojson {
                            variables {
                                clientId
                                completeness
                                name
                                type
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

type DatasetItemType = NonNullable<NonNullable<NonNullable<GeoFilesListQuery['project']>['analysisReportUploads']>['results']>[number];
const datasetKeySelector = (item: DatasetItemType) => item.id;

type InitialFormType = PartialForm<PurgeNull<AnalysisReportUploadMetadataInputType>>;
type InitialVariableType = PartialForm<NonNullable<NonNullable<NonNullable<AnalysisReportUploadMetadataGeoJsonInputType>['variables']>[number]>>;
type FinalVariableType = PartialForm<Omit<InitialVariableType, 'clientId'>> & { clientId: string };

type PartialFormType = DeepReplace<InitialFormType, InitialVariableType, FinalVariableType>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type GeoFormType = NonNullable<PartialFormType['geojson']>;
type GeoFormSchema = ObjectSchema<GeoFormType, PartialFormType>;
type GeoFormSchemaFields = ReturnType<GeoFormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        geojson: {
            fields: (): GeoFormSchemaFields => ({
                variables: {
                    keySelector: (column: FinalVariableType) => column.clientId,
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
        },
        csv: [],
        xlsx: [],
    }),
};

const variableKeySelector = (column: FinalVariableType) => column.clientId;

const MAX_ITEMS_PER_PAGE = 10;
const defaultValue: PartialFormType = {};

interface Props {
    className?: string;
}

function GeoDataUploadButton(props: Props) {
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

    const setGeoFieldValue = useFormObject<'geojson', GeoFormType>('geojson', setFieldValue, {});

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
    } = useQuery<GeoFilesListQuery, GeoFilesListQueryVariables>(
        GEO_FILES,
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
        ReportGeoFileMetadataQuery,
        ReportGeoFileMetadataQueryVariables
    >(
        REPORT_GEO_FILE_METADATA,
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
    ] = useMutation<CreateReportGeoFileMutation, CreateReportGeoFileMutationVariables>(
        CREATE_REPORT_GEO_FILE,
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
            (variableData) => {
                uploadAttachment({
                    variables: {
                        projectId,
                        data: {
                            file: uploadedFileId,
                            report: reportId,
                            type: 'GEOJSON',
                            metadata: variableData as AnalysisReportUploadMetadataInputType,
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

    const handleFileInputChange = useCallback(
        async ({ id: newFileId }: { id: string }, file: File | undefined) => {
            if (!file) {
                return;
            }
            try {
                const arrayB = await file.arrayBuffer();
                const parsedJson = JSON.parse(new TextDecoder().decode(arrayB));
                const features: Properties[] = [];
                let propObject: Record<string, unknown> = {};
                featureEach(parsedJson, (feature) => {
                    features.push(feature.properties);
                    propObject = {
                        ...propObject,
                        ...(feature?.properties ?? {}),
                    };
                });
                const columns = Object.keys(propObject).map((rawItem) => {
                    const categorizedData = categorizeData(features.filter(isDefined), rawItem);
                    const dataType = getColumnType(categorizedData);
                    return ({
                        clientId: randomString(),
                        name: rawItem,
                        type: dataType,
                        completeness: getCompleteness(categorizedData, dataType),
                    });
                });
                setGeoFieldValue(columns, 'variables');
            } catch {
                alert.show(
                    'There was an error parsing the geojson file.',
                    { variant: 'error' },
                );
            }

            setDatasetToConfigure(undefined);
            setUploadedFileId(newFileId);
        },
        [
            setGeoFieldValue,
            alert,
        ],
    );

    const {
        setValue: setVariableValue,
    } = useFormArray('variables', setGeoFieldValue);

    const variableRendererParams = useCallback(
        (
            _: string,
            datum: FinalVariableType,
            variableIndex: number,
        ) => ({
            column: datum,
            setVariableValue,
            index: variableIndex,
            disabled: isDefined(datasetToConfigure),
        }), [
            datasetToConfigure,
            setVariableValue,
        ],
    );

    const datasetRendererParams = useCallback((
        datasetId: string,
        datasetItem: DatasetItemType,
    ) => ({
        datasetId,
        title: datasetItem.file.title,
        active: datasetToConfigure === datasetId,
        onClick: setDatasetToConfigure,
    }), [
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
                                title="Upload Geojson"
                                onSuccess={handleFileInputChange}
                                projectIds={projectId ? [projectId] : undefined}
                                acceptFileType=".geojson"
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
                            className={styles.variables}
                            data={value?.geojson?.variables}
                            keySelector={variableKeySelector}
                            renderer={VariableItem}
                            rendererParams={variableRendererParams}
                            filtered={false}
                            errored={false}
                            pending={false}
                            borderBetweenItem
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

export default GeoDataUploadButton;
