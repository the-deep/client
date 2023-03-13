import React from 'react';
import { doesObjectHaveNoData } from '@togglecorp/fujs';

import DismissableTag from '../DismissableTag';

interface DismissableDateRangeOutputProps<
K extends string | number | undefined,
N extends string | number | undefined
> {
    label?: React.ReactNode;
    fromName: K;
    toName: N;
    fromValue?: string;
    toValue?: string;
    onDismissFromValue: (value: undefined, name: K) => void;
    onDismissToValue: (value: undefined, name: N) => void;
    readOnly?: boolean;
}

function DismissableDateRangeOutput<
K extends string | number | undefined,
N extends string | number | undefined
>(
    props: DismissableDateRangeOutputProps<K, N>,
) {
    const {
        label,
        fromName,
        toName,
        fromValue,
        toValue,
        onDismissFromValue,
        onDismissToValue,
        readOnly,
    } = props;

    const handleDismiss = React.useCallback(() => {
        onDismissFromValue(undefined, fromName);
        onDismissToValue(undefined, toName);
    }, [onDismissFromValue, onDismissToValue, fromName, toName]);

    if (doesObjectHaveNoData(fromValue) || doesObjectHaveNoData(toValue)) {
        return null;
    }

    const content = `${fromValue} - ${toValue}`;

    return (
        <DismissableTag
            label={label}
            name={fromName}
            onDismiss={handleDismiss}
            readOnly={readOnly}
        >
            {content}
        </DismissableTag>
    );
}

export default DismissableDateRangeOutput;
