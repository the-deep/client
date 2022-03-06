import React from 'react';
import {
    DateInput,
    MultiSelectInput,
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
    reliefWebCountryList,
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
            <MultiSelectInput
                name="country"
                label="Country"
                value={value?.country}
                onChange={setParamsFieldValue}
                options={reliefWebCountryList}
                keySelector={countryKeySelector}
                labelSelector={countryLabelSelector}
                error={getErrorString(error?.country)}
                disabled={disabled}
            />
            <DateInput
                name="dateFrom"
                label="From date"
                value={value?.dateFrom}
                onChange={setParamsFieldValue}
                disabled={disabled}
                error={error?.dateFrom}
            />
            <DateInput
                name="dateTo"
                label="To date"
                value={value?.dateTo}
                onChange={setParamsFieldValue}
                error={error?.dateTo}
                disabled={disabled}
            />
        </>
    );
}

export default UnhcrParamsInput;
