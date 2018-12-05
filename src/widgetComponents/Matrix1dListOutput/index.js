import React from 'react';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';
import { FaramOutputElement } from '#rscg/FaramElements';

import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    rows: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
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

        return [
            ...acc,
            cell,
        ];
    },
    [],
);

const getSelected = (rows, value) => {
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

@FaramOutputElement
export default class Matrix1dListOutput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = row => row.title;

    constructor(props) {
        super(props);

        const {
            rows,
            value,
        } = props;
        this.selectedRows = getSelected(rows, value);
    }

    componentWillReceiveProps(nextProps) {
        const {
            rows: newRows,
            value: newValue,
        } = nextProps;

        if (this.props.rows !== newRows || this.props.value !== newValue) {
            this.selectedRows = getSelected(newRows, newValue);
        }
    }

    rendererParams = (key, row) => ({
        title: row.title,
        cells: row.cells,
    })

    render() {
        const { className: classNameFromProps } = this.props;
        const className = `
            ${classNameFromProps}
            ${styles.list}
        `;

        return (
            <ListView
                className={className}
                data={this.selectedRows}
                keySelector={Matrix1dListOutput.keySelector}
                renderer={Row}
                rendererParams={this.rendererParams}
                emptyComponent={null}
            />
        );
    }
}
