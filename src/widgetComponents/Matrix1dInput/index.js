import React from 'react';
import PropTypes from 'prop-types';
import { FaramInputElement } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import update from '#rsu/immutable-update';

import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    meta: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    options: [],
    meta: {},
    value: undefined,
    disabled: false,
    readOnly: false,
    onChange: () => {},
};

const orientationStyleMaps = {
    // horizontal: styles.horizontal,
    vertical: styles.vertical,
    pivoted: styles.pivoted,
};

@FaramInputElement
export default class Matrix1dInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static rowKeyExtractor = d => d.key;

    handleCellClick = (key, cellKey) => {
        const {
            value,
            onChange,
        } = this.props;
        const settings = { $auto: {
            [key]: { $auto: {
                [cellKey]: { $apply: item => !item },
            } },
        } };

        const newValue = update(value, settings);
        onChange(newValue);
    }

    handleCellDrop = (key, cellKey, droppedData) => {
        const { onChange } = this.props;
        const {
            type,
            data,
        } = droppedData;

        onChange(
            undefined,
            {
                action: 'newEntry',
                excerptType: type,
                excerptValue: data,
                dropped: true,
                value: {
                    [key]: {
                        [cellKey]: true,
                    },
                },
            },
        );
    }

    // TODO: memoize this later
    rendererParams = (key, row) => {
        const {
            value,
            disabled,
            meta: { orientation },
            readOnly,
        } = this.props;

        const {
            title,
            tooltip,
            cells,
            color,
        } = row;

        return ({
            title,
            tooltip,
            cells,
            orientation,
            // FIXME: send rowKey and cellKey as props
            onCellClick: cellKey => this.handleCellClick(key, cellKey),
            onCellDrop: (cellKey, droppedData) => this.handleCellDrop(key, cellKey, droppedData),
            selectedCells: value ? value[key] : undefined,
            disabled,
            readOnly,
            className: styles.row,
            color,
        });
    }

    render() {
        const {
            options,
            meta: {
                orientation,
            },
            className,
        } = this.props;

        return (
            <ListView
                className={_cs(
                    styles.overview,
                    className,
                    orientationStyleMaps[orientation],
                )}
                data={options}
                keySelector={Matrix1dInput.rowKeyExtractor}
                renderer={Row}
                rendererParams={this.rendererParams}
                emptyComponent={null}
            />
        );
    }
}
