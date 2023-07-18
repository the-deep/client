import React, { useState, useCallback } from 'react';
import { produce } from 'immer';
import { List } from '@the-deep/deep-ui';

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
}

function FileUpload(props: Props) {
    const {
        onSuccess,
        name,
        acceptFileType,
        title,
        handleFileRemove,
        onChangeSelectedDocument,
    } = props;
    const [files, setFiles] = useState<FileLike[]>([]);
    const [failedFiles, setFailedFiles] = useState<FileLike[]>([]);

    const handleAddFiles = useCallback((values: FileLike[]) => {
        setFiles((oldFiles: FileLike[]) => ([
            ...oldFiles,
            ...values,
        ]));
    }, [setFiles]);

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
        active: index < noOfParallelUploads,
        onSuccess: handleSuccess,
        onFailure: handleFailure,
        onRemoveFile: removeFile,
        documentType: name,
        onChangeSelectedDocument,
    }), [
        handleSuccess,
        handleFailure,
        removeFile,
        name,
        onChangeSelectedDocument,
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
                {title}
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
