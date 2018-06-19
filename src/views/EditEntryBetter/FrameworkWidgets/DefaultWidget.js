import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    name: PropTypes.string.isRequired,
};

const defaultProps = {
};

export default class DefaultWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { name } = this.props;
        return (
            <div>
                {name}
            </div>
        );
    }
}
