import React, { useState, useCallback } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import {
    List,
} from '@the-deep/deep-ui';
import { FaGoogleDrive } from 'react-icons/fa';
import useBatchActivate from '#hooks/useBatchActivate';
import _ts from '#ts';

import {
    googleDriveClientId,
    googleDriveDeveloperKey,
} from '#config/google-drive';
import {
    supportedGoogleDriveMimeTypes,
} from '../../utils';
import GoogleDrivePicker from './GoogleDrivePicker';
import UploadItem from '../UploadItem';
import { FileLike, GoogleFile } from '../../types';

import styles from './styles.scss';

const fileKeySelector = (d: GoogleFile): string => d.key;

interface Props {
    className?: string;
    noOfParallelUploads?: number;
    onChange: (v: FileLike[]) => void;
    onSuccess: (v: FileLike) => void;
}

function GoogleDriveFilesUpload(props: Props) {
    const {
        className,
        noOfParallelUploads = 1,
        onChange,
        onSuccess,
    } = props;

    const [files, setFiles] = useState<GoogleFile[]>([]);
    const [accessToken, setAccessToken] = useState<string>();

    const { incrementCount, isActive } = useBatchActivate(noOfParallelUploads);

    const handleSuccess = useCallback((value: FileLike) => {
        incrementCount();
        onSuccess(value);
    }, [
        incrementCount,
        onSuccess,
    ]);

    const bodyTransformer = useCallback((ctx: GoogleFile) => ({
        title: ctx.name,
        mimeType: ctx.mimeType,
        fileId: ctx.id,
        accessToken,
    }), [accessToken]);

    const fileRendererParams = useCallback((_: string, data: GoogleFile, index: number) => ({
        data,
        url: 'server://files-google-drive/',
        bodyTransformer,
        active: isActive(index),
        onSuccess: handleSuccess,
        onFailure: incrementCount,
    }), [
        incrementCount,
        isActive,
        handleSuccess,
        bodyTransformer,
    ]);

    const addFilesFromGoogleDrive = (response: google.picker.ResponseObject) => {
        const { docs, action } = response;
        if (action === 'picked') {
            const values = docs.map(v => ({
                key: randomString(),
                id: v.id,
                name: v.name,
                isUploaded: false,
                mimeType: v.mimeType,
            }));
            setFiles((oldFiles: GoogleFile[]) => ([
                ...oldFiles,
                ...values,
            ]));
            onChange(values);
        }
    };
    const mimeTypes = supportedGoogleDriveMimeTypes.join(' ');

    return (
        <div className={_cs(styles.googleUpload, className)}>
            <GoogleDrivePicker
                className={styles.googlePicker}
                clientId={googleDriveClientId}
                developerKey={googleDriveDeveloperKey}
                onAuthenticateSuccess={setAccessToken}
                onChange={addFilesFromGoogleDrive}
                mimeTypes={mimeTypes}
                icons={<FaGoogleDrive />}
                iconsClassName={styles.icon}
                multiSelect
                navHidden
            >
                {_ts('bulkUpload', 'googleDriveLabel')}
            </GoogleDrivePicker>
            {files && files.length > 0 && (
                <List
                    data={files}
                    renderer={UploadItem}
                    keySelector={fileKeySelector}
                    rendererParams={fileRendererParams}
                />
            )}
        </div>
    );
}

export default GoogleDriveFilesUpload;
