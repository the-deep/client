import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    column: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default class NumberMatrixColumnHeader extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const {
            column,
        } = this.props;

        return (
            <th
                className={styles.tableHeader}
                scope="col"
                title={column.tooltip}
            >
                {column.title}
            </th>
        );
    }
}
