import React, { memo } from 'react';
import { ImagePreview } from '@the-deep/deep-ui';

import { EntryType } from '#generated/types';

import _ts from '#ts';

export interface Props {
    className?: string;
    imageClassName?: string;
    excerptForImageClassName?: string;
    entryType: EntryType['entryType'];
    excerpt: EntryType['excerpt'] | undefined;
    droppedExcerpt: EntryType['droppedExcerpt'] | undefined;
    image: EntryType['image'] | undefined;
}

function ExcerptOutput(props: Props) {
    const {
        className,
        // droppedValue,
        // tabularFieldData,
        imageClassName,
        excerptForImageClassName,
        entryType,
        image,
        excerpt,
    } = props;

    if (entryType === 'IMAGE') {
        const imageUrl = image?.file?.url;
        return (
            <div className={className}>
                {imageUrl && (
                    <ImagePreview
                        className={imageClassName}
                        alt=""
                        src={imageUrl}
                    />
                )}
                {excerpt && (
                    <p className={excerptForImageClassName}>
                        { excerpt }
                    </p>
                )}
            </div>
        );
    }
    if (entryType === 'EXCERPT') {
        return (
            <p className={className}>
                { excerpt }
            </p>
        );
    }
    if (entryType === 'DATA_SERIES') {
        return (
            <p className={className}>
                {_ts('components.excerptOutput', 'quantitativeDataNotSupportedLabel')}
            </p>
        );
    }
    return null;
}

export default memo(ExcerptOutput);
