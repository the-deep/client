import PropTypes from 'prop-types';
import React from 'react';
import {
    _cs,
    getColorOnBgColor,
} from '@togglecorp/fujs';

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
    color: PropTypes.string,
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
    color: '#f0f0f0',
};

const orientationStyleMaps = {
    // horizontal: styles.horizontalRow,
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
            color,
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
            color,
        });
    }

    render() {
        const {
            tooltip,
            title,
            orientation,
            cells,
            className,
            color,
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
                    style={{
                        backgroundColor: color,
                        color: getColorOnBgColor(color, 'var(--color-text-on-light)', 'var(--color-text-on-dark)'),
                    }}
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
