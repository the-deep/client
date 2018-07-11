import PropTypes from 'prop-types';
import React from 'react';

import List from '#rs/components/View/List';
import { unique } from '#rs/utils/common';

import ColumnElement from './ColumnElement';
import styles from './styles.scss';

const propTypes = {
    rowKey: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    rowData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool.isRequired,
    onChangeNumberField: PropTypes.func.isRequired,
};

const emptyObject = {};
const emptyList = [];

export default class NumberMatrixRow extends React.PureComponent {
    static propTypes = propTypes;
    static rowKeyExtractor = d => d.key;

    getSimilarityIndicatorStyle = (key) => {
        const { data, value } = this.props;
        const indicatorStyle = [styles.tableHeaderRow];

        const values = Object.values(value[key] || emptyObject).filter(v => v);

        const isSame = unique(values).length === 1;
        const colHeaderLength = (data.columnHeaders || emptyList).length;

        if (isSame && values.length === colHeaderLength) {
            indicatorStyle.push(styles.similar);
        } else if (!isSame && values.length === colHeaderLength) {
            indicatorStyle.push(styles.notSimilar);
        } else {
            indicatorStyle.push(styles.partialSimilar);
        }

        return indicatorStyle.join(' ');
    }

    columnRendererParams = (columnKey) => {
        const {
            value,
            rowKey,
            disabled,
            onChangeNumberField,
        } = this.props;

        const columnValue = (value[rowKey] || emptyObject)[columnKey];

        return ({
            rowKey,
            columnKey,
            disabled,
            columnValue,
            onChangeNumberField,
        });
    }

    render() {
        const {
            rowKey,
            rowData,
            data,
        } = this.props;

        return (
            <tr>
                <th
                    className={this.getSimilarityIndicatorStyle(rowKey)}
                    scope="row"
                    title={rowData.tooltip}
                >
                    {rowData.title}
                </th>
                <List
                    data={data.columnHeaders}
                    rendererParams={this.columnRendererParams}
                    renderer={ColumnElement}
                    keyExtractor={NumberMatrixRow.rowKeyExtractor}
                />
            </tr>
        );
    }
}
