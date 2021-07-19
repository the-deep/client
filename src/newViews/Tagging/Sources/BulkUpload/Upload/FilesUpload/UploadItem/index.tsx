import React, { useState, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useLazyRequest } from '#utils/request';
import {
    Checkbox,
} from '@the-deep/deep-ui';
import { formatBytes } from '#utils/common';
import styles from './styles.scss';

interface Option {
    id: number;
    title: string;
    file: string; // this is a url
    mimeType?: string;
    metadata?: unknown;
}

interface Props {
    className?: string;
    onSuccess: () => void;
    onFailure: () => void;
    active: boolean;
    file: File;
    isPublic?: boolean;
}

function UploadItem(props: Props) {
    const {
        className,
        onSuccess,
        onFailure,
        active,
        file,
        isPublic,
    } = props;

    const [isUploaded, setIsUploaded] = useState(false);
    const {
        trigger: uploadFile,
    } = useLazyRequest<Option, File>({
        url: 'server://files/',
        method: 'POST',
        formData: true,
        body: ctx => ({
            file: ctx,
            title: ctx.name,
            isPublic,
        }),
        onSuccess: (response) => {
            // FIXME later we will update the list of uploaded files
            console.warn('response', response);
            setIsUploaded(true);
            onSuccess();
        },
        onFailure: () => {
            setIsUploaded(false);
            onFailure();
        },
    });

    useEffect(() => {
        if (active) {
            uploadFile(file);
        }
    }, [active, uploadFile, file]);

    return (
        <div className={_cs(
            className,
            styles.item,
            isUploaded && styles.uploaded,
        )}
        >
            <Checkbox // FIXME fix type for onChange being option when readOnly
                name="uploadState"
                value={isUploaded}
                label={file.name}
                readOnly
            />
            <span className={styles.right}>{formatBytes(file.size)}</span>
        </div>
    );
}

export default UploadItem;
