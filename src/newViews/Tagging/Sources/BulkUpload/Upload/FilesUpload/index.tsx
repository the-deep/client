import React, { useState, useCallback, useMemo } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import {
    FileInput,
    List,
} from '@the-deep/deep-ui';
import { IoCloudUpload } from 'react-icons/io5';
import useBatchActivate from '#hooks/useBatchActivate';
import UploadItem from '../UploadItem';
import { FileLike, FileType } from '../../types';
import styles from './styles.scss';

const fileKeySelector = (d: FileType): string => d.key;

interface Props {
    className?: string;
    noOfParallelUploads?: number;
    onChange: (v: FileLike[]) => void;
    onSuccess: (v: FileLike) => void;
}


function FilesUpload(props: Props) {
    const {
        className,
        noOfParallelUploads = 1,
        onChange,
        onSuccess,
    } = props;

    const [files, setFiles] = useState<FileType[] | null | undefined>();
    const { incrementCount, isActive } = useBatchActivate(noOfParallelUploads);

    const handleSuccess = useCallback((value: FileLike) => {
        incrementCount();
        onSuccess(value);
    }, [
        incrementCount,
        onSuccess,
    ]);

    const bodyTransformer = useCallback((ctx: FileType) => ({
        file: ctx.file,
        title: ctx.name,
        isPublic: true,
    }), []);

    const fileRendererParams = useCallback((_: string, data: FileType, index: number) => ({
        data,
        url: 'server://files/',
        isFormData: true,
        bodyTransformer,
        active: isActive(index),
        onSuccess: handleSuccess,
        onFailure: incrementCount,
    }), [
        incrementCount,
        isActive,
        handleSuccess,
        bodyTransformer,
    ]);

    const handleFileInputChange = useCallback((values: File[] | null | undefined) => {
        const basicFiles = values
            ? values.map(file => ({
                key: randomString(),
                id: file.name,
                name: file.name,
                isUploaded: false,
                file,
            }))
            : [];
        setFiles((oldFiles: FileType[] | null | undefined) => {
            if (oldFiles) {
                return [
                    ...oldFiles,
                    ...basicFiles,
                ];
            }
            return basicFiles;
        });
        onChange(basicFiles);
    }, [onChange]);

    const fileList = useMemo(() => files?.map(v => v.file), [files]);

    return (
        <div className={_cs(styles.filesUpload, className)}>
            <FileInput
                className={styles.fileInput}
                value={fileList}
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
                <List
                    data={files}
                    renderer={UploadItem}
                    keySelector={fileKeySelector}
                    rendererParams={fileRendererParams}
                />
            )}
        </div>
    );
}

export default FilesUpload;
