import React from 'react';
import {
    DateInput,
    SelectInput,
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
    unhcrCountryList,
    UnhcrParams,
    Country,
} from '../../../types';

const countryKeySelector = (d: Country) => d.key;
const countryLabelSelector = (d: Country) => d.label;

const unhcrDefaultValues: UnhcrParams = {};

interface Props<T extends string> {
    name: T;
    value: UnhcrParams | undefined | null;
    error: Error<UnhcrParams>;
    onChange: (val: SetValueArg<UnhcrParams>, name: T) => void;
    disabled?: boolean;
}

function UnhcrParamsInput<T extends string>(props: Props<T>) {
    const {
        name,
        value,
        error: riskyError,
        onChange,
        disabled,
    } = props;
    const error = getErrorObject(riskyError);
    const setParamsFieldValue = useFormObject(name, onChange, value ?? unhcrDefaultValues);

    return (
        <>
            <NonFieldError error={error} />
            <SelectInput
                name="country"
                label="Country"
                value={value?.country}
                onChange={setParamsFieldValue}
                options={unhcrCountryList}
                keySelector={countryKeySelector}
                labelSelector={countryLabelSelector}
                error={getErrorString(error?.country)}
                disabled={disabled}
            />
            <DateInput
                name="date_from"
                label="From date"
                value={value?.date_from}
                onChange={setParamsFieldValue}
                disabled={disabled}
                error={error?.date_from}
            />
            <DateInput
                name="date_to"
                label="To date"
                value={value?.date_to}
                onChange={setParamsFieldValue}
                error={error?.date_to}
                disabled={disabled}
            />
        </>
    );
}

export default UnhcrParamsInput;
