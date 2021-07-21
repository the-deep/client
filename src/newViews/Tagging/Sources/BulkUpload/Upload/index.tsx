import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { produce } from 'immer';

import {
    List,
    Container,
} from '@the-deep/deep-ui';
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

    const handleFailedFileSuccess = useCallback((key: string, response: FileUploadResponse) => {
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
        onSuccess(response);
    }, [onSuccess]);

    const failedFileRendererParams = useCallback((_: string, data: FileLike) => ({
        data,
        active: false,
        onSuccess: handleFailedFileSuccess,
    }), [
        handleFailedFileSuccess,
    ]);
    return (
        <Container
            className={_cs(styles.upload, className)}
            heading={_ts('bulkUpload', 'uploadFilesTitle')}
            contentClassName={styles.content}
            sub
        >
            <FilesUpload
                onChange={handleAddFiles}
                className={styles.uploadItem}
            />
            <GoogleDriveFilesUpload
                onChange={handleAddFiles}
                className={styles.uploadItem}
            />
            <DropboxFilesUpload
                onChange={handleAddFiles}
                className={styles.uploadItem}
            />
            {files && files.length > 0 && (
                <List
                    data={files}
                    rendererClassName={styles.fileItem}
                    renderer={UploadItem}
                    keySelector={fileKeySelector}
                    rendererParams={fileRendererParams}
                />
            )}
            {failedFiles && failedFiles.length > 0 && (
                <List
                    data={files}
                    rendererClassName={styles.fileItem}
                    renderer={UploadItem}
                    keySelector={fileKeySelector}
                    rendererParams={failedFileRendererParams}
                />
            )}
        </Container>
    );
}

export default Upload;
