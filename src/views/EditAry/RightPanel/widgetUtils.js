import React from 'react';
import { FaramGroup } from '@togglecorp/faram';

import NonFieldErrors from '#rsci/NonFieldErrors';
import MultiSelectInput from '#rsci/MultiSelectInput';
import DateInput from '#rsci/DateInput';
import SelectInput from '#rsci/SelectInput';
import SimpleListInput from '#rsci/SimpleListInput';
import NumberInput from '#rsci/NumberInput';
import TextInput from '#rsci/TextInput';

import Widget from './Metadata/StakeholderModal/Widget';

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
    listInput: SimpleListInput,
    select: SelectInput,
};

const widgetSpecificProps = {
    number: {
        separator: ' ',
    },
};

const getOptions = (sourceType, sources, options) => {
    switch (sourceType) {
        case 'countries':
            return sources.countries;
        case 'donors':
            return sources.donors;
        case 'organizations':
            return sources.organizations;
        default:
            return options;
    }
};

const getProps = (data, sources) => {
    const {
        fieldType,
        id: key,
        options,
        placeholder,
        title,
        tooltip,
        sourceType,
    } = data;

    const id = String(key);
    const commonProps = {
        faramElementName: id,
        key: id,
        label: title,
        options: getOptions(sourceType, sources, options),
        placeholder,
        title: tooltip,
    };

    const specificProps = widgetSpecificProps[fieldType];

    return {
        ...commonProps,
        ...specificProps,
    };
};

// eslint-disable-next-line import/prefer-default-export
export const renderWidget = (k, data, sources, otherProps) => {
    const { fieldType } = data;
    const Component = widgets[fieldType];

    if (!Component) {
        console.error('Unidentified fieldType', fieldType);
        return null;
    }

    const props = getProps(data, sources);

    return (
        <Component
            {...props}
            {...otherProps}
        />
    );
};

export const isDroppableWidget = (sourceType, fieldType) => (
    (sourceType === 'organizations' && fieldType === 'multiselect')
);

// eslint-disable-next-line import/prefer-default-export
export const renderDroppableWidget = (k, data, sources, otherProps = {}) => {
    const {
        sourceType,
        fieldType,
        id: key,
    } = data;

    if (isDroppableWidget(sourceType, fieldType)) {
        const newFieldType = fieldType === 'multiselect' ? 'listInput' : fieldType;
        const renderer = widgets[newFieldType];
        const props = getProps(data, sources);

        return (
            <Widget
                {...props}
                renderer={renderer}
                {...otherProps}
            />
        );
    }

    // NOTE: just wrapping other widget for common styling
    const { containerClassName, ...someOtherProps } = otherProps;
    return (
        <div className={containerClassName}>
            {renderWidget(k, data, sources, someOtherProps)}
        </div>
    );
};
