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
    pdnaCountryList,
    PdnaParams,
    Country,
} from '../../../types';

const countryKeySelector = (d: Country) => d.key;
const countryLabelSelector = (d: Country) => d.label;

const pdnaDefaultValues: PdnaParams = {};

interface Props<T extends string> {
    name: T;
    value: PdnaParams | undefined | null;
    error: Error<PdnaParams>;
    onChange: (val: SetValueArg<PdnaParams>, name: T) => void;
    disabled?: boolean;
}

function PdnaParamsInput<T extends string>(props: Props<T>) {
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
        value ?? pdnaDefaultValues,
    );

    return (
        <>
            <NonFieldError error={error} />
            <SelectInput
                name="country"
                label="Country"
                value={value?.country}
                onChange={setParamsFieldValue}
                options={pdnaCountryList}
                keySelector={countryKeySelector}
                labelSelector={countryLabelSelector}
                error={getErrorString(error?.country)}
                disabled={disabled}
            />
        </>
    );
}

export default PdnaParamsInput;
