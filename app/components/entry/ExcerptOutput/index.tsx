import React, { memo } from 'react';
import { ImagePreview } from '@the-deep/deep-ui';

import { EntryType } from '#generated/types';

import _ts from '#ts';

export interface Props extends Pick<EntryType, 'excerpt' | 'image' | 'droppedExcerpt' | 'entryType'> {
    className?: string;
    imageClassName?: string;
    excerptForImageClassName?: string;
}

function ExcerptOutput(props: Props) {
    const {
        className,
        // droppedValue,
        // tabularFieldData,
        imageClassName,
        excerptForImageClassName,
    } = props;

    // eslint-disable-next-line react/destructuring-assignment
    if (props.entryType === 'IMAGE') {
        return (
            <div className={className}>
                <ImagePreview
                    className={imageClassName}
                    alt=""
                    src={props.image?.file?.url ?? undefined}
                />
                {props.excerpt && (
                    <p className={excerptForImageClassName}>
                        { props.excerpt }
                    </p>
                )}
            </div>
        );
    }
    // eslint-disable-next-line react/destructuring-assignment
    if (props.entryType === 'EXCERPT') {
        return (
            <p className={className}>
                { props.excerpt }
            </p>
        );
    }
    // eslint-disable-next-line react/destructuring-assignment
    if (props.entryType === 'DATA_SERIES') {
        return (
            <p className={className}>
                {_ts('components.excerptOutput', 'quantitativeDataNotSupportedLabel')}
            </p>
        );
    }
    return null;
}

export default memo(ExcerptOutput);
