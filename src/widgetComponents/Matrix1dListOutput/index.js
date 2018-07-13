import React from 'react';
import PropTypes from 'prop-types';

import ListView from '#rs/components/View/List/ListView';
import FaramElement from '#rs/components/Input/Faram/FaramElement';

import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    rows: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    value: {},
    rows: [],
};

const getSelectedCells = (attributeRow, cells = []) => cells.reduce(
    (acc, cell) => {
        const {
            key: cellKey,
        } = cell;
        const attributeCell = attributeRow[cellKey];
        if (!attributeCell) {
            return acc;
        }

        // FIXME: just push attributeCell
        return [
            ...acc,
            cell,
        ];
    },
    [],
);

const getSelectedRowss = (rows, value) => {
    const selectedRows = rows.reduce(
        (acc, row) => {
            const {
                key: rowKey,
                cells,
            } = row;
            const attributeRow = value[rowKey];
            if (!attributeRow) {
                return acc;
            }

            const selectedCells = getSelectedCells(attributeRow, cells);
            if (selectedCells.length <= 0) {
                return acc;
            }

            return [
                ...acc,
                {
                    title: row.title,
                    key: row.key,
                    cells: selectedCells,
                },
            ];
        },
        [],
    );

    return selectedRows;
};

class Matrix1dListOutput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = row => row.title;

    constructor(props) {
        super(props);

        const {
            rows,
            value,
        } = props;
        this.selectedRows = getSelectedRowss(rows, value);
    }

    componentWillReceiveProps(nextProps) {
        const {
            rows: newRows,
            value: newValue,
        } = nextProps;

        if (this.props.rows !== newRows || this.props.value !== newValue) {
            this.selectedRows = getSelectedRowss(newRows, newValue);
        }
    }

    rendererParams = (key, row) => ({
        title: row.title,
        cells: row.cells,
    })

    render() {
        return (
            <ListView
                className={styles.list}
                data={this.selectedRows}
                keyExtractor={Matrix1dListOutput.keyExtractor}
                renderer={Row}
                rendererParams={this.rendererParams}
            />
        );
    }
}

export default FaramElement('output')(Matrix1dListOutput);
