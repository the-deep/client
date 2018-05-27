import React from 'react';
import MultiSelectInput from '#rs/components/Input/MultiSelectInput';
import DateInput from '#rs/components/Input/DateInput';
import SelectInput from '#rs/components/Input/SelectInput';
import NumberInput from '#rs/components/Input/NumberInput';
import TextInput from '#rs/components/Input/TextInput';

const widgets = {
    string: TextInput,
    number: NumberInput,
    date: DateInput,
    multiselect: MultiSelectInput,
    select: SelectInput,
};

// eslint-disable-next-line import/prefer-default-export
export const renderWidget = (k, data) => {
    const {
        fieldType,
        id: key,
        options,
        placeholder,
        title,
        tooltip,
    } = data;

    const id = String(key);
    const commonProps = {
        faramElementName: id,
        key: id,
        label: title,
        options,
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
        />
    );
};
