import React from 'react';
import { _cs } from '@togglecorp/fujs';
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
    src?: string;
    alt: string;
    name: N;
    onChange: (files: File | null | undefined, name: N) => void;
}

function UploadImage<N extends string>(props: Props<N>) {
    const {
        className,
        src,
        alt,
        name,
        onChange,
    } = props;

    return (
        <Container
            className={_cs(className, styles.uploadImage)}
            sub
            heading={_ts('analyticalFramework', 'previewImageHeading')}
            contentClassName={styles.container}
        >
            { src ? (
                <div className={styles.content}>
                    <ImagePreview
                        className={styles.imagePreview}
                        src={src}
                        hideTools
                        alt={alt}
                    />
                    <FileInput
                        className={styles.input}
                        name={name}
                        value={undefined}
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
                        value={undefined}
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
