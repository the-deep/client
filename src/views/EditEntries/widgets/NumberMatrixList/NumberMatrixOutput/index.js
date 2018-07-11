import PropTypes from 'prop-types';
import React from 'react';

import WidgetEmptyComponent from '#components/WidgetEmptyComponent';
import ListView from '#rs/components/View/List/ListView';
import FaramElement from '#rs/components/Input/Faram/FaramElement';

import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
    value: {},
};

const emptyList = [];
const emptyObject = {};

const getRowsData = (data, value) => {
    const { rowHeaders = emptyList } = data;

    const dataRows = rowHeaders.map((row) => {
        const { columnHeaders = emptyList } = data;

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

class NumberMatrixListView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static rowKeyExtractor = d => d.key;

    constructor(props) {
        super(props);
        const {
            data,
            value,
        } = props;

        this.rowsData = getRowsData(data, value);
    }

    componentWillReceiveProps(nextProps) {
        const {
            data: newData,
            value: newValue,
        } = nextProps;

        const {
            data: oldData,
            value: oldValue,
        } = this.props;

        if (newData !== oldData || newValue !== oldValue) {
            this.rowsData = getRowsData(newData, newValue);
        }
    }

    rowRendererParams = (key, rowData) => ({
        rowData,
    });

    render() {
        return (
            <ListView
                className={styles.list}
                data={this.rowsData}
                renderer={Row}
                rendererParams={this.rowRendererParams}
                keyExtractor={NumberMatrixListView.rowKeyExtractor}
                emptyComponent={WidgetEmptyComponent}
            />
        );
    }
}

export default FaramElement('output')(NumberMatrixListView);
