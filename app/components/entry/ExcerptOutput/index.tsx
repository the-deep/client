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
    imageRaw: string | undefined;
    leadImageUrl: string | undefined;
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
        imageRaw,
        leadImageUrl,
        excerpt,
    } = props;

    if (entryType === 'IMAGE') {
        const imageSrc = image?.file?.url ?? leadImageUrl ?? imageRaw;
        return (
            <div className={className}>
                {imageSrc ? (
                    <ImagePreview
                        className={imageClassName}
                        alt=""
                        src={imageSrc}
                    />
                ) : (
                    <div>
                        Image data is not available.
                    </div>
                )}
                {excerpt && (
                    <div className={excerptForImageClassName}>
                        { excerpt }
                    </div>
                )}
            </div>
        );
    }
    if (entryType === 'EXCERPT') {
        return (
            <div className={className}>
                { excerpt }
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

export default memo(ExcerptOutput);
