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
    disabled?: boolean;
    readOnly?: boolean;
}

function AdditionalDocument(props: Props) {
    const {
        value: formValue,
        setFieldValue,
        error: riskyError,
        disabled,
        readOnly,
    } = props;

    const error = getErrorObject(riskyError);
    const [selectedDocument, setSelectedDocument] = useState<string | undefined>();

    const handleFileUploadSuccess = useCallback(
        (val, documentType) => {
            const newValue = {
                clientId: val.id ?? val.clientId,
                file: val.id,
                documentType,
                externalLink: val.externalLink,
            };

            setFieldValue(
                (oldVal: PartialFormType['additionalDocuments']) => ([
                    ...(oldVal ?? []),
                    newValue,
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
        assessmentLinks,
        questionareFiles,
        miscellaneousFiles,
    ] = useMemo(() => {
        const dataset = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'ASSESSMENT_DATABASE',
        ).map((i) => i.file)?.filter(isDefined);

        const links = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'ASSESSMENT_DATABASE' && isDefined(val.externalLink),
        );

        const questionare = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'QUESTIONNAIRE',
        ).map((i) => i.file)?.filter(isDefined);

        const miscellaneous = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'MISCELLANEOUS',
        ).map((i) => i.file)?.filter(isDefined);

        return [
            dataset,
            links,
            questionare,
            miscellaneous,
        ];
    }, [formValue]);

    const linkSelected = useMemo(
        () => formValue.additionalDocuments?.find(
            (i) => i.clientId === selectedDocument,
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
                links={assessmentLinks}
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
                    link={linkSelected}
                    attachmentId={selectedDocument}
                    onChangeSelectedAttachment={setSelectedDocument}
                />
            )}
        </div>
    );
}

export default AdditionalDocument;
