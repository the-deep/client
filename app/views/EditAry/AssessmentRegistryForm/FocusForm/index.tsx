import React from 'react';
import { EntriesAsList, Error, SetBaseValueArg } from '@togglecorp/toggle-form';

import { PartialFormType } from '../formSchema';

interface Props {
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    setValue: (value: SetBaseValueArg<PartialFormType>) => void;
    error: Error<PartialFormType>;
}

function FocusForm(props: Props) {
    const {
        value,
        setFieldValue,
        setValue,
        error,
    } = props;

    return (
        <div>
            Focus Form
        </div>
    );
}

export default FocusForm;
