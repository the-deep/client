import React, { useState, useCallback } from 'react';
import { Button, List, TextInput } from '@the-deep/deep-ui';
import { IoAddCircleOutline } from 'react-icons/io5';
import { isValidUrl, randomString } from '@togglecorp/fujs';

import { AssessmentRegistryDocumentTypeEnum, GalleryFileType } from '#generated/types';

import AryFileUpload from './AryFileUpload';
import UploadItem from './UploadItem';
import { PartialAdditonalDocument } from '../../formSchema';

import styles from './styles.css';

const fileKeySelector = (d: PartialAdditonalDocument): string => d.clientId;

interface Props {
    name: AssessmentRegistryDocumentTypeEnum;
    title: string;
    acceptFileType?: string;
    onSuccess: (
        v: GalleryFileType,
        documentType: AssessmentRegistryDocumentTypeEnum,
        externalLink?: string,
    ) => void;
    handleFileRemove: (key: string) => void;
    onChangeSelectedDocument: (key: string) => void;
    showLink?: boolean;
    files?: PartialAdditonalDocument[];
    uploadItems?: GalleryFileType[];
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
        files,
        uploadItems,
    } = props;

    const [externalLink, setExternalLink] = useState<string>();
    const [checkUrl, setCheckUrl] = useState<boolean>(false);

    const handleExternalLinkAdd = useCallback(() => {
        const obj = {
            id: randomString(),
            file: undefined,
        } as GalleryFileType;
        const isUrl = isValidUrl(externalLink ?? '');

        if (isUrl) {
            onSuccess(obj, name, externalLink);
            setCheckUrl(false);
            setExternalLink(undefined);
            return;
        }
        setCheckUrl(true);
    }, [
        name,
        externalLink,
        setExternalLink,
        onSuccess,
    ]);

    const fileRendererParams = useCallback(
        (_: string, data: PartialAdditonalDocument) => ({
            data,
            onRemoveFile: handleFileRemove,
            onChangeSelectedDocument,
            uploadItems,
        }), [handleFileRemove, onChangeSelectedDocument, uploadItems],
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
                                error={checkUrl ? 'Invalid url' : undefined}
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
                    name={name}
                    onSuccess={onSuccess}
                />
            </div>
            <div className={styles.files}>
                {(files?.length === 0) && (
                    <div className={styles.emptyMessage}>Upload files here</div>
                )}
                <List
                    data={files}
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
