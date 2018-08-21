import PropTypes from 'prop-types';
import React from 'react';

import WidgetEmptyComponent from '#components/WidgetEmptyComponent';
import ListView from '#rscv/List/ListView';
import { FaramOutputElement } from '#rscg/FaramElements';

import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    options: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    options: {},
    value: {},
};

const emptyList = [];
const emptyObject = {};

const getRowsData = (options, value) => {
    const { rowHeaders = emptyList } = options;

    const dataRows = rowHeaders.map((row) => {
        const { columnHeaders = emptyList } = options;

        const columnList = columnHeaders.map((col) => {
            const colValue = (value[row.key] || emptyObject)[col.key];
            const obj = {
                title: col.title,
                value: colValue || '~',
                key: col.key,
            };
            return obj;
        });

        const rowObj = {
            title: row.title,
            columns: columnList,
            key: row.key,
        };
        return rowObj;
    });

    return dataRows;
};

@FaramOutputElement
export default class NumberMatrixListView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static rowKeyExtractor = d => d.key;

    constructor(props) {
        super(props);
        const {
            options,
            value,
        } = props;

        this.rowsData = getRowsData(options, value);
    }

    componentWillReceiveProps(nextProps) {
        const {
            options: newOptions,
            value: newValue,
        } = nextProps;

        const {
            options: oldOptions,
            value: oldValue,
        } = this.props;

        if (newOptions !== oldOptions || newValue !== oldValue) {
            this.rowsData = getRowsData(newOptions, newValue);
        }
    }

    rowRendererParams = (key, rowData) => ({
        rowData,
    });

    render() {
        const { className } = this.props;

        return (
            <ListView
                className={`${styles.list} ${className}`}
                data={this.rowsData}
                renderer={Row}
                rendererParams={this.rowRendererParams}
                keyExtractor={NumberMatrixListView.rowKeyExtractor}
                emptyComponent={WidgetEmptyComponent}
            />
        );
    }
}
