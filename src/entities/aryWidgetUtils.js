import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { FaramGroup } from '@togglecorp/faram';

import NonFieldErrors from '#rsci/NonFieldErrors';
import MultiSelectInput from '#rsci/MultiSelectInput';
import DateInput from '#rsci/DateInput';
import SelectInput from '#rsci/SelectInput';
import SimpleListInput from '#rsci/SimpleListInput';
import NumberInput from '#rsci/NumberInput';
import TextInput from '#rsci/TextInput';

import Widget from '#components/input/StakeholderModal/Widget';

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

DateRangeInput.propTypes = {
    label: PropTypes.string,
    faramElementName: PropTypes.string,
};

DateRangeInput.defaultProps = {
    label: '',
    faramElementName: undefined,
};

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
        case 'organizations':
            return sources.organizations;
        default:
            return options;
    }
};

export const getProps = (data, sources) => {
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

// NOTE: this should be deprecated
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

export const BaseWidget = memo(({ fieldType, hidden, ...otherProps }) => {
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
});

BaseWidget.propTypes = {
    fieldType: PropTypes.string.isRequired,
    hidden: PropTypes.bool,
};

BaseWidget.defaultProps = {
    hidden: false,
};

export const isDroppableWidget = (sourceType, fieldType) => (
    sourceType === 'organizations' && fieldType === 'multiselect'
);


// NOTE: this should be use new widget api
export const renderDroppableWidget = (key, data, sources, otherProps = {}) => {
    const {
        sourceType,
        fieldType,
        // id: key,
    } = data;

    if (isDroppableWidget(sourceType, fieldType)) {
        const newFieldType = fieldType === 'multiselect'
            ? 'listInput'
            : fieldType;
        const renderer = widgets[newFieldType];
        const props = getProps(data, sources);

        return (
            <Widget
                key={key}
                {...props}
                renderer={renderer}
                sourceType={sourceType}
                {...otherProps}
            />
        );
    }

    // NOTE: just wrapping other widget for common styling
    const { containerClassName, ...someOtherProps } = otherProps;
    return (
        <div
            key={key}
            className={containerClassName}
        >
            {renderWidget(key, data, sources, someOtherProps)}
        </div>
    );
};
