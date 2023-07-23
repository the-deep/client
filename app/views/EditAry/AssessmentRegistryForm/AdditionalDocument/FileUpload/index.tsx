import React, { useState, useCallback } from 'react';
import { Button, List, TextInput } from '@the-deep/deep-ui';
import { IoAddCircleOutline } from 'react-icons/io5';
import { randomString } from '@togglecorp/fujs';

import { AssessmentRegistryDocumentTypeEnum } from '#generated/types';

import AryFileUpload from './AryFileUpload';
import UploadItem from './UploadItem';
import styles from './styles.css';
import { PartialAdditonalDocument } from '../../formSchema';

const fileKeySelector = (d: PartialAdditonalDocument): string => d.clientId;

interface Props {
    name: AssessmentRegistryDocumentTypeEnum;
    title: string;
    acceptFileType?: string;
    onSuccess: (item: PartialAdditonalDocument) => void;
    handleFileRemove: (key: string) => void;
    onChangeSelectedDocument: (key: string) => void;
    showLink?: boolean;
    files?: PartialAdditonalDocument[];
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
    } = props;
    const [externalLink, setExternalLink] = useState<string>();

    const handleAddFiles = useCallback(
        (value: PartialAdditonalDocument) => {
            onSuccess(value);
        }, [onSuccess],
    );

    const removeFile = useCallback((key: string) => {
        handleFileRemove(key);
    }, [handleFileRemove]);

    const handleExternalLinkAdd = useCallback(() => {
        const obj = {
            clientId: randomString(),
            documentType: name as AssessmentRegistryDocumentTypeEnum,
            file: undefined,
            externalLink,
        };
        handleAddFiles(obj);
        setExternalLink(undefined);
    }, [
        name,
        externalLink,
        setExternalLink,
        handleAddFiles,
    ]);

    const fileRendererParams = useCallback(
        (_: string, data: PartialAdditonalDocument) => ({
            data,
            onRemoveFile: removeFile,
            onChangeSelectedDocument,
        }), [removeFile, onChangeSelectedDocument],
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
                    onSuccess={handleAddFiles}
                />
            </div>
            <div className={styles.files}>
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
