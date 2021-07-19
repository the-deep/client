import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCloudUpload } from 'react-icons/io5';
import { List, FileInput } from '@the-deep/deep-ui';

import UploadItem from './UploadItem';
import styles from './styles.scss';

const fileKeySelector = (d: File): string => d.name;

interface Props {
    className?: string;
    noOfParallelUploads?: number;
}

function FileUpload(props: Props) {
    const {
        className,
        noOfParallelUploads = 1,
    } = props;

    const [files, setFiles] = useState<File[] | null | undefined>();
    const [counter, setCounter] = useState(0);

    const increment = useCallback(() => {
        setCounter((v: number) => (v + 1));
    }, []);

    const fileRendererParams = useCallback((_: string, file: File, index: number) => ({
        file,
        className: styles.item,
        active: index >= counter && index < counter + noOfParallelUploads,
        onSuccess: increment,
        onFailure: increment,
    }), [counter, noOfParallelUploads, increment]);

    const handleFileInputChange = useCallback((values: File[] | null | undefined) => {
        setFiles(values);
        setCounter(0);
    }, []);

    return (
        <div className={_cs(styles.fileUpload, className)}>
            <FileInput
                className={styles.fileInput}
                value={files}
                name="uploadFiles"
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
            {files && files.length > 0 && (
                <div className={styles.files}>
                    <List
                        data={files}
                        renderer={UploadItem}
                        keySelector={fileKeySelector}
                        rendererParams={fileRendererParams}
                    />
                </div>
            )}
        </div>
    );
}

export default FileUpload;
