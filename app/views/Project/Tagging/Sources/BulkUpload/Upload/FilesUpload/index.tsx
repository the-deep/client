import React, { useCallback } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import {
    FileInput,
} from '@the-deep/deep-ui';
import { IoCloudUpload } from 'react-icons/io5';

import { FileLike } from '../../types';
import styles from './styles.css';

interface Props {
    className?: string;
    onAdd: (v: FileLike[]) => void;
}

function FilesUpload(props: Props) {
    const {
        className,
        onAdd,
    } = props;

    const handleFileInputChange = useCallback((values: File[] | null | undefined) => {
        const basicFiles = values
            ? values.map((file) => ({
                key: randomString(),
                id: file.name,
                name: file.name,
                fileType: 'disk' as const,
                file,
            }))
            : [];
        onAdd(basicFiles);
    }, [onAdd]);

    return (
        <div className={_cs(styles.filesUpload, className)}>
            <div className={styles.iconContainer}>
                <IoCloudUpload className={styles.icon} />
            </div>
            <FileInput
                className={styles.fileInput}
                inputSectionClassName={styles.inputSection}
                inputContainerClassName={styles.inputContainer}
                name="uploadFiles"
                value={null}
                onChange={handleFileInputChange}
                status="Drag and drop files here"
                overrideStatus
                multiple
            >
                Browse Files
            </FileInput>
        </div>
    );
}

export default FilesUpload;
