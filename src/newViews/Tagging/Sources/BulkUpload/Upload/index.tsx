import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { produce } from 'immer';

import {
    List,
    Container,
    QuickActionButton,
    Header,
} from '@the-deep/deep-ui';
import { AiOutlineRedo } from 'react-icons/ai';
import _ts from '#ts';

import FilesUpload from './FilesUpload';
import GoogleDriveFilesUpload from './GoogleDriveFilesUpload';
import DropboxFilesUpload from './DropboxFilesUpload';
import UploadItem from './UploadItem';
import { FileLike, FileUploadResponse } from '../types';
import styles from './styles.scss';

interface Props {
    onSuccess: (item: FileUploadResponse) => void;
    className?: string;
}

const noOfParallelUploads = 3;
const fileKeySelector = (d: FileLike): string => d.key;

function Upload(props: Props) {
    const {
        className,
        onSuccess,
    } = props;

    const [files, setFiles] = useState<FileLike[]>([]);
    const [failedFiles, setFailedFiles] = useState<FileLike[]>([]);

    const handleAddFiles = useCallback((values: FileLike[]) => {
        setFiles((oldFiles: FileLike[]) => ([
            ...oldFiles,
            ...values,
        ]));
    }, []);

    const removeFile = useCallback((key: string) => {
        setFiles((oldState: FileLike[]) => {
            const updatedState = produce(oldState, (safeState) => {
                const index = safeState.findIndex((file: FileLike) => file.key === key);
                if (index !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeState.splice(index, 1);
                }
            });
            return updatedState;
        });
    }, []);

    const handleFailure = useCallback((key: string) => {
        const failedFile = files.find(v => v.key === key);
        if (failedFile) {
            setFailedFiles(oldFiles => ([
                ...oldFiles,
                failedFile,
            ]));
        }
        removeFile(key);
    }, [files, removeFile]);

    const handleSuccess = useCallback((key: string, response: FileUploadResponse) => {
        removeFile(key);
        onSuccess(response);
    }, [onSuccess, removeFile]);

    const fileRendererParams = useCallback((_: string, data: FileLike, index: number) => ({
        data,
        active: index < noOfParallelUploads,
        onSuccess: handleSuccess,
        onFailure: handleFailure,
    }), [
        handleSuccess,
        handleFailure,
    ]);

    const handleRetry = useCallback((key: string) => {
        const failedFile = failedFiles.find(v => v.key === key);
        if (failedFile) {
            handleAddFiles([failedFile]);
        }
        setFailedFiles((oldState: FileLike[]) => {
            const updatedState = produce(oldState, (safeState) => {
                const index = safeState.findIndex((file: FileLike) => file.key === key);
                if (index !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeState.splice(index, 1);
                }
            });
            return updatedState;
        });
    }, [handleAddFiles, failedFiles]);

    const failedFileRendererParams = useCallback((_: string, data: FileLike) => ({
        data,
        active: false,
        hasFailed: true,
        onRetry: handleRetry,
        onSuccess: handleSuccess,
    }), [
        handleSuccess,
        handleRetry,
    ]);

    const handleRetryAll = useCallback(() => {
        handleAddFiles(failedFiles);
        setFailedFiles([]);
    }, [failedFiles, handleAddFiles]);

    return (
        <Container
            className={_cs(styles.upload, className)}
            heading={_ts('bulkUpload', 'uploadFilesTitle')}
            contentClassName={styles.content}
            sub
        >
            <FilesUpload
                className={styles.uploadItem}
                onAdd={handleAddFiles}
            />
            <GoogleDriveFilesUpload
                className={styles.uploadItem}
                onAdd={handleAddFiles}
            />
            <DropboxFilesUpload
                className={styles.uploadItem}
                onAdd={handleAddFiles}
            />
            <div className={styles.files}>
                <List
                    data={files}
                    rendererClassName={styles.fileItem}
                    renderer={UploadItem}
                    keySelector={fileKeySelector}
                    rendererParams={fileRendererParams}
                />
                {failedFiles.length > 0 && (
                    <Header
                        heading="Failed uploads"
                        headingSize="extraSmall"
                        actions={
                            <QuickActionButton
                                name="retrigger"
                                title="Retry failed uploads"
                                onClick={handleRetryAll}
                            >
                                <AiOutlineRedo />
                            </QuickActionButton>
                        }
                    />
                )}
                <List
                    data={failedFiles}
                    rendererClassName={styles.fileItem}
                    renderer={UploadItem}
                    keySelector={fileKeySelector}
                    rendererParams={failedFileRendererParams}
                />
            </div>
        </Container>
    );
}

export default Upload;
