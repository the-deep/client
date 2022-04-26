import React from 'react';
import {
    SelectInput,
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
            <SelectInput
                name="primary-country"
                label="Primary Country"
                value={value?.['primary-country']}
                onChange={setParamsFieldValue}
                options={reliefWebCountryList}
                keySelector={countryKeySelector}
                labelSelector={countryLabelSelector}
                error={getErrorString(error?.['primary-country'])}
                disabled={disabled}
            />
            <SelectInput
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
            <DateDualRangeInput
                label="Published At"
                fromName="from"
                toName="to"
                fromOnChange={setParamsFieldValue}
                toOnChange={setParamsFieldValue}
                fromError={error?.from}
                fromValue={value?.from}
                toError={error?.to}
                toValue={value?.to}
            />
        </>
    );
}

export default ReliefWebParamsInput;
