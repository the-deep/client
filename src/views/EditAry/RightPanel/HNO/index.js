import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
};

export default class HNO extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            pending,
            className,
        } = this.props;

        return (
            <div className={className}>
                HNO
            </div>
        );
    }
}
