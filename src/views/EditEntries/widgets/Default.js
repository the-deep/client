import React from 'react';
import PropTypes from 'prop-types';

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
        return (
            <div>
                {widgetType}: {widgetName}
            </div>
        );
    }
}
