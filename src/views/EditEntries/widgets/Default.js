import React from 'react';
import PropTypes from 'prop-types';

import Message from '#rscv/Message';

const propTypes = {
    widgetName: PropTypes.string.isRequired,
    widgetType: PropTypes.string.isRequired,
};

const defaultProps = {
};

export default class DefaultWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { widgetName, widgetType } = this.props;
        // FIXME: use strings
        return (
            <Message>
                {widgetName} for {widgetType}
            </Message>
        );
    }
}
