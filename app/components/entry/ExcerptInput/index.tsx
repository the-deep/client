import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ImagePreview,
    TextArea,
    Message,
} from '@the-deep/deep-ui';
import { genericMemo } from '#utils/common';

import { EntryType } from '#generated/types';
import _ts from '#ts';

import styles from './styles.css';

type Props<N extends string> = {
    className?: string;
    imageClassName?: string;
    excerptForImageClassName?: string;
    entryType: EntryType['entryType'];
    value: string | undefined | null;
    // droppedExcerpt: EntryType['droppedExcerpt'] | undefined;
    image: EntryType['image'] | undefined;
    imageRaw: string | undefined;
    leadImageUrl: string | undefined;
} & ({
    name: N;
    onChange: (newVal: string | undefined, name: N) => void;
    readOnly?: false;
} | {
    readOnly: true;
})

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
                    <Message
                        className={_cs(excerptForImageClassName, styles.emptyImage)}
                        message="Image data is not available."
                    />
                )}
                {!props.readOnly && (
                    <TextArea
                        label="Additional Context"
                        className={_cs(excerptForImageClassName, styles.textArea)}
                        value={value}
                        name={props.name}
                        onChange={props.onChange}
                    />
                )}
                {value && !props.readOnly && (
                    <div className={excerptForImageClassName}>
                        {value}
                    </div>
                )}
            </div>
        );
    }
    if (entryType === 'EXCERPT') {
        return props.readOnly ? (
            <div className={className}>
                { value }
            </div>
        ) : (
            <div className={_cs(className, styles.excerptInput)}>
                <TextArea
                    className={_cs(className, styles.textArea)}
                    value={value}
                    onChange={props.onChange}
                    name={props.name}
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

export default genericMemo(ExcerptInput);
