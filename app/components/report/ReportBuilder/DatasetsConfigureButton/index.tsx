import React, { useCallback, useState } from 'react';
import {
    type PartialForm,
    type ObjectSchema,
    type PurgeNull,
    requiredCondition,
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
    ExpandableContainer,
    TextInput,
    NumberInput,
} from '@the-deep/deep-ui';

import { IoCloudUpload } from 'react-icons/io5';

import {
    AnalysisReportUploadMetadataInputType,
    AnalysisReportUploadMetadataXlsxInputType,
} from '#generated/types';

import { DeepReplace } from '../../schema';
import styles from './styles.css';

type InitialFormType = PartialForm<PurgeNull<AnalysisReportUploadMetadataInputType>>;
type InitialSheetType = PartialForm<NonNullable<NonNullable<NonNullable<AnalysisReportUploadMetadataXlsxInputType>['sheets']>[number]>>;
type SheetType = PartialForm<Omit<InitialSheetType, 'clientId'>> & { clientId: string };

type PartialFormType = DeepReplace<InitialFormType, InitialSheetType, SheetType>;
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
                    }),
                },
            }),
        },
        csv: [],
        geojson: [],
    }),
};

console.log('here', schema);

interface Props {
    className?: string;
}

function DatasetsConfigureButton(props: Props) {
    const {
        className,
    } = props;

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
                        {sheets?.map((item) => (
                            <ExpandableContainer
                                key={item.clientId}
                                heading={item.name}
                                className={styles.expandableContainer}
                                headingSize="small"
                                headerDescriptionClassName={styles.headerDescription}
                                headerDescription={(
                                    <>
                                        <TextInput
                                            name={undefined}
                                            label="Name"
                                            value={item.name}
                                            disabled
                                        />
                                        <NumberInput
                                            name={undefined}
                                            label="Header Row"
                                            value={item.headerRow}
                                        />
                                    </>
                                )}
                            >
                                {item.variables?.map((column) => (
                                    <ExpandableContainer
                                        key={column.clientId}
                                        heading={column.name}
                                        headingClassName={styles.columnHeading}
                                        className={styles.expandableContainer}
                                        headerClassName={styles.columnHeader}
                                        spacing="compact"
                                        headingSize="extraSmall"
                                        borderBelowHeader
                                    >
                                        {column.name}
                                    </ExpandableContainer>
                                ))}
                            </ExpandableContainer>
                        ))}
                    </div>
                </Modal>
            )}
        </>
    );
}

export default DatasetsConfigureButton;
