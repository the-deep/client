import React from 'react';

import DismissableTag from '../DismissableTag';

interface DismissableBooleanOutputProps<T extends string | number | undefined> {
    label?: React.ReactNode;
    trueLabel: string;
    falseLabel: string;
    value?: boolean;
    name: T;
    onDismiss: (value: undefined, name: T) => void;
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
    } = props;

    if (value === true) {
        return (
            <DismissableTag
                label={label}
                name={name}
                onDismiss={onDismiss}
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
            >
                {falseLabel}
            </DismissableTag>
        );
    }

    return null;
}

export default DismissableBooleanOutput;
