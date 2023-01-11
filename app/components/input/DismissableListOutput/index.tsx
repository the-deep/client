import React, { useMemo } from 'react';
import {
    listToMap,
    isNotDefined,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import DismissableTag from '../DismissableTag';

interface DismissableListOutputProps<
    D,
    V extends string | number,
    N extends string | number | undefined
> {
    label?: React.ReactNode;
    value: V[] | undefined;
    name: N;
    onDismiss: (value: undefined, name: N) => void;
    keySelector: (value: D) => V;
    labelSelector: (value: D) => string;
    options: D[] | undefined | null;
    readOnly?: boolean;
}
function DismissableListOutput<D, V extends string | number, N extends string | number | undefined>(
    props: DismissableListOutputProps<D, V, N>,
) {
    const {
        name,
        value,
        onDismiss,
        label,
        labelSelector,
        keySelector,
        readOnly,
        options,
    } = props;

    const labelMap = useMemo(() => (
        listToMap(options, keySelector, labelSelector)
    ), [options, keySelector, labelSelector]);

    const content = useMemo(() => {
        if (isNotDefined(value)) {
            return undefined;
        }

        return value?.map((val) => labelMap?.[val])?.join(', ');
    }, [value, labelMap]);

    if (doesObjectHaveNoData(value)) {
        return null;
    }

    return (
        <DismissableTag
            label={label}
            name={name}
            onDismiss={onDismiss}
            readOnly={readOnly}
        >
            {content}
        </DismissableTag>
    );
}

export default DismissableListOutput;
