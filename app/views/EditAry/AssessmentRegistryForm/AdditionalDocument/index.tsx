import React, { useCallback, useMemo, useState } from 'react';
import { EntriesAsList, Error, getErrorObject, getErrorString } from '@togglecorp/toggle-form';
import { TextArea } from '@the-deep/deep-ui';
import { isDefined } from '@togglecorp/fujs';

import { GalleryFileType } from '#generated/types';

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
    setUploadedList: React.Dispatch<React.SetStateAction<GalleryFileType[] | undefined>>;
    uploadedList?: GalleryFileType[];
}

function AdditionalDocument(props: Props) {
    const {
        value: formValue,
        setFieldValue,
        error: riskyError,
        disabled,
        readOnly,
        uploadedList,
        setUploadedList,
    } = props;

    const error = getErrorObject(riskyError);
    const [selectedDocument, setSelectedDocument] = useState<string>();

    const handleFileUploadSuccess = useCallback(
        (
            formFile: NonNullable<PartialFormType['additionalDocuments']>[number],
            uploadedValue?: GalleryFileType,
        ) => {
            setFieldValue(
                (oldVal: PartialFormType['additionalDocuments']) => ([
                    ...(oldVal ?? []),
                    formFile,
                ]),
                'additionalDocuments',
            );
            if (isDefined(uploadedValue)) {
                setUploadedList((prev) => ([
                    ...(prev ?? []),
                    uploadedValue,
                ]));
            }
        },
        [setFieldValue, setUploadedList],
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
        );

        const questionare = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'QUESTIONNAIRE',
        );

        const miscellaneous = formValue.additionalDocuments?.filter(
            (val) => val.documentType === 'MISCELLANEOUS',
        );

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
                value={assessmentFiles}
                uploadedList={uploadedList}
                showLink
            />
            <FileUpload
                title="Questionare"
                name="QUESTIONNAIRE"
                onSuccess={handleFileUploadSuccess}
                handleFileRemove={handleFileRemove}
                onChangeSelectedDocument={setSelectedDocument}
                acceptFileType=".pdf"
                value={questionareFiles}
                uploadedList={uploadedList}
            />
            <FileUpload
                title="Miscellaneous"
                name="MISCELLANEOUS"
                onSuccess={handleFileUploadSuccess}
                handleFileRemove={handleFileRemove}
                onChangeSelectedDocument={setSelectedDocument}
                value={miscellaneousFiles}
                uploadedList={uploadedList}
            />
            {selectedDocument && (
                <Preview
                    link={linkSelected}
                    attachmentId={selectedDocument}
                    onChangeSelectedAttachment={setSelectedDocument}
                    uploadedList={uploadedList}
                />
            )}
        </div>
    );
}

export default AdditionalDocument;
