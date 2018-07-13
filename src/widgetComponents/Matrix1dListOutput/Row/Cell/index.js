import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    value: PropTypes.string.isRequired,
};

export default class Cell extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { value } = this.props;

        const marker = '•';

        return (
            <div className={styles.cell}>
                <div className={styles.marker}>
                    { marker }
                </div>
                <div className={styles.label}>
                    { value }
                </div>
            </div>
        );
    }
}
