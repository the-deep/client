import React from 'react';
import {
    TextInput,
    DateDualRangeInput,
} from '@the-deep/deep-ui';

import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import {
    KoboParams,
} from '../../../types';

const koboDefaultValues: KoboParams = {};

interface Props<T extends string> {
    name: T;
    value: KoboParams | undefined | null;
    error: Error<KoboParams>;
    onChange: (val: SetValueArg<KoboParams>, name: T) => void;
    disabled?: boolean;
}

function KoboParamsInput<T extends string>(props: Props<T>) {
    const {
        name,
        value,
        error: riskyError,
        onChange,
        disabled,
    } = props;
    const error = getErrorObject(riskyError);
    const setParamsFieldValue = useFormObject(name, onChange, value ?? koboDefaultValues);

    return (
        <>
            <NonFieldError error={error} />
            <TextInput
                name="project_id"
                label="Project ID"
                value={value?.project_id}
                onChange={setParamsFieldValue}
                error={getErrorString(error?.project_id)}
                disabled={disabled}
            />
            <TextInput
                name="token"
                label="Token"
                value={value?.token}
                onChange={setParamsFieldValue}
                error={getErrorString(error?.token)}
                disabled={disabled}
            />
        </>
    );
}

export default KoboParamsInput;
