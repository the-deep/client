import React, { useCallback, useState } from 'react';
import { IoCloudUpload } from 'react-icons/io5';
import {
    type PartialForm,
    type ObjectSchema,
    type PurgeNull,
    requiredCondition,
    useFormObject,
    useFormArray,
    useForm,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import { read, utils } from 'xlsx';
import {
    useAlert,
    Button,
    Modal,
    Container,
    useBooleanState,
    FileInput,
    ListView,
} from '@the-deep/deep-ui';

import {
    AnalysisReportVariableInputType,
    AnalysisReportUploadMetadataInputType,
    AnalysisReportUploadMetadataXlsxInputType,
} from '#generated/types';

import { DeepReplace } from '../../schema';
import SheetItem from './SheetItem';
import styles from './styles.css';

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
                            headerRow: [],
                        }),
                        variables: {
                            keySelector: (column: VariableType) => column.clientId,
                            member: () => ({
                                fields: () => ({
                                    name: [requiredCondition],
                                    clientId: [requiredCondition],
                                    type: [],
                                    completeness: [],
                                }),
                            }),
                        },
                    }),
                },
            }),
        },
        csv: [],
        geojson: [],
    }),
};

const defaultValue: PartialFormType = {};

const sheetKeySelector = (sheet: SheetType) => sheet.clientId;

interface Props {
    className?: string;
}

function DatasetsConfigureButton(props: Props) {
    const {
        className,
    } = props;

    const {
        setFieldValue,
        // value,
        validate,
        setError,
    } = useForm(schema, defaultValue);

    const setXlsxFieldValue = useFormObject<'xlsx', XlsxFormType>('xlsx', setFieldValue, {});

    const {
        setValue: setSheetValue,
    } = useFormArray('sheets', setXlsxFieldValue);

    const [
        datasetToConfigure,
        setDatasetToConfigure,
    ] = useState<string | undefined>(undefined);

    const [
        modalVisibility,
        showModal,
        hideModal,
    ] = useBooleanState(false);
    const alert = useAlert();

    const [sheets, setSheets] = useState<SheetType[]>([]);

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (sheetData) => {
                console.log('value', sheetData);
            },
        );
        submit();
    }, [
        setError,
        validate,
    ]);

    const handleFileInputChange = useCallback(
        async (fileValue: File | null | undefined) => {
            if (!fileValue) {
                return;
            }

            try {
                const arrayB = await fileValue.arrayBuffer();
                const workbook = read(arrayB, { type: 'binary' });

                const uploadedSheets: SheetType[] = Object.keys(workbook.Sheets)?.map((sheet) => {
                    const rawData = utils.sheet_to_json(workbook.Sheets[sheet], { header: 1 });
                    const columns = (rawData[0] as string[]).map((item) => ({
                        clientId: randomString(),
                        name: item,
                    }));
                    return ({
                        clientId: randomString(),
                        name: sheet,
                        headerRow: 2,
                        variables: columns,
                    });
                });
                setSheets(uploadedSheets);
            } catch {
                alert.show(
                    'There was an error parsing the excel sheet.',
                    { variant: 'error' },
                );
            }
        },
        [alert],
    );

    const sheetItemRendererParams = useCallback(
        (
            _: string,
            datum: SheetType,
            index: number,
        ) => ({
            item: datum,
            setSheetValue,
            index,
        }), [
            setSheetValue,
        ],
    );

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
                    size="large"
                    heading="Configure Datasets"
                    onCloseButtonClick={hideModal}
                    bodyClassName={styles.modalBody}
                    footerActions={(
                        <>
                            <Button
                                name={undefined}
                                onClick={hideModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                name={undefined}
                                onClick={handleSubmit}
                                variant="nlp-primary"
                            >
                                Save
                            </Button>
                        </>
                    )}
                >
                    <Container
                        heading="Existing Datasets"
                        headerActions={(
                            <Button
                                name={undefined}
                                variant="tertiary"
                                onClick={setDatasetToConfigure}
                            >
                                Upload
                            </Button>
                        )}
                        className={styles.leftContainer}
                    >
                        Here
                    </Container>
                    <div className={styles.rightContainer}>
                        {isNotDefined(datasetToConfigure) && (
                            <FileInput
                                name={undefined}
                                label="Upload file"
                                value={null}
                                onChange={handleFileInputChange}
                                status={undefined}
                                overrideStatus
                                title="Upload File"
                                maxFileSize={100}
                            >
                                <IoCloudUpload />
                            </FileInput>
                        )}
                        <ListView
                            data={sheets}
                            renderer={SheetItem}
                            keySelector={sheetKeySelector}
                            rendererParams={sheetItemRendererParams}
                            className={styles.sheets}
                            pending={false}
                            errored={false}
                            filtered={false}
                        />
                    </div>
                </Modal>
            )}
        </>
    );
}

export default DatasetsConfigureButton;
