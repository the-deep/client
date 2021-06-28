import React from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import { MdFileUpload } from 'react-icons/md';
import {
    Container,
    FileInput,
    ImagePreview,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import styles from './styles.scss';

interface Props<N> {
    className?: string;
    alt: string;
    name: N;
    value: string | File | null | undefined;
    onChange: (files: File | null | undefined, name: N) => void;
}

function UploadImage<N extends string>(props: Props<N>) {
    const {
        className,
        alt,
        name,
        value,
        onChange,
    } = props;

    return (
        <Container
            className={_cs(className, styles.uploadImage)}
            sub
            heading={_ts('analyticalFramework', 'previewImageHeading')}
            contentClassName={styles.container}
        >
            { isDefined(value) ? (
                <div className={styles.content}>
                    <ImagePreview
                        className={styles.imagePreview}
                        src={(value instanceof File) ? URL.createObjectURL(value) : value}
                        hideTools
                        alt={alt}
                    />
                    <FileInput
                        className={styles.input}
                        name={name}
                        value={(value instanceof File) ? value : undefined}
                        onChange={onChange}
                        showStatus={false}
                        accept="image/*"
                    >
                        <MdFileUpload />
                        {_ts('analyticalFramework', 'uploadFrameworkImage')}
                    </FileInput>
                </div>
            ) : (
                <>
                    {_ts('analyticalFramework', 'uploadFrameworkImageText')}
                    <FileInput
                        name={name}
                        value={value}
                        onChange={onChange}
                        showStatus={false}
                        accept="image/*"
                    >
                        <MdFileUpload />
                        {_ts('analyticalFramework', 'uploadFrameworkImage')}
                    </FileInput>
                </>
            )}
        </Container>
    );
}

export default UploadImage;
