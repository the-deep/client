import React, { useCallback, useMemo, useState } from 'react';
import { EntriesAsList, Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';
import { TextArea } from '@the-deep/deep-ui';
import { isDefined } from '@togglecorp/fujs';

import FileUpload from './FileUpload';
import { PartialFormType } from '../formSchema';
import Preview from './Preview';
import styles from './styles.css';

interface Props {
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
}

function AdditionalDocument(props: Props) {
    const {
        value: formValue,
        setFieldValue,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);
    const [selectedDocument, setSelectedDocument] = useState<string | undefined>();

    const handleFileUploadSuccess = useCallback(
        (val, documentType) => {
            const formObj = {
                clientId: val.id,
                file: val.id,
                documentType,
            };
            setFieldValue(
                (oldVal: PartialFormType['additionalDocuments']) => ([
                    ...(oldVal ?? []),
                    formObj,
                ]),
                'additionalDocuments',
            );
        },
        [setFieldValue],
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
        ).map((i) => i.file)?.filter(isDefined);

        const questionare = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'QUESTIONNAIRE',
        ).map((i) => i.file)?.filter(isDefined);

        const miscellaneous = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'MISCELLANEOUS',
        ).map((i) => i.file)?.filter(isDefined);

        return [
            dataset,
            questionare,
            miscellaneous,
        ];
    }, [formValue]);

    console.log('items', miscellaneousFiles);

    return (
        <div className={styles.additionalDocument}>
            <TextArea
                labelContainerClassName={styles.labelContainer}
                label="Executive Summary"
                name="executiveSummary"
                value={formValue.executiveSummary}
                onChange={setFieldValue}
                error={getErrorString(error?.executiveSummary)}
                autoSize
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
            />
            <FileUpload
                title="Questionare"
                name="QUESTIONNAIRE"
                onSuccess={handleFileUploadSuccess}
                handleFileRemove={handleFileRemove}
                onChangeSelectedDocument={setSelectedDocument}
                acceptFileType=".pdf"
                files={questionareFiles}
            />
            <FileUpload
                title="Miscellaneous"
                name="MISCELLANEOUS"
                onSuccess={handleFileUploadSuccess}
                handleFileRemove={handleFileRemove}
                onChangeSelectedDocument={setSelectedDocument}
                files={miscellaneousFiles}
            />
            {selectedDocument && (
                <Preview
                    attachmentId={selectedDocument}
                    onChangeSelectedAttachment={setSelectedDocument}
                />
            )}
        </div>
    );
}

export default AdditionalDocument;
