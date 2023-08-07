import React, { useCallback, useMemo, useState } from 'react';
import { EntriesAsList, Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';
import { TextArea } from '@the-deep/deep-ui';
import { isDefined } from '@togglecorp/fujs';

import { AssessmentRegistryDocumentTypeEnum, GalleryFileType } from '#generated/types';

import FileUpload from './FileUpload';
import { PartialFormType } from '../formSchema';
import Preview from './Preview';

import styles from './styles.css';

interface Props {
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
    disabled?: boolean;
    readOnly?: boolean;
    setUploadItems: React.Dispatch<React.SetStateAction<GalleryFileType[] | undefined>>;
    uploadItems?: GalleryFileType[];
}

function AdditionalDocument(props: Props) {
    const {
        value: formValue,
        setFieldValue,
        error: riskyError,
        disabled,
        readOnly,
        uploadItems,
        setUploadItems,
    } = props;

    const error = getErrorObject(riskyError);
    const [selectedDocument, setSelectedDocument] = useState<string | undefined>();

    const handleFileUploadSuccess = useCallback(
        (val: GalleryFileType, documentType: AssessmentRegistryDocumentTypeEnum) => {
            const newValue = {
                clientId: val.id,
                file: val.id,
                documentType,
                externalLink: '',
            };

            setFieldValue(
                (oldVal: PartialFormType['additionalDocuments']) => ([
                    ...(oldVal ?? []),
                    newValue,
                ]),
                'additionalDocuments',
            );
            setUploadItems((prev) => ([
                ...(prev ?? []),
                val,
            ]));
        },
        [setFieldValue, setUploadItems],
    );

    const handleFileRemove = useCallback(
        (key: string) => {
            setFieldValue(
                (oldVal: PartialFormType['additionalDocuments']) => oldVal?.filter(
                    (v) => v.clientId !== key,
                ) ?? [],
                'additionalDocuments',
            );
        }, [setFieldValue],
    );

    const [
        assessmentFiles,
        questionareFiles,
        miscellaneousFiles,
    ] = useMemo(() => {
        const dataset = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'ASSESSMENT_DATABASE',
        ).filter(isDefined);

        const questionare = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'QUESTIONNAIRE',
        ).filter(isDefined);

        const miscellaneous = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'MISCELLANEOUS',
        ).filter(isDefined);

        return [
            dataset,
            questionare,
            miscellaneous,
        ];
    }, [formValue]);

    const linkSelected = useMemo(
        () => formValue.additionalDocuments?.find(
            (document) => document.clientId === selectedDocument,
        )?.externalLink,
        [formValue, selectedDocument],
    );

    return (
        <div className={styles.additionalDocument}>
            <TextArea
                labelContainerClassName={styles.labelContainer}
                label="Executive Summary"
                name="executiveSummary"
                value={formValue.executiveSummary}
                onChange={setFieldValue}
                error={getErrorString(error?.executiveSummary)}
                rows={18}
                disabled={disabled}
                readOnly={readOnly}
            />
            <FileUpload
                title="Assessment Dataset"
                name="ASSESSMENT_DATABASE"
                onSuccess={handleFileUploadSuccess}
                handleFileRemove={handleFileRemove}
                onChangeSelectedDocument={setSelectedDocument}
                acceptFileType=".pdf"
                showLink
                files={assessmentFiles}
                uploadItems={uploadItems}
            />
            <FileUpload
                title="Questionare"
                name="QUESTIONNAIRE"
                onSuccess={handleFileUploadSuccess}
                handleFileRemove={handleFileRemove}
                onChangeSelectedDocument={setSelectedDocument}
                acceptFileType=".pdf"
                files={questionareFiles}
                uploadItems={uploadItems}
            />
            <FileUpload
                title="Miscellaneous"
                name="MISCELLANEOUS"
                onSuccess={handleFileUploadSuccess}
                handleFileRemove={handleFileRemove}
                onChangeSelectedDocument={setSelectedDocument}
                files={miscellaneousFiles}
                uploadItems={uploadItems}
            />
            {selectedDocument && (
                <Preview
                    link={linkSelected}
                    attachmentId={selectedDocument}
                    onChangeSelectedAttachment={setSelectedDocument}
                    uploadItems={uploadItems}
                />
            )}
        </div>
    );
}

export default AdditionalDocument;
