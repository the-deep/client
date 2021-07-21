import React, { useState } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import { FaGoogleDrive } from 'react-icons/fa';
import _ts from '#ts';

import {
    googleDriveClientId,
    googleDriveDeveloperKey,
} from '#config/google-drive';
import {
    supportedGoogleDriveMimeTypes,
} from '../../utils';
import GoogleDrivePicker from './GoogleDrivePicker';
import { FileLike } from '../../types';

import styles from './styles.scss';

interface Props {
    className?: string;
    onChange: (v: FileLike[]) => void;
}

function GoogleDriveFilesUpload(props: Props) {
    const {
        className,
        onChange,
    } = props;

    const [accessToken, setAccessToken] = useState<string>();

    const addFilesFromGoogleDrive = (response: google.picker.ResponseObject) => {
        const { docs, action } = response;
        if (action === 'picked' && accessToken) {
            const values = docs.map(v => ({
                key: randomString(),
                id: v.id,
                name: v.name,
                fileType: 'google' as const,
                mimeType: v.mimeType,
                accessToken,
            }));
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
        </div>
    );
}

export default GoogleDriveFilesUpload;
