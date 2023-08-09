import React, { useState, useCallback } from 'react';
import { Button, List, TextInput } from '@the-deep/deep-ui';
import { IoAddCircleOutline } from 'react-icons/io5';
import { isValidUrl, randomString } from '@togglecorp/fujs';

import { AssessmentRegistryDocumentTypeEnum, GalleryFileType } from '#generated/types';

import { PartialAdditionalDocument } from '../../formSchema';
import AryFileUpload from './AryFileUpload';
import UploadItem from './UploadItem';

import styles from './styles.css';

const fileKeySelector = (d: PartialAdditionalDocument): string => d.clientId;

interface Props {
    name: AssessmentRegistryDocumentTypeEnum;
    title: string;
    acceptFileType?: '.pdf' | 'image/*';
    onSuccess: (
        v: PartialAdditionalDocument,
        uploadedFile: GalleryFileType | undefined,
    ) => void;
    handleFileRemove: (key: string) => void;
    onChangeSelectedDocument: (key: string) => void;
    showLink?: boolean;
    value?: PartialAdditionalDocument[];
    uploadedList?: GalleryFileType[];
}

function FileUpload(props: Props) {
    const {
        onSuccess,
        name,
        acceptFileType,
        title,
        handleFileRemove,
        onChangeSelectedDocument,
        showLink,
        value,
        uploadedList,
    } = props;

    const [externalLink, setExternalLink] = useState<string>();
    const [urlError, setURLError] = useState<string>();

    const fileRendererParams = useCallback(
        (_: string, data: PartialAdditionalDocument) => ({
            data,
            onRemoveFile: handleFileRemove,
            onChangeSelectedDocument,
            uploadedList,
        }), [handleFileRemove, onChangeSelectedDocument, uploadedList],
    );

    const handleExternalLinkAdd = useCallback(() => {
        const isUrl = isValidUrl(externalLink ?? '');
        if (!isUrl) {
            setURLError('Invalid URL');
            return;
        }

        onSuccess({
            clientId: randomString(),
            file: randomString(),
            documentType: name,
            externalLink,
        }, undefined);
        setExternalLink(undefined);
    }, [
        name,
        externalLink,
        setExternalLink,
        onSuccess,
    ]);

    const handleUploadAttachment = useCallback(
        (file: GalleryFileType) => {
            onSuccess({
                clientId: file.id,
                file: file.id,
                documentType: name,
                externalLink: '',
            }, file);
        }, [onSuccess, name],
    );

    return (
        <div className={styles.uploadPane}>
            <div className={styles.uploadHeader}>
                <div className={styles.linkContent}>
                    {title}
                    {showLink && (
                        <div className={styles.linkInput}>
                            <TextInput
                                placeholder="External Link"
                                name="externalLink"
                                value={externalLink}
                                onChange={setExternalLink}
                                error={urlError}
                            />
                            <Button
                                variant="transparent"
                                name={name}
                                onClick={handleExternalLinkAdd}
                            >
                                <IoAddCircleOutline />
                            </Button>
                        </div>
                    )}
                </div>
                <AryFileUpload
                    acceptFileType={acceptFileType}
                    onSuccess={handleUploadAttachment}
                />
            </div>
            <div className={styles.files}>
                {(value?.length === 0) && (
                    <div className={styles.emptyMessage}>Upload value here</div>
                )}
                <List
                    data={value}
                    rendererClassName={styles.fileItem}
                    renderer={UploadItem}
                    keySelector={fileKeySelector}
                    rendererParams={fileRendererParams}
                />
            </div>
        </div>
    );
}

export default FileUpload;
