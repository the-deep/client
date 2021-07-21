import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Container,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import { FileUploadResponse } from './types';
import Upload from './Upload';
import UploadedList from './UploadedList';
import styles from './styles.scss';

interface Props {
    className?: string;
}

function BulkUpload(props: Props) {
    const {
        className,
    } = props;

    const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);

    const handleFileUploadSuccess = useCallback((value: FileUploadResponse) => {
        setUploadedFiles(oldUploadedFiles => ([
            value,
            ...oldUploadedFiles,
        ]));
    }, []);

    return (
        <Container
            className={_cs(styles.bulkUpload, className)}
            heading={_ts('bulkUpload', 'title')}
            contentClassName={styles.content}
        >
            <Upload
                className={styles.upload}
                onSuccess={handleFileUploadSuccess}
            />
            <UploadedList
                className={styles.details}
                files={uploadedFiles}
            />
        </Container>
    );
}

export default BulkUpload;
