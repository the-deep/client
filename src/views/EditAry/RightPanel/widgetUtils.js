import React from 'react';
import MultiSelectInput from '#rsci/MultiSelectInput';
import DateInput from '#rsci/DateInput';
import SelectInput from '#rsci/SelectInput';
import NumberInput from '#rsci/NumberInput';
import TextInput from '#rsci/TextInput';

const widgets = {
    string: TextInput,
    number: NumberInput,
    date: DateInput,
    multiselect: MultiSelectInput,
    select: SelectInput,
};

// eslint-disable-next-line import/prefer-default-export
export const renderWidget = (k, data, sources) => {
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

    console.warn(sourceType);

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
        />
    );
};
