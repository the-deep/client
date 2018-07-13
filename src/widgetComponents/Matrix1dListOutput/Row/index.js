import React from 'react';
import PropTypes from 'prop-types';

import ListView from '#rs/components/View/List/ListView';

import ListItem from '#components/ListItem';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    cells: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default class Row extends React.PureComponent {
    static propTypes = propTypes;

    static keyExtractor = cell => cell.key;

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
                    keyExtractor={Row.keyExtractor}
                    rendererParams={this.rendererParams}
                    renderer={ListItem}
                />
            </div>
        );
    }
}
