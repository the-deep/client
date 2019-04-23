import React from 'react';
import { FaramGroup } from '@togglecorp/faram';

import NonFieldErrors from '#rsci/NonFieldErrors';
import MultiSelectInput from '#rsci/MultiSelectInput';
import DateInput from '#rsci/DateInput';
import SelectInput from '#rsci/SelectInput';
import NumberInput from '#rsci/NumberInput';
import TextInput from '#rsci/TextInput';

const DateRangeInput = ({ label, faramElementName, ...props }) => (
    <FaramGroup faramElementName={faramElementName}>
        <DateInput
            label={`${label} Start Date`}
            faramElementName="from"
            {...props}
        />
        <DateInput
            label={`${label} End Date`}
            faramElementName="to"
            {...props}
        />
        <NonFieldErrors faramElement />
    </FaramGroup>
);

const widgets = {
    string: TextInput,
    number: NumberInput,
    date: DateInput,
    daterange: DateRangeInput,
    multiselect: MultiSelectInput,
    select: SelectInput,
};

// eslint-disable-next-line import/prefer-default-export
export const renderWidget = (k, data, sources, readonly = false) => {
    const {
        fieldType,
        id: key,
        options,
        placeholder,
        title,
        tooltip,
        sourceType,
    } = data;

    let someOptions;
    switch (sourceType) {
        case 'countries':
            someOptions = sources.countries;
            break;
        case 'donors':
            someOptions = sources.donors;
            break;
        case 'organizations':
            someOptions = sources.organizations;
            break;
        default:
            someOptions = options;
            break;
    }

    const id = String(key);
    const commonProps = {
        faramElementName: id,
        key: id,
        label: title,
        options: someOptions,
        placeholder,
        title: tooltip,
    };
    const typeSpecificProps = {
        number: {
            separator: ' ',
        },
    };

    const Component = widgets[fieldType];

    if (!Component) {
        console.error('Unidentified fieldType', fieldType);
        return null;
    }

    return (
        <Component
            className="widget"
            {...commonProps}
            {...typeSpecificProps[fieldType]}
            disabled={readonly}
        />
    );
};
