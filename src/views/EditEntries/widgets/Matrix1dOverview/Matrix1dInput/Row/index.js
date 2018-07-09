import PropTypes from 'prop-types';
import React from 'react';

import ListView from '#rs/components/View/List/ListView';

import Cell from './Cell';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string,
    tooltip: PropTypes.string,
    cells: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    onCellClick: PropTypes.func,
    onCellDrop: PropTypes.func,
    selectedCells: PropTypes.objectOf(PropTypes.bool),
    disabled: PropTypes.bool,
};

const defaultProps = {
    title: '',
    tooltip: '',
    onCellClick: undefined,
    onCellDrop: undefined,
    selectedCells: {},
    disabled: false,
};

export default class MatrixRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static cellKeyExtractor = d => d.key;

    rendererParams = (key, data) => ({
        children: data.value,
        onClick: () => this.props.onCellClick(key),
        onDrop: droppedData => this.props.onCellDrop(key, droppedData),
        active: this.props.selectedCells[key],
        disabled: this.props.disabled,
    })

    render() {
        const {
            tooltip,
            title,
            cells,
        } = this.props;

        return (
            <div className={styles.matrixRow}>
                <div
                    className={styles.title}
                    title={tooltip}
                >
                    { title }
                </div>
                <ListView
                    data={cells}
                    className={styles.cells}
                    keyExtractor={MatrixRow.cellKeyExtractor}
                    renderer={Cell}
                    rendererParams={this.rendererParams}
                />
            </div>
        );
    }
}
