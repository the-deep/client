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
    ReliefWebParams,
    Country,
} from '../../../types';

const countryKeySelector = (d: Country) => d.key;
const countryLabelSelector = (d: Country) => d.label;

const reliefWebDefaultValues: ReliefWebParams = {};

interface Props<T extends string> {
    name: T;
    value: ReliefWebParams | undefined | null;
    error: Error<ReliefWebParams>;
    onChange: (val: SetValueArg<ReliefWebParams>, name: T) => void;
    disabled?: boolean;
}

function ReliefWebParamsInput<T extends string>(props: Props<T>) {
    const {
        name,
        value,
        error: riskyError,
        onChange,
        disabled,
    } = props;
    const error = getErrorObject(riskyError);
    const setParamsFieldValue = useFormObject(name, onChange, value ?? reliefWebDefaultValues);

    return (
        <>
            <NonFieldError error={error} />
            <MultiSelectInput
                name="primaryCountry"
                label="Primary Country"
                value={value?.primaryCountry}
                onChange={setParamsFieldValue}
                options={reliefWebCountryList}
                keySelector={countryKeySelector}
                labelSelector={countryLabelSelector}
                error={getErrorString(error?.primaryCountry)}
                disabled={disabled}
            />
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
                name="fromDate"
                label="From date"
                value={value?.fromDate}
                onChange={setParamsFieldValue}
                disabled={disabled}
                error={error?.fromDate}
            />
            <DateInput
                name="toDate"
                label="To date"
                value={value?.toDate}
                onChange={setParamsFieldValue}
                error={error?.fromDate}
                disabled={disabled}
            />
        </>
    );
}

export default ReliefWebParamsInput;
