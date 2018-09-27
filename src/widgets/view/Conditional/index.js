import React from 'react';
import PropTypes from 'prop-types';

import Conditional from '#widgetComponents/Conditional';

const propTypes = {
    widget: PropTypes.shape({
        properties: PropTypes.object,
    }).isRequired,
    widgetType: PropTypes.string.isRequired,
};

const defaultProps = {
};

export default class ConditionalWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <Conditional
                faramElementName="value"
                isView
                {...this.props}
            />
        );
    }
}
