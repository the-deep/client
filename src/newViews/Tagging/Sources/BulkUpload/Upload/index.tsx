import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { FaGoogleDrive } from 'react-icons/fa';
import { IoLogoDropbox } from 'react-icons/io5';

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
    supportedDropboxExtension,
} from '../utils';

import GoogleDrivePicker from './GoogleDrivePicker';
import DropboxPicker from './DropboxPicker';
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
    const handleDropboxSuccess = (files: Dropbox.ChooserFile[]) => {
        console.warn('files', files); // FIXME this will be removed
    };

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
            <DropboxPicker
                className={styles.dropboxPicker}
                onSuccess={handleDropboxSuccess}
                multiselect
                extensions={supportedDropboxExtension}
                icons={<IoLogoDropbox />}
                iconsClassName={styles.icon}
            >
                {_ts('addLeads.sourceButtons', 'dropboxLabel')}
            </DropboxPicker>
        </Container>
    );
}

export default Upload;
