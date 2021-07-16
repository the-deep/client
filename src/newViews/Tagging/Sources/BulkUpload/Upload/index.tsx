import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { FaGoogleDrive } from 'react-icons/fa';
import {
    Container,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import {
    googleDriveClientId,
    googleDriveDeveloperKey,
} from '#config/google-drive';
import {
    supportedGoogleDriveMimeTypes,
} from '../utils';

import GoogleDrivePicker from './GoogleDrivePicker';

import styles from './styles.scss';

interface Props {
    className?: string;
}

function Upload(props: Props) {
    const {
        className,
    } = props;

    const handleChange = (response: google.picker.ResponseObject) => {
        console.warn('values', response.docs);
    };

    const mimeTypes = supportedGoogleDriveMimeTypes.join(' ');
    return (
        <Container
            className={_cs(className, styles.upload)}
            heading={_ts('bulkUpload', 'uploadFilesTitle')}
            sub
            contentClassName={styles.content}
        >
            <GoogleDrivePicker
                className={styles.googlePicker}
                clientId={googleDriveClientId}
                developerKey={googleDriveDeveloperKey}
                onChange={handleChange}
                mimeTypes={mimeTypes}
                icons={<FaGoogleDrive />}
                iconsClassName={styles.icon}
                multiSelect
                navHidden
            >
                {_ts('bulkUpload', 'googleDriveLabel')}
            </GoogleDrivePicker>
        </Container>
    );
}

export default Upload;
