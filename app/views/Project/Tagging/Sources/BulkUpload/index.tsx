import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { produce } from 'immer';
import {
    Modal,
} from '@the-deep/deep-ui';

import _ts from '#ts';

import Upload from './Upload';
import FilesUploaded from './FilesUploaded';
import { FileUploadResponse } from './types';
import styles from './styles.css';

interface Props {
    className?: string;
    onClose: () => void;
}

function BulkUpload(props: Props) {
    const {
        className,
        onClose,
    } = props;

    const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);

    const handleFileUploadSuccess = useCallback((value: FileUploadResponse) => {
        setUploadedFiles((oldUploadedFiles) => ([
            value,
            ...oldUploadedFiles,
        ]));
    }, []);

    const handleDeleteFile = useCallback((id: number) => {
        setUploadedFiles((oldState: FileUploadResponse[]) => {
            const updatedState = produce(oldState, (safeState) => {
                const index = safeState.findIndex((file: FileUploadResponse) => file.id === id);
                if (index !== -1) {
                    safeState.splice(index, 1);
                }
            });
            return updatedState;
        });
    }, []);

    return (
        <Modal
            className={_cs(className, styles.bulkUploadModal)}
            heading={_ts('bulkUpload', 'title')}
            headerClassName={styles.modalHeader}
            onCloseButtonClick={onClose}
            bodyClassName={styles.modalBody}
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
        </Modal>
    );
}

export default BulkUpload;
