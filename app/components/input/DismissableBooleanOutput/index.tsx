import React from 'react';

import DismissableTag from '../DismissableTag';

interface DismissableBooleanOutputProps<T extends string | number | undefined> {
    label?: React.ReactNode;
    trueLabel: string;
    falseLabel: string;
    value?: boolean;
    name: T;
    onDismiss: (value: undefined, name: T) => void;
    readOnly?: boolean;
}
function DismissableBooleanOutput<T extends string | number | undefined>(
    props: DismissableBooleanOutputProps<T>,
) {
    const {
        label,
        trueLabel,
        falseLabel,
        value,
        name,
        onDismiss,
        readOnly,
    } = props;

    if (value === true) {
        return (
            <DismissableTag
                label={label}
                name={name}
                onDismiss={onDismiss}
                readOnly={readOnly}
            >
                {trueLabel}
            </DismissableTag>
        );
    }

    if (value === false) {
        return (
            <DismissableTag
                label={label}
                name={name}
                onDismiss={onDismiss}
                readOnly={readOnly}
            >
                {falseLabel}
            </DismissableTag>
        );
    }

    return null;
}

export default DismissableBooleanOutput;
