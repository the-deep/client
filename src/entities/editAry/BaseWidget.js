import React from 'react';
import PropTypes from 'prop-types';

import MultiSelectInput from '#rsci/MultiSelectInput';
import DateInput from '#rsci/DateInput';
import SelectInput from '#rsci/SelectInput';
import SimpleListInput from '#rsci/SimpleListInput';
import NumberInput from '#rsci/NumberInput';
import TextInput from '#rsci/TextInput';

import DateRangeInput from './DateRangeInput';

const widgets = {
    string: TextInput,
    number: NumberInput,
    date: DateInput,
    daterange: DateRangeInput,
    multiselect: MultiSelectInput,
    listInput: SimpleListInput,
    select: SelectInput,
};

function BaseWidget({ fieldType, hidden, ...otherProps }) {
    const Component = widgets[fieldType];

    if (!Component) {
        console.error('Unidentified fieldType', fieldType);
        return null;
    }

    if (hidden) {
        return null;
    }

    return (
        <Component
            {...otherProps}
        />
    );
}

BaseWidget.propTypes = {
    fieldType: PropTypes.string.isRequired,
    hidden: PropTypes.bool,
};

BaseWidget.defaultProps = {
    hidden: false,
};

export default BaseWidget;
