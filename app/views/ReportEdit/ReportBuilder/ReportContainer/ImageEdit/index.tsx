import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    TextInput,
} from '@the-deep/deep-ui';

import { AnalysisReportUploadType } from '#generated/types';
import FileUpload from '../../FileUpload';
import {
    type ImageConfigType,
} from '../../../schema';

import styles from './styles.css';

interface Props {
    className?: string;
    value: ImageConfigType | undefined;
    onFieldChange: (...entries: EntriesAsList<ImageConfigType>) => void;
    error?: Error<ImageConfigType>;
    disabled?: boolean;
}

function ImageEdit(props: Props) {
    const {
        className,
        value,
        onFieldChange,
        error: riskyError,
        disabled,
    } = props;

    const error = getErrorObject(riskyError);
    const handleFileUploadSuccess = useCallback((file: AnalysisReportUploadType) => {
        // FIXME: Discuss with @thenav56
        // eslint-disable-next-line no-console
        console.log('here', file);
    }, []);

    return (
        <div className={_cs(className, styles.textEdit)}>
            <div className={styles.left}>
                Left
                <FileUpload
                    onSuccess={handleFileUploadSuccess}
                    acceptFileType="image/*"
                    disabled={disabled}
                />
                <TextInput
                    value={value?.altText}
                    name="altText"
                    onChange={onFieldChange}
                    error={error?.altText}
                    disabled={disabled}
                />
                <TextInput
                    value={value?.caption}
                    name="caption"
                    onChange={onFieldChange}
                    error={error?.caption}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}

export default ImageEdit;
