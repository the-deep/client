import React, { useCallback, useMemo, useState } from 'react';
import { EntriesAsList } from '@togglecorp/toggle-form';
import { Modal, TextArea } from '@the-deep/deep-ui';

import LeadPreview from '#components/lead/LeadPreview';
import { useModalState } from '#hooks/stateManagement';
import { AssessmentRegistryDocumentTypeEnum } from '#generated/types';

import FileUpload from './FileUpload';
import { FileUploadResponse } from './types';
import { PartialAdditonalDocument, PartialFormType } from '../formSchema';
import styles from './styles.css';

interface Props {
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
}

function AdditionalDocument(props: Props) {
    const {
        value: formValue,
        setFieldValue,
    } = props;

    const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<string | undefined>();
    const [
        isModalVisible,,,
        setModalVisbility,
    ] = useModalState(false);

    const handleFileUploadSuccess = useCallback(
        (key: string, val: FileUploadResponse) => {
            setUploadedFiles((oldUploadedFiles) => ([
                val,
                ...oldUploadedFiles,
            ]));

            const newDocument: PartialAdditonalDocument = {
                clientId: key,
                file: val.id,
                documentType: val.documentType as AssessmentRegistryDocumentTypeEnum,
                externalLink: val.externalLink,
            };

            setFieldValue(
                (oldVal: PartialFormType['additionalDocuments']) => [
                    ...(oldVal ?? []),
                    newDocument,
                ],
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

    const selectedAttachment = useMemo(
        () => {
            if (!selectedDocument) {
                return undefined;
            }
            const selectedData = formValue.additionalDocuments?.find(
                (doc) => doc.clientId === selectedDocument,
            );
            if (!selectedData) {
                return undefined;
            }
            const selectedFile = uploadedFiles.find(
                (doc) => doc.id === selectedData.file,
            );
            if (!selectedFile) {
                return undefined;
            }
            if (selectedFile || selectedData) {
                setModalVisbility(true);
            }

            return ({
                id: selectedFile.id,
                title: selectedFile.title,
                mimeType: selectedFile.mimeType,
                file: selectedFile.file ? { url: selectedFile.file } : undefined,
            });
        },
        [uploadedFiles, selectedDocument, formValue, setModalVisbility],
    );

    const handleModalClose = useCallback(() => {
        setSelectedDocument(undefined);
        setModalVisbility(false);
    }, [setSelectedDocument, setModalVisbility]);

    return (
        <div className={styles.additionalDocument}>
            <TextArea
                labelContainerClassName={styles.labelContainer}
                label="Executive Summary"
                name="executive_summary"
                value={undefined}
                // onChange={setFieldValue}
                // error={error.executive_summary}
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
            />
            <FileUpload
                title="Questionare"
                name="QUESTIONNAIRE"
                onSuccess={handleFileUploadSuccess}
                handleFileRemove={handleFileRemove}
                onChangeSelectedDocument={setSelectedDocument}
                acceptFileType=".pdf"
            />
            <FileUpload
                title="Miscellaneous"
                name="MISCELLANEOUS"
                onSuccess={handleFileUploadSuccess}
                handleFileRemove={handleFileRemove}
                onChangeSelectedDocument={setSelectedDocument}
            />
            {isModalVisible && (
                <Modal onCloseButtonClick={handleModalClose}>
                    <LeadPreview attachment={selectedAttachment} />
                </Modal>
            )}
        </div>
    );
}

export default AdditionalDocument;
