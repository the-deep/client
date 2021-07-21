import React from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import { IoLogoDropbox } from 'react-icons/io5';
import _ts from '#ts';

import {
    supportedDropboxExtension,
} from '../../utils';
import DropboxPicker from './DropboxPicker';
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

    const handleDropboxSuccess = (results: Dropbox.ChooserFile[]) => {
        const values = results.map(v => ({
            key: randomString(),
            id: v.id,
            name: v.name,
            link: v.link,
            isUploaded: false,
            fileType: 'dropbox' as const,
        }));
        onChange(values);
    };

    return (
        <div className={_cs(styles.dropboxUpload, className)}>
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
        </div>
    );
}

export default GoogleDriveFilesUpload;
