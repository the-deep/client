import PropTypes from 'prop-types';
import React from 'react';
import { isTruthy } from '@togglecorp/fujs';

import List from '#rscv/List';
import { unique } from '#rsu/common';

import _cs from '#cs';

import ColumnElement from './ColumnElement';
import styles from './styles.scss';

const propTypes = {
    rowKey: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    rowData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool.isRequired,
    readOnly: PropTypes.bool.isRequired,
    onChangeNumberField: PropTypes.func.isRequired,
};

const emptyObject = {};
const emptyList = [];

export default class NumberMatrixRow extends React.PureComponent {
    static propTypes = propTypes;
    static rowKeyExtractor = d => d.key;

    getSimilarityIndicatorStyle = (key) => {
        const { data, value } = this.props;

        const values = Object.values(value[key] || emptyObject).filter(v => isTruthy(v));
        const isSame = unique(values).length === 1;
        const colHeaderLength = (data.columnHeaders || emptyList).length;

        return _cs(
            styles.tableHeaderRow,
            values.length === colHeaderLength && isSame && styles.similar,
            values.length === colHeaderLength && !isSame && styles.notSimilar,
            values.length !== colHeaderLength && styles.partialSimilar,
        );
    }

    columnRendererParams = (columnKey) => {
        const {
            value,
            rowKey,
            disabled,
            readOnly,
            onChangeNumberField,
        } = this.props;

        const columnValue = (value[rowKey] || emptyObject)[columnKey];

        return ({
            rowKey,
            columnKey,
            disabled,
            readOnly,
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
                    keySelector={NumberMatrixRow.rowKeyExtractor}
                />
            </tr>
        );
    }
}
