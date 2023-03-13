import React from 'react';
import {
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import DismissableTag from '../DismissableTag';

interface DismissableTextOutputProps<T extends string | number | undefined> {
    label?: React.ReactNode;
    value?: string;
    name: T;
    onDismiss: (value: undefined, name: T) => void;
    readOnly?: boolean;
}

function DismissableTextOutput<T extends string | number | undefined>(
    props: DismissableTextOutputProps<T>,
) {
    const {
        label,
        value,
        name,
        onDismiss,
        readOnly,
    } = props;

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
            {value}
        </DismissableTag>
    );
}

export default DismissableTextOutput;
