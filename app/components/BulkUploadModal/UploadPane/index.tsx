import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { produce } from 'immer';

import {
    List,
    Container,
    QuickActionButton,
    Header,
} from '@the-deep/deep-ui';
import { IoRefresh, IoTrashOutline } from 'react-icons/io5';
import _ts from '#ts';

import { RawSource, FileUploadResponse } from '../types';

import LocalFilesUpload from './LocalFilesUpload';
import GoogleDriveFilesUpload from './GoogleDriveFilesUpload';
import DropboxFilesUpload from './DropboxFilesUpload';
import UploadItem from './UploadItem';
import styles from './styles.css';

const PARALLEL_REQUESTS = 3;

const uploadItemKeySelector = (d: RawSource): string => d.key;

interface Props {
    onSuccess: (item: FileUploadResponse) => void;
    className?: string;
}

function UploadPane(props: Props) {
    const {
        className,
        onSuccess,
    } = props;

    // FIXME: rewrite these using reducers
    const [rawSources, setRawSources] = useState<RawSource[]>([]);
    const [failedRawSources, setFailedRawSources] = useState<RawSource[]>([]);

    const handleAddRawSource = useCallback(
        (values: RawSource[]) => {
            setRawSources((oldRawSources: RawSource[]) => ([
                ...oldRawSources,
                ...values,
            ]));
        },
        [],
    );

    const handleRemoveRawSource = useCallback(
        (key: string) => {
            setRawSources((oldState: RawSource[]) => {
                const updatedState = produce(oldState, (safeState) => {
                    const index = safeState.findIndex(
                        (rawSource: RawSource) => rawSource.key === key,
                    );
                    if (index !== -1) {
                        // eslint-disable-next-line no-param-reassign
                        safeState.splice(index, 1);
                    }
                });
                return updatedState;
            });
        },
        [],
    );

    const handleUploadFailure = useCallback(
        (key: string) => {
            handleRemoveRawSource(key);
            const failedRawSource = rawSources.find((v) => v.key === key);
            if (failedRawSource) {
                setFailedRawSources((oldRawSources) => ([
                    ...oldRawSources,
                    failedRawSource,
                ]));
            }
        },
        [rawSources, handleRemoveRawSource],
    );

    const handleUploadSuccess = useCallback(
        (key: string, response: FileUploadResponse) => {
            handleRemoveRawSource(key);
            onSuccess(response);
        },
        [onSuccess, handleRemoveRawSource],
    );

    const handleUploadRetry = useCallback(
        (key: string) => {
            const failedRawSource = failedRawSources.find((v) => v.key === key);
            if (failedRawSource) {
                handleAddRawSource([failedRawSource]);
            }
            setFailedRawSources((oldState: RawSource[]) => {
                const updatedState = produce(oldState, (safeState) => {
                    const index = safeState.findIndex((file: RawSource) => file.key === key);
                    if (index !== -1) {
                        // eslint-disable-next-line no-param-reassign
                        safeState.splice(index, 1);
                    }
                });
                return updatedState;
            });
        },
        [handleAddRawSource, failedRawSources],
    );

    const handleUploadClear = useCallback(
        (key: string) => {
            setFailedRawSources((oldState: RawSource[]) => {
                const updatedState = produce(oldState, (safeState) => {
                    const index = safeState.findIndex((file: RawSource) => file.key === key);
                    if (index !== -1) {
                        // eslint-disable-next-line no-param-reassign
                        safeState.splice(index, 1);
                    }
                });
                return updatedState;
            });
        },
        [handleAddRawSource, failedRawSources],
    );

    const handleUploadRetryAll = useCallback(
        () => {
            handleAddRawSource(failedRawSources);
            setFailedRawSources([]);
        },
        [failedRawSources, handleAddRawSource],
    );

    const handleUploadClearAll = useCallback(
        () => {
            setFailedRawSources([]);
        },
        [failedRawSources, handleAddRawSource],
    );


    const uploadItemRendererParams = useCallback(
        (_: string, data: RawSource, index: number) => ({
            data,
            active: index < PARALLEL_REQUESTS,
            onSuccess: handleUploadSuccess,
            onFailure: handleUploadFailure,
        }),
        [
            handleUploadSuccess,
            handleUploadFailure,
        ],
    );

    const failedUploadItemRendererParams = useCallback(
        (_: string, data: RawSource) => ({
            data,
            active: false,
            hasFailed: true,
            onRetry: handleUploadRetry,
            onClear: handleUploadClear,
            onSuccess: handleUploadSuccess,
        }), [
            handleUploadSuccess,
            handleUploadRetry,
        ],
    );

    return (
        <Container
            className={_cs(styles.upload, className)}
            heading={_ts('bulkUpload', 'uploadFilesTitle')}
            contentClassName={styles.content}
            headingSize="small"
            sub
            horizontallyCompactContent
        >
            <LocalFilesUpload
                className={styles.uploadItem}
                onAdd={handleAddRawSource}
            />
            <GoogleDriveFilesUpload
                className={styles.uploadItem}
                onAdd={handleAddRawSource}
            />
            <DropboxFilesUpload
                className={styles.uploadItem}
                onAdd={handleAddRawSource}
            />
            <div className={styles.rawSources}>
                {rawSources.length > 0 && (
                    <Header
                        heading={`Uploads (${rawSources.length})`}
                        headingSize="extraSmall"
                    />
                )}
                <List
                    data={rawSources}
                    rendererClassName={styles.uploadItem}
                    renderer={UploadItem}
                    keySelector={uploadItemKeySelector}
                    rendererParams={uploadItemRendererParams}
                />
                {failedRawSources.length > 0 && (
                    <Header
                        heading={`Failed Uploads (${failedRawSources.length})`}
                        headingSize="extraSmall"
                        actions={(
                            <>
                                <QuickActionButton
                                    name={undefined}
                                    title="Retry failed uploads"
                                    onClick={handleUploadRetryAll}
                                >
                                    <IoRefresh />
                                </QuickActionButton>
                                <QuickActionButton
                                    name={undefined}
                                    title="Clear failed uploads"
                                    onClick={handleUploadClearAll}
                                >
                                    <IoTrashOutline />
                                </QuickActionButton>
                            </>
                        )}
                    />
                )}
                <List
                    data={failedRawSources}
                    rendererClassName={styles.uploadItem}
                    renderer={UploadItem}
                    keySelector={uploadItemKeySelector}
                    rendererParams={failedUploadItemRendererParams}
                />
            </div>
        </Container>
    );
}

export default UploadPane;
