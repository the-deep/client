import PropTypes from 'prop-types';
import React from 'react';

import SelectInput from '#rsci/SelectInput';
import NumberInput from '#rsci/NumberInput';

const propTypes = {
    attribute: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgetData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default class ConditionAttribute extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const {
            attribute,
            widgetData,
        } = this.props;

        if (attribute.type === 'select') {
            let options;
            if (Array.isArray(attribute.options)) {
                options = [...attribute.options];
            } else {
                options = attribute.options(widgetData);
            }

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
