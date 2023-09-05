import React from 'react';
import {
    type Error,
    type SetValueArg,
    getErrorObject,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    NumberInput,
    ColorInput,
} from '@the-deep/deep-ui';

import {
    type BackgroundStyleFormType,
} from '../../../schema';

import styles from './styles.css';

interface Props<NAME extends string> {
    name: NAME;
    onChange: (value: SetValueArg<BackgroundStyleFormType | undefined>, name: NAME) => void;
    value: BackgroundStyleFormType | undefined;
    error?: Error<BackgroundStyleFormType>;
    disabled?: boolean;
}

function BackgroundEdit<NAME extends string>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        error: riskyError,
        disabled,
    } = props;

    const error = getErrorObject(riskyError);
    const onFieldChange = useFormObject<
        NAME, BackgroundStyleFormType
    >(name, onChange, {});

    return (
        <>
            <NumberInput
                name="opacity"
                label="opacity"
                value={value?.opacity}
                onChange={onFieldChange}
                error={error?.opacity}
                disabled={disabled}
            />
            <ColorInput
                name="color"
                value={value?.color}
                onChange={onFieldChange}
                className={styles.colorInput}
                /* FIXME: Add these fields to Color Input
                error={error?.color}
                label="Color"
                disabled={disabled}
                */
            />
        </>
    );
}

export default BackgroundEdit;
