import React, { memo } from 'react';
import { ImagePreview } from '@the-deep/deep-ui';

import { TabularDataFields } from '#types/newEntry';
import _ts from '#ts';

export interface Props {
    className?: string;
    imageClassName?: string;
    excerptForImageClassName?: string;
    entryType: 'excerpt' | 'image' | 'dataSeries';
    excerpt?: string;
    imageDetails?: {
        file?: string;
    };
    droppedValue?: string;
    tabularFieldData?: TabularDataFields;
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
    if (props.entryType === 'image') {
        return (
            <div className={className}>
                <ImagePreview
                    className={imageClassName}
                    alt=""
                    src={props.imageDetails?.file}
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
    if (props.entryType === 'excerpt') {
        return (
            <p className={className}>
                { props.excerpt }
            </p>
        );
    }
    // eslint-disable-next-line react/destructuring-assignment
    if (props.entryType === 'dataSeries') {
        return (
            <p className={className}>
                {_ts('components.excerptOutput', 'quantitativeDataNotSupportedLabel')}
            </p>
        );
    }
    return null;
}

export default memo(ExcerptOutput);
