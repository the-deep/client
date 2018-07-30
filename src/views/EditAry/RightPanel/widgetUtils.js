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
