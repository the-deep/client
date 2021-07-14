import React, { useCallback } from 'react';
import {
    Checkbox,
    CheckboxProps,
} from '@the-deep/deep-ui';

interface Props<N extends string> extends Omit<CheckboxProps<N>, 'value' | 'onChange'> {
    value?: string;
    onChange: (newValue: string | undefined, name: N) => void;
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
        if (newVal) {
            onChange('confidential', name);
        } else {
            onChange('unprotected', name);
        }
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
