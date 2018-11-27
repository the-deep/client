import React from 'react';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';
import { FaramInputElement } from '#rscg/FaramElements';
import update from '#rsu/immutable-update';

import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    options: [],
    value: undefined,
    disabled: false,
    readOnly: false,
    onChange: () => {},
};

@FaramInputElement
export default class Matrix1dInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static rowKeyExtractor = d => d.key;

    handleCellClick = (key, cellKey) => {
        const { value } = this.props;
        const settings = { $auto: {
            [key]: { $auto: {
                [cellKey]: { $apply: item => !item },
            } },
        } };

        const newValue = update(value, settings);
        this.props.onChange(newValue);
    }

    handleCellDrop = (key, cellKey, droppedData) => {
        const { type, data } = droppedData;
        this.props.onChange(
            undefined,
            {
                action: 'newEntry',
                excerptType: type,
                excerptValue: data,
                value: {
                    [key]: {
                        [cellKey]: true,
                    },
                },
            },
        );
    }

    // TODO: memoize this later
    rendererParams = (key, row) => ({
        title: row.title,
        tooltip: row.tooltip,
        cells: row.cells,
        // FIXME: send rowKey and cellKey as props
        onCellClick: cellKey => this.handleCellClick(key, cellKey),
        onCellDrop: (cellKey, droppedData) => this.handleCellDrop(key, cellKey, droppedData),
        selectedCells: this.props.value ? this.props.value[key] : undefined,
        disabled: this.props.disabled,
        readOnly: this.props.readOnly,
    })

    render() {
        const {
            options,
            className,
        } = this.props;

        return (
            <ListView
                className={`${styles.overview} ${className}`}
                data={options}
                keySelector={Matrix1dInput.rowKeyExtractor}
                renderer={Row}
                rendererParams={this.rendererParams}
            />
        );
    }
}
