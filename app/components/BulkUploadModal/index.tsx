import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { produce } from 'immer';
import {
    Modal,
} from '@the-deep/deep-ui';

import _ts from '#ts';

import UploadPane from './UploadPane';
import Sources from './Sources';
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

    const [uploadedSources, setUploadedSources] = useState<FileUploadResponse[]>([]);

    const handleUploadSuccess = useCallback((value: FileUploadResponse) => {
        setUploadedSources((oldUploadedSources) => ([
            value,
            ...oldUploadedSources,
        ]));
    }, []);

    const handleDeleteSource = useCallback((id: number) => {
        setUploadedSources((oldState: FileUploadResponse[]) => {
            const updatedState = produce(oldState, (safeState) => {
                const index = safeState.findIndex((source: FileUploadResponse) => source.id === id);
                if (index !== -1) {
                    // eslint-disable-next-line no-param-reassign
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
            <UploadPane
                className={styles.upload}
                onSuccess={handleUploadSuccess}
            />
            <Sources
                className={styles.details}
                sources={uploadedSources}
                onDeleteSource={handleDeleteSource}
            />
        </Modal>
    );
}

export default BulkUpload;
