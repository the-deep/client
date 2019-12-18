import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';

import Cell from './Cell';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string,
    className: PropTypes.string,
    tooltip: PropTypes.string,
    cells: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    onCellClick: PropTypes.func,
    onCellDrop: PropTypes.func,
    orientation: PropTypes.string,
    selectedCells: PropTypes.objectOf(PropTypes.bool),
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    title: '',
    tooltip: '',
    className: undefined,
    orientation: 'horizontal',
    onCellClick: undefined,
    onCellDrop: undefined,
    selectedCells: {},
    disabled: false,
    readOnly: false,
};

const orientationStyleMaps = {
    horizontal: styles.horizontalRow,
    vertical: styles.verticalRow,
    pivoted: styles.pivotedRow,
};

export default class Matrix1dRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static cellKeyExtractor = d => d.key;

    rendererParams = (key, data) => {
        const {
            onCellClick,
            onCellDrop,
            selectedCells,
            disabled,
            readOnly,
        } = this.props;

        return ({
            content: data.value,
            contentClassName: styles.cellValue,
            tooltip: data.tooltip,
            itemKey: key,
            onClick: onCellClick,
            onDrop: onCellDrop,
            active: selectedCells[key],
            disabled,
            readOnly,
            className: styles.cell,
        });
    }

    render() {
        const {
            tooltip,
            title,
            orientation,
            cells,
            className,
        } = this.props;

        return (
            <div
                className={_cs(
                    className,
                    styles.matrixRow,
                    orientationStyleMaps[orientation],
                )}
            >
                <div
                    className={styles.title}
                    title={tooltip}
                >
                    { title }
                </div>
                <ListView
                    data={cells}
                    className={styles.cells}
                    keySelector={Matrix1dRow.cellKeyExtractor}
                    renderer={Cell}
                    rendererParams={this.rendererParams}
                    emptyComponent={null}
                />
            </div>
        );
    }
}
