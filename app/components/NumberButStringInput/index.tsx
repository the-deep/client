import React, { useCallback, useMemo } from 'react';
import {
    isDefined,
} from '@togglecorp/fujs';

import {
    NumberInput,
    TextInputProps,
} from '@the-deep/deep-ui';

export type Props<T extends string> = TextInputProps<T>;

function NumberButStringInput<
    N extends string,
>(props: Props<N>) {
    const {
        value: valueFromProps,
        onChange,
        name,
        ...otherProps
    } = props;

    const value = useMemo(
        () => (
            isDefined(valueFromProps) ? Number(valueFromProps) : undefined
        ),
        [valueFromProps],
    );

    const handleValueChange = useCallback((
        newVal: number | undefined,
    ) => {
        if (!onChange) {
            return;
        }
        if (isDefined(newVal)) {
            onChange(String(newVal), name);
        } else {
            onChange(undefined, name);
        }
    }, [
        onChange,
        name,
    ]);

    return (
        <NumberInput
            name={name}
            value={value}
            onChange={handleValueChange}
            {...otherProps}
        />
    );
}

export default NumberButStringInput;
