import PropTypes from 'prop-types';
import React from 'react';

import update from '#rs/utils/immutable-update';
import NumberInput from '#rs/components/Input/NumberInput';
import List from '#rs/components/View/List';
import FaramElement from '#rs/components/Input/Faram/FaramElement';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
};

const defaultProps = {
    disabled: false,
    data: {},
    value: {},
    onChange: undefined,
};

const emptyList = [];
const emptyObject = {};

class NumberMatrixInput extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    onChangeNumberField = (rowKey, colKey, fieldValue) => {
        const {
            value,
            onChange,
        } = this.props;

        const settings = {
            [rowKey]: { $auto: {
                [colKey]: { $set: fieldValue },
            } },
        };
        const newValue = update(value, settings);
        if (onChange) {
            onChange(newValue);
        }
    }

    getSimilarityIndicatorStyle = (key) => {
        const { data, value } = this.props;
        const indicatorStyle = [styles.tableHeaderRow];

        const values = Object.values(value[key] || emptyObject).filter(v => v);

        const isSame = new Set(values).size === 1;
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

    renderRow = (key, rowData) => {
        const { data } = this.props;
        return (
            <tr key={key} >
                <th
                    className={this.getSimilarityIndicatorStyle(key)}
                    scope="row"
                    title={rowData.tooltip}
                >
                    {rowData.title}
                </th>
                <List
                    data={data.columnHeaders || emptyList}
                    modifier={(colKey, colData) => this.renderColElement(colKey, colData, key)}
                    keyExtractor={NumberMatrixInput.rowKeyExtractor}
                />
            </tr>
        );
    }

    renderColHeader = (key, data) => (
        <th
            className={styles.tableHeader}
            scope="col"
            key={key}
            title={data.tooltip}
        >
            {data.title}
        </th>
    )

    renderColElement = (key, data, rowKey) => {
        const {
            value,
            disabled,
        } = this.props;
        const colValue = (value[rowKey] || emptyObject)[key];

        return (
            <td
                className={styles.tableCell}
                key={`${rowKey}-${key}`}
            >
                <NumberInput
                    placeholder={_ts('framework.numberMatrixWidget', 'numberPlaceholder')}
                    showLabel={false}
                    onChange={newValue => this.onChangeNumberField(rowKey, key, newValue)}
                    value={colValue}
                    showHintAndError={false}
                    separator=" "
                    disabled={disabled}
                />
            </td>
        );
    }

    render() {
        const { data } = this.props;
        return (
            <div className={styles.overview}>
                <table>
                    <tbody>
                        <tr>
                            <td />
                            <List
                                data={data.columnHeaders || emptyList}
                                modifier={this.renderColHeader}
                                keyExtractor={NumberMatrixInput.rowKeyExtractor}
                            />
                        </tr>
                        <List
                            data={data.rowHeaders || emptyList}
                            modifier={this.renderRow}
                            keyExtractor={NumberMatrixInput.rowKeyExtractor}
                        />
                    </tbody>
                </table>
            </div>
        );
    }
}

export default FaramElement('input')(NumberMatrixInput);
