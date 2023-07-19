import React, { useState, useCallback } from 'react';
import { Button, List, TextInput } from '@the-deep/deep-ui';
import { IoAddCircleOutline } from 'react-icons/io5';
import { randomString } from '@togglecorp/fujs';
import { produce } from 'immer';

import { AssessmentRegistryDocumentTypeEnum } from '#generated/types';

import { FileLike, FileUploadResponse } from '../types';
import AryFileUpload from './AryFileUpload';
import UploadItem from './UploadItem';
import styles from './styles.css';

const noOfParallelUploads = 3;
const fileKeySelector = (d: FileLike): string => d.key;

interface Props {
    name: AssessmentRegistryDocumentTypeEnum;
    title: string;
    acceptFileType?: string;
    onSuccess: (key: string, item: FileUploadResponse) => void;
    handleFileRemove: (key: string) => void;
    onChangeSelectedDocument: (key: string) => void;
    showLink?: boolean;
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
    } = props;
    const [files, setFiles] = useState<FileLike[]>([]);
    const [failedFiles, setFailedFiles] = useState<FileLike[]>([]);
    const [link, setLink] = useState<string>();

    const handleAddFiles = useCallback((values: FileLike[]) => {
        setFiles((oldFiles: FileLike[]) => ([
            ...oldFiles,
            ...values,
        ]));
    }, [setFiles]);

    const handleExternalLinkAdd = useCallback(() => {
        const obj = {
            id: link,
            key: randomString(),
            name: link,
            fileType: 'dropbox',
            file: '',
            link,
        };
        handleAddFiles([obj]);
        setLink(undefined);
    }, [
        link,
        setLink,
        handleAddFiles,
    ]);

    const removeFile = useCallback((key: string) => {
        setFiles((oldState: FileLike[]) => {
            const updatedState = produce(oldState, (safeState) => {
                const index = safeState.findIndex((file: FileLike) => file.key === key);
                if (index !== -1) {
                    safeState.splice(index, 1);
                }
            });
            return updatedState;
        });
        handleFileRemove(key);
    }, [setFiles, handleFileRemove]);

    const handleRetry = useCallback((key: string) => {
        const failedFile = failedFiles.find((v) => v.key === key);
        if (failedFile) {
            handleAddFiles([failedFile]);
        }
        setFailedFiles((oldState: FileLike[]) => {
            const updatedState = produce(oldState, (safeState) => {
                const index = safeState.findIndex((file: FileLike) => file.key === key);
                if (index !== -1) {
                    safeState.splice(index, 1);
                }
            });
            return updatedState;
        });
    }, [handleAddFiles, failedFiles]);

    const handleFailure = useCallback((key: string) => {
        const failedFile = files.find((v) => v.key === key);
        if (failedFile) {
            setFailedFiles((oldFiles) => ([
                ...oldFiles,
                failedFile,
            ]));
        }
        removeFile(key);
    }, [files, removeFile]);

    const handleSuccess = useCallback((key:string, response: FileUploadResponse) => {
        onSuccess(key, response);
    }, [onSuccess]);

    const fileRendererParams = useCallback((_: string, data: FileLike, index: number) => ({
        data,
        link,
        active: index < noOfParallelUploads,
        onSuccess: handleSuccess,
        onFailure: handleFailure,
        onRemoveFile: removeFile,
        onChangeSelectedDocument,
        documentType: name,
    }), [
        handleSuccess,
        handleFailure,
        removeFile,
        onChangeSelectedDocument,
        name,
        link,
    ]);

    const failedFileRendererParams = useCallback((_: string, data: FileLike) => ({
        data,
        active: false,
        hasFailed: true,
        onRetry: handleRetry,
        onSuccess: handleSuccess,
        documentType: name,
    }), [
        handleSuccess,
        handleRetry,
        name,
    ]);

    return (
        <div className={styles.uploadPane}>
            <div className={styles.uploadHeader}>
                <div className={styles.linkContent}>
                    {title}
                    {showLink && (
                        <div className={styles.linkInput}>
                            <TextInput
                                placeholder="External Link"
                                name="link"
                                value={link}
                                onChange={setLink}
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
                    onAdd={handleAddFiles}
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
                <List
                    data={failedFiles}
                    rendererClassName={styles.fileItemFailed}
                    renderer={UploadItem}
                    keySelector={fileKeySelector}
                    rendererParams={failedFileRendererParams}
                />
            </div>
        </div>
    );
}

export default FileUpload;
