import PropTypes from 'prop-types';
import React from 'react';

import WidgetEmptyComponent from '#components/WidgetEmptyComponent';
import ListView from '#rs/components/View/List/ListView';
import FaramElement from '#rs/components/Input/Faram/FaramElement';

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

class NumberMatrixListView extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getRowsData = (data, value) => {
        const { rowHeaders = emptyList } = data;
        const dataRows = [];

        rowHeaders.forEach((row) => {
            const { columnHeaders = emptyList } = data;
            const columnList = [];

            columnHeaders.forEach((col) => {
                const colValue = (value[row.key] || emptyObject)[col.key];
                const obj = {
                    title: col.title,
                    value: colValue || '~',
                    key: col.key,
                };
                columnList.push(obj);
            });
            const rowObj = {
                title: row.title,
                columns: columnList,
                key: row.key,
            };
            dataRows.push(rowObj);
        });

        return dataRows;
    }

    renderDataRow = (key, data) => (
        <div
            className={styles.row}
            key={key}
        >
            <span className={styles.rowTitle}>
                {data.title}
            </span>
            <ListView
                className={styles.colsContainer}
                data={data.columns}
                modifier={this.renderDataColumns}
                keyExtractor={NumberMatrixListView.rowKeyExtractor}
                emptyComponent={WidgetEmptyComponent}
            />
        </div>
    )

    renderDataColumns = (key, data) => (
        <div
            className={styles.col}
            key={key}
        >
            <span>{ data.title }</span>
            <span>{ data.value }</span>
        </div>
    )

    render() {
        const { value, data } = this.props;
        const dataRows = this.getRowsData(data, value);
        console.warn(value);

        return (
            <ListView
                className={styles.list}
                data={dataRows}
                modifier={this.renderDataRow}
                keyExtractor={NumberMatrixListView.rowKeyExtractor}
                emptyComponent={WidgetEmptyComponent}
            />
        );
    }
}

export default FaramElement('input')(NumberMatrixListView);
