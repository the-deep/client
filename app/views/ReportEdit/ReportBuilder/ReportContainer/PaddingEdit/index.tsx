import React from 'react';
import {
    type SetValueArg,
    type Error,
    getErrorObject,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    NumberInput,
} from '@the-deep/deep-ui';

import {
    type PaddingStyleFormType,
} from '../../../schema';

interface Props<NAME extends string> {
    name: NAME;
    value: PaddingStyleFormType | undefined;
    onChange: (value: SetValueArg<PaddingStyleFormType | undefined>, name: NAME) => void;
    error?: Error<PaddingStyleFormType>;
    disabled?: boolean;
}

function PaddingEdit<NAME extends string>(props: Props<NAME>) {
    const {
        value,
        onChange,
        error: riskyError,
        disabled,
        name,
    } = props;

    const onFieldChange = useFormObject<
        NAME, PaddingStyleFormType
    >(name, onChange, {});

    const error = getErrorObject(riskyError);

    return (
        <>
            <NumberInput
                name="top"
                label="Top"
                value={value?.top}
                onChange={onFieldChange}
                error={error?.top}
                disabled={disabled}
            />
            <NumberInput
                name="right"
                label="Right"
                value={value?.right}
                onChange={onFieldChange}
                error={error?.right}
                disabled={disabled}
            />
            <NumberInput
                name="bottom"
                label="Bottom"
                value={value?.bottom}
                onChange={onFieldChange}
                error={error?.bottom}
                disabled={disabled}
            />
            <NumberInput
                name="left"
                label="Left"
                value={value?.left}
                onChange={onFieldChange}
                error={error?.left}
                disabled={disabled}
            />
        </>
    );
}

export default PaddingEdit;
