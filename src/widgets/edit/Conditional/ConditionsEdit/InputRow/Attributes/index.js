import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import SelectInput from '#rsci/SelectInput';
import NumberInput from '#rsci/NumberInput';

const propTypes = {
    attribute: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgetData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    widgetData: undefined,
};

const getOptions = memoize((attribute, widgetData) => (
    Array.isArray(attribute.options)
        ? [...attribute.options]
        : attribute.options(widgetData)
));

export default class ConditionAttribute extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            attribute,
            widgetData,
        } = this.props;

        if (attribute.type === 'select') {
            const options = getOptions(attribute, widgetData);

            return (
                <SelectInput
                    key={attribute.key}
                    faramElementName={attribute.key}
                    label={attribute.title}
                    options={options}
                    keySelector={attribute.keySelector}
                    labelSelector={attribute.labelSelector}
                />
            );
        } else if (attribute.type === 'number') {
            return (
                <NumberInput
                    key={attribute.key}
                    faramElementName={attribute.key}
                    label={attribute.title}
                />
            );
        }

        return null;
    }
}
