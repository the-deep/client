import React, { useCallback } from 'react';
import { SelectInput } from '@the-deep/deep-ui';

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

interface Props<T extends Option, K extends string> {
    className?: string;
    name: K;
    options: T[];
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
}

function BooleanInput<T extends Option, K extends string>(props: Props<T, K>) {
    const {
        className,
        name,
        value,
        onChange,
        options,
        ...otherProps
    } = props;

    const currentValue = booleanToString(value);

    const handleChange = useCallback(
        (val: BooleanString | undefined) => {
            onChange(stringToBoolean(val), name);
        },
        [onChange, name],
    );

    return (
        <SelectInput
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            options={options}
            value={currentValue}
            onChange={handleChange}
            name={name}
            {...otherProps}
        />
    );
}
export default BooleanInput;
