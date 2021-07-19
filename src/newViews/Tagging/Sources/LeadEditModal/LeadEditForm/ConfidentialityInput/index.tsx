import React, { useCallback } from 'react';
import {
    Checkbox,
    CheckboxProps,
} from '@the-deep/deep-ui';

interface Props<N extends string> extends Omit<CheckboxProps<N>, 'value' | 'onChange'> {
    value: 'confidential' | 'unprotected';
    onChange: (newValue: 'confidential' | 'unprotected', name: N) => void;
}

function ConfidentialityInput<N extends string>(props: Props<N>) {
    const {
        name,
        value,
        onChange,
        ...otherProps
    } = props;

    const modifiedValue = value === 'confidential';

    const handleCheckboxChange = useCallback((newVal: boolean) => {
        onChange(newVal ? 'confidential' : 'unprotected', name);
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
