import React from 'react';
import { SelectInput } from '@the-deep/deep-ui';

import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import {
    humanitarianResponseCountryList,
    HumanitarianResponseParams,
    Country,
} from '../../../types';

const countryKeySelector = (d: Country) => d.key;
const countryLabelSelector = (d: Country) => d.label;

const humanitarianResponseDefaultValues: HumanitarianResponseParams = {};

interface Props<T extends string> {
    name: T;
    value: HumanitarianResponseParams | undefined | null;
    error: Error<HumanitarianResponseParams>;
    onChange: (val: SetValueArg<HumanitarianResponseParams>, name: T) => void;
    disabled?: boolean;
}

function HumanitarianResponseParamsInput<T extends string>(props: Props<T>) {
    const {
        name,
        value,
        error: riskyError,
        onChange,
        disabled,
    } = props;
    const error = getErrorObject(riskyError);
    const setParamsFieldValue = useFormObject(
        name,
        onChange,
        value ?? humanitarianResponseDefaultValues,
    );

    return (
        <>
            <NonFieldError error={error} />
            <SelectInput
                name="country"
                label="Country"
                value={value?.country}
                onChange={setParamsFieldValue}
                options={humanitarianResponseCountryList}
                keySelector={countryKeySelector}
                labelSelector={countryLabelSelector}
                error={getErrorString(error?.country)}
                disabled={disabled}
            />
        </>
    );
}

export default HumanitarianResponseParamsInput;
