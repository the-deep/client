import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { produce } from 'immer';
import {
    Container,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import { FileLike } from './types';
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

    const [files, setFiles] = useState<FileLike[]>([]);

    const handleFileUploadSuccess = useCallback((value: FileLike) => {
        setFiles((oldState: FileLike[]) => {
            const updatedState = produce(oldState, (safeState) => {
                const index = safeState.findIndex((file: FileLike) => file.key === value.key);
                if (index !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeState[index] = value;
                }
            });
            return updatedState;
        });
    }, []);

    const handleAddFiles = useCallback((values: FileLike[]) => {
        setFiles((oldFiles: FileLike[]) => ([
            ...values,
            ...oldFiles,
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
                onUploadSuccess={handleFileUploadSuccess}
                onFilesAdd={handleAddFiles}
            />
            <UploadedList
                className={styles.details}
                files={files}
            />
        </Container>
    );
}

export default BulkUpload;
