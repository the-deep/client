import React, { useCallback } from 'react';
import {
    SelectInput,
    SegmentInput,
} from '@the-deep/deep-ui';

type BooleanString = 'true' | 'false';

function stringToBoolean(value: BooleanString | null | undefined) {
    switch (value) {
        case 'true':
            return true;
        case 'false':
            return false;
        default:
            return undefined;
    }
}

function booleanToString(value: boolean | null | undefined): BooleanString | null | undefined {
    switch (value) {
        case true:
            return 'true';
        case false:
            return 'false';
        default:
            return value;
    }
}

export interface Option {
    value: string;
    key: BooleanString;
}

const keySelector = (d: Option) => d.key;
const labelSelector = (d: Option) => d.value;

interface Props<T extends Option, K extends string | undefined> {
    className?: string;
    name: K;
    options: T[] | null | undefined;
    value: boolean | null | undefined;
    onChange: (
        value: boolean | undefined,
        name: K,
    ) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    readOnly?: boolean;
    type?: 'select' | 'segment';
    variant?: 'form' | 'general';
    spacing?: 'compact' | 'none' | 'comfortable' | 'loose';
}

function BooleanInput<T extends Option, K extends string | undefined>(props: Props<T, K>) {
    const {
        className,
        name,
        value,
        onChange,
        options,
        type = 'select',
        variant,
        spacing,
        ...otherProps
    } = props;

    const currentValue = booleanToString(value);

    const handleChange = useCallback(
        (val: BooleanString | undefined) => {
            onChange(stringToBoolean(val), name);
        },
        [onChange, name],
    );

    if (type === 'select') {
        return (
            <SelectInput
                className={className}
                keySelector={keySelector}
                labelSelector={labelSelector}
                options={options}
                value={currentValue}
                onChange={handleChange}
                variant={variant}
                name={name}
                {...otherProps}
            />
        );
    }

    return (
        <SegmentInput
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            options={options ?? undefined}
            value={currentValue}
            onChange={handleChange}
            name={name}
            spacing={spacing}
            {...otherProps}
        />
    );
}
export default BooleanInput;
