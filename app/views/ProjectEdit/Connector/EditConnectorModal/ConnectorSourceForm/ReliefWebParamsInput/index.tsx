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

import {
    reliefWebCountryList,
    ReliefWebParams,
    Country,
} from '../../../types';

const countryKeySelector = (d: Country) => d.key;
const countryLabelSelector = (d: Country) => d.label;

interface Props<T extends string> {
    name: T;
    value: ReliefWebParams;
    error: Error<ReliefWebParams>;
    onChange: (val: SetValueArg<ReliefWebParams>, name: T) => void;
}

function ReliefWebParamsInput<T extends string>(props: Props<T>) {
    const {
        name,
        value,
        error: riskyError,
        onChange,
    } = props;

    const error = getErrorObject(riskyError);
    // FIXME: Look into if default values is good
    const setParamsFieldValue = useFormObject(name, onChange, value ?? {});

    return (
        <>
            <MultiSelectInput
                name="primaryCountry"
                label="Primary Country"
                value={value?.primaryCountry}
                onChange={setParamsFieldValue}
                options={reliefWebCountryList}
                keySelector={countryKeySelector}
                labelSelector={countryLabelSelector}
                error={getErrorString(error?.primaryCountry)}
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
            />
            <DateInput
                name="fromDate"
                label="From date"
                value={value?.fromDate}
                onChange={setParamsFieldValue}
                error={error?.fromDate}
            />
            <DateInput
                name="toDate"
                label="To date"
                value={value?.toDate}
                onChange={setParamsFieldValue}
                error={error?.fromDate}
            />
        </>
    );
}

export default ReliefWebParamsInput;
