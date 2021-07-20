import React from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    Container,
} from '@the-deep/deep-ui';
import _ts from '#ts';

import FilesUpload from './FilesUpload';
import GoogleDriveFilesUpload from './GoogleDriveFilesUpload';
import DropboxFilesUpload from './DropboxFilesUpload';
import { FileLike } from '../types';
import styles from './styles.scss';

interface Props {
    className?: string;
    onUploadSuccess: (value: FileLike) => void;
    onFilesAdd: (value: FileLike[]) => void;
}

function Upload(props: Props) {
    const {
        className,
        onUploadSuccess,
        onFilesAdd,
    } = props;

    return (
        <Container
            className={_cs(styles.upload, className)}
            heading={_ts('bulkUpload', 'uploadFilesTitle')}
            contentClassName={styles.content}
            sub
        >
            <FilesUpload
                onChange={onFilesAdd}
                onSuccess={onUploadSuccess}
                className={styles.uploadItem}
            />
            <GoogleDriveFilesUpload
                onChange={onFilesAdd}
                onSuccess={onUploadSuccess}
                className={styles.uploadItem}
            />
            <DropboxFilesUpload
                onChange={onFilesAdd}
                onSuccess={onUploadSuccess}
                className={styles.uploadItem}
            />
        </Container>
    );
}

export default Upload;
