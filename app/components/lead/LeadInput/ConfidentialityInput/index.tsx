import React, { useCallback } from 'react';
import {
    Checkbox,
    CheckboxProps,
} from '@the-deep/deep-ui';

interface Props<N extends string> extends Omit<CheckboxProps<N>, 'value' | 'onChange'> {
    value: 'CONFIDENTIAL' | 'UNPROTECTED' | undefined;
    onChange: (newValue: 'CONFIDENTIAL' | 'UNPROTECTED', name: N) => void;
}

function ConfidentialityInput<N extends string>(props: Props<N>) {
    const {
        name,
        value,
        onChange,
        ...otherProps
    } = props;

    const modifiedValue = value === 'CONFIDENTIAL';

    const handleCheckboxChange = useCallback((newVal: boolean) => {
        onChange(newVal ? 'CONFIDENTIAL' : 'UNPROTECTED', name);
    }, [onChange, name]);

    return (
        <Checkbox
            name="confidentiality"
            onChange={handleCheckboxChange}
            value={modifiedValue}
            {...otherProps}
        />
    );
}

export default ConfidentialityInput;
