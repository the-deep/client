import React from 'react';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';

import ListItem from '#components/general/ListItem';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    cells: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default class Row extends React.PureComponent {
    static propTypes = propTypes;
    static keySelector = cell => cell.key;

    rendererParams = (key, cell) => ({
        value: cell.value,
    })

    render() {
        const {
            title,
            cells,
        } = this.props;

        return (
            <div className={styles.row}>
                <div className={styles.title}>
                    {title}
                </div>
                <ListView
                    data={cells}
                    keySelector={Row.keySelector}
                    rendererParams={this.rendererParams}
                    renderer={ListItem}
                />
            </div>
        );
    }
}
