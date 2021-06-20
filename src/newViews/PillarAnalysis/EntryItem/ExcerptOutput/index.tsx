import React from 'react';
import { ImagePreview } from '@the-deep/deep-ui';

import { TabularDataFields } from '#typings';

interface BaseProps {
    className?: string;
}

export type Props = BaseProps & ({
    type: 'excerpt';
    value?: string;
    droppedValue?: string;
    image?: never;
    dataSeries?: never;
} | {
    type: 'image';
    value?: never;
    droppedValue?: never;
    image?: string;
    dataSeries?: never;
} | {
    type: 'dataSeries';
    dataSeries?: TabularDataFields;
    value?: never;
    droppedValue?: never;
    image?: string;
});

function ExcerptOutput(props: Props) {
    const {
        className,
    } = props;

    if (props.type === 'excerpt') {
        return (
            <p className={className}>
                { props.value }
            </p>
        );
    }
    if (props.type === 'image' && props.image) {
        return (
            <ImagePreview
                className={className}
                alt=""
                src={props.image}
            />
        );
    }
    if (props.type === 'dataSeries') {
        /*
            return (
                <DataSeries
                    className={styles.dataSeries}
                    value={props.dataSeries}
                    onEntryStateChange={setEntryState}
                    entryState={entryState}
                />
            );
         */
        return (
            <p className={className}>
                Quantitative data is not supported at the moment.
            </p>
        );
    }
    return null;
}

export default ExcerptOutput;
