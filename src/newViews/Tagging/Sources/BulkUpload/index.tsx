import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { produce } from 'immer';
import {
    Container,
} from '@the-deep/deep-ui';
import _ts from '#ts';

import Upload from './Upload';
import FilesUploaded from './FilesUploaded';
import { FileUploadResponse } from './types';
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

    const handleDeleteFile = useCallback((id: number) => {
        setUploadedFiles((oldState: FileUploadResponse[]) => {
            const updatedState = produce(oldState, (safeState) => {
                const index = safeState.findIndex((file: FileUploadResponse) => file.id === id);
                if (index !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeState.splice(index, 1);
                }
            });
            return updatedState;
        });
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
            <FilesUploaded
                className={styles.details}
                files={uploadedFiles}
                onDeleteFile={handleDeleteFile}
            />
        </Container>
    );
}

export default BulkUpload;
