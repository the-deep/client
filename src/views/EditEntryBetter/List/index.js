import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

export default class List extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    dummy = () => {}

    render() {
        return (
            <div className={styles.list}>
                Entries listing
            </div>
        );
    }
}
