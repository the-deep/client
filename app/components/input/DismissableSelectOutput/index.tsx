import React, { useMemo } from 'react';
import {
    listToMap,
    isNotDefined,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import DismissableTag from '../DismissableTag';

interface DismissableSelectOutputProps<D, V extends string | number, N> {
    label: React.ReactNode;
    name: N;
    value?: V;
    onDismiss: (value: undefined, name: N) => void;
    keySelector: (value: D) => V;
    labelSelector: (value: D) => string;
    options: D[] | undefined | null;
    readOnly?: boolean;
}

function DismissableSelectOutput<D, V extends string | number, N>(
    props: DismissableSelectOutputProps< D, V, N >,
) {
    const {
        name,
        value,
        onDismiss,
        label,
        labelSelector,
        keySelector,
        options,
        readOnly,
    } = props;

    const labelMap = useMemo(() => (
        listToMap(options, keySelector, labelSelector)
    ), [options, keySelector, labelSelector]);

    const content = useMemo(() => {
        if (isNotDefined(value)) {
            return undefined;
        }
        return labelMap?.[value];
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

export default DismissableSelectOutput;
