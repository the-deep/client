import React, { useState, useCallback } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import {
    List,
} from '@the-deep/deep-ui';
import { IoLogoDropbox } from 'react-icons/io5';
import useBatchActivate from '#hooks/useBatchActivate';
import _ts from '#ts';

import {
    supportedDropboxExtension,
} from '../../utils';
import DropboxPicker from './DropboxPicker';
import UploadItem from '../UploadItem';
import { FileLike, DropboxFile } from '../../types';

import styles from './styles.scss';

const fileKeySelector = (d: DropboxFile): string => d.key;

interface Props {
    className?: string;
    noOfParallelUploads?: number;
    onChange: (v: FileLike[]) => void;
    onSuccess: (v: FileLike) => void;
}

function GoogleDriveFilesUpload(props: Props) {
    const {
        className,
        noOfParallelUploads = 1,
        onChange,
        onSuccess,
    } = props;

    const [files, setFiles] = useState<DropboxFile[]>([]);

    const { incrementCount, isActive } = useBatchActivate(noOfParallelUploads);

    const handleSuccess = useCallback((value: FileLike) => {
        incrementCount();
        onSuccess(value);
    }, [
        incrementCount,
        onSuccess,
    ]);

    const bodyTransformer = useCallback((ctx: DropboxFile) => ({
        title: ctx.name,
        fileUrl: ctx.link,
    }), []);

    const fileRendererParams = useCallback((_: string, data: DropboxFile, index: number) => ({
        data,
        url: 'server://files-dropbox/',
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

    const handleDropboxSuccess = (results: Dropbox.ChooserFile[]) => {
        const values = results.map(v => ({
            key: randomString(),
            id: v.id,
            name: v.name,
            link: v.link,
            isUploaded: false,
        }));
        setFiles((oldFiles: DropboxFile[]) => ({
            ...oldFiles,
            ...values,
        }));
        onChange(values);
    };

    return (
        <div className={_cs(styles.dropboxUpload, className)}>
            <DropboxPicker
                className={styles.dropboxPicker}
                onSuccess={handleDropboxSuccess}
                multiselect
                extensions={supportedDropboxExtension}
                icons={<IoLogoDropbox />}
                iconsClassName={styles.icon}
            >
                {_ts('addLeads.sourceButtons', 'dropboxLabel')}
            </DropboxPicker>
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

export default GoogleDriveFilesUpload;
