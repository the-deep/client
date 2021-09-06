import React, { useRef, useCallback } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import { FaGoogleDrive } from 'react-icons/fa';
import _ts from '#ts';

import { MimeTypes } from '#components/lead/LeadPreview/Preview/mimeTypes';

import { supportedGoogleDriveMimeTypes } from '../../utils';
import GoogleDrivePicker from './GoogleDrivePicker';
import { FileLike } from '../../types';

import styles from './styles.css';

// TODO: Move to config
export const isDevelopment = process.env.NODE_ENV === 'development';
const getDeveloperKey = () => {
    if (isDevelopment) {
        return 'AIzaSyDINvjHwIS_HHsb3qCgFm_2GFHKqEUwucE';
    }
    return 'AIzaSyAcaVOYWk0zGL9TVQfKXdziFI-5pEkw6X4';
};

const getClientId = () => {
    if (isDevelopment) {
        return '642927279233-98drcidvhmudgv9dh70m7k66730n9rjr.apps.googleusercontent.com';
    }
    return '642927279233-ht6v3t7h37cc4gjh336sbin6hdlup2vi.apps.googleusercontent.com';
};

export const googleDriveDeveloperKey = getDeveloperKey();
export const googleDriveClientId = getClientId();
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
                clientId={googleDriveClientId}
                developerKey={googleDriveDeveloperKey}
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
