import React, { memo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ImagePreview,
    TextArea,
} from '@the-deep/deep-ui';

import { EntryType } from '#generated/types';
import _ts from '#ts';

import styles from './styles.css';

export interface Props<N extends string> {
    name: N;
    className?: string;
    imageClassName?: string;
    excerptForImageClassName?: string;
    entryType: EntryType['entryType'];
    value: string | undefined | null;
    onChange: (newVal: string | undefined, name: N) => void;
    droppedExcerpt: EntryType['droppedExcerpt'] | undefined;
    image: EntryType['image'] | undefined;
    imageRaw: string | undefined;
    leadImageUrl: string | undefined;
    readOnly?: boolean;
}

function ExcerptInput<N extends string>(props: Props<N>) {
    const {
        className,
        // droppedValue,
        // tabularFieldData,
        imageClassName,
        excerptForImageClassName,
        entryType,
        image,
        imageRaw,
        leadImageUrl,
        value,
        onChange,
        name,
        readOnly,
    } = props;

    if (entryType === 'IMAGE') {
        const imageSrc = image?.file?.url ?? leadImageUrl ?? imageRaw;
        return (
            <div className={_cs(className, styles.excerptInput)}>
                {imageSrc ? (
                    <ImagePreview
                        className={imageClassName}
                        alt=""
                        src={imageSrc}
                    />
                ) : (
                    <div className={excerptForImageClassName}>
                        Image data is not available.
                    </div>
                )}
                {!readOnly && (
                    <TextArea
                        label="Excerpt"
                        className={_cs(excerptForImageClassName, styles.textArea)}
                        value={value}
                        name={name}
                        onChange={onChange}
                    />
                )}
                {value && readOnly && (
                    <div className={excerptForImageClassName}>
                        {value}
                    </div>
                )}
            </div>
        );
    }
    if (entryType === 'EXCERPT') {
        return readOnly ? (
            <div className={className}>
                { value }
            </div>
        ) : (
            <div className={_cs(className, styles.excerptInput)}>
                <TextArea
                    label="Excerpt"
                    className={_cs(className, styles.textArea)}
                    value={value}
                    onChange={onChange}
                    rows={15}
                    name={name}
                />
            </div>
        );
    }
    if (entryType === 'DATA_SERIES') {
        return (
            <div className={className}>
                {_ts('components.excerptOutput', 'quantitativeDataNotSupportedLabel')}
            </div>
        );
    }
    return null;
}

export default memo(ExcerptInput);
