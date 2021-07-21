import React, { useCallback } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import {
    FileInput,
} from '@the-deep/deep-ui';
import { IoCloudUpload } from 'react-icons/io5';
import { FileLike } from '../../types';
import styles from './styles.scss';

interface Props {
    className?: string;
    onChange: (v: FileLike[]) => void;
}


function FilesUpload(props: Props) {
    const {
        className,
        onChange,
    } = props;

    const handleFileInputChange = useCallback((values: File[] | null | undefined) => {
        const basicFiles = values
            ? values.map(file => ({
                key: randomString(),
                id: file.name,
                name: file.name,
                fileType: 'file' as const,
                file,
            }))
            : [];
        onChange(basicFiles);
    }, [onChange]);

    return (
        <div className={_cs(styles.filesUpload, className)}>
            <FileInput
                className={styles.fileInput}
                name="uploadFiles"
                value={null}
                onChange={handleFileInputChange}
                labelContainerClassName={styles.labelContainer}
                label={(
                    <>
                        <IoCloudUpload className={styles.icon} />
                        Drag and Drop Files Here
                    </>
                )}
                showStatus={false}
                multiple
            >
                Browse Files
            </FileInput>
        </div>
    );
}

export default FilesUpload;
