import React, { useRef, useCallback } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import { FaGoogleDrive } from 'react-icons/fa';
import _ts from '#ts';

import { MimeTypes } from '#components/lead/LeadPreview/Preview/mimeTypes';
import {
    driveDeveloperKey,
    driveClientId,
} from '#base/configs/env';

import { supportedGoogleDriveMimeTypes } from '../../utils';
import GoogleDrivePicker from './GoogleDrivePicker';
import { FileLike } from '../../types';

import styles from './styles.css';

interface Props {
    className?: string;
    onAdd: (v: FileLike[]) => void;
}

function GoogleDriveFilesUpload(props: Props) {
    const {
        className,
        onAdd,
    } = props;

    const accessToken = useRef<string | undefined>();

    const addFilesFromGoogleDrive = (response: google.picker.ResponseObject) => {
        const { docs, action } = response;
        if (action === 'picked' && accessToken.current) {
            const values = docs.map((v) => ({
                key: randomString(),
                id: v.id,
                name: v.name,
                fileType: 'google-drive' as const,
                mimeType: v.mimeType as MimeTypes,
                accessToken: accessToken.current as string,
            }));
            onAdd(values);
        }
    };
    const mimeTypes = supportedGoogleDriveMimeTypes.join(' ');

    const setAccessToken = useCallback((token: string) => {
        accessToken.current = token;
    }, []);

    return (
        <div className={_cs(styles.googleUpload, className)}>
            <GoogleDrivePicker
                className={styles.googlePicker}
                clientId={driveClientId}
                developerKey={driveDeveloperKey}
                onAuthenticateSuccess={setAccessToken}
                onChange={addFilesFromGoogleDrive}
                mimeTypes={mimeTypes}
                icons={<FaGoogleDrive />}
                iconsContainerClassName={styles.icon}
                multiSelect
                navHidden
            >
                {_ts('bulkUpload', 'googleDriveLabel')}
            </GoogleDrivePicker>
        </div>
    );
}

export default GoogleDriveFilesUpload;
