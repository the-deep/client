import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    widgetName: PropTypes.string.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class DefaultWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            widgetName,
            className,
        } = this.props;
        return (
            <div className={className}>
                {widgetName}
            </div>
        );
    }
}
