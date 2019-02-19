import PropTypes from 'prop-types';
import React from 'react';
import { FaramInputElement } from '@togglecorp/faram';

import update from '#rsu/immutable-update';
import List from '#rscv/List';

import Row from './Row';

import styles from './styles.scss';

const ColumnHeader = ({ column }) => (
    <th
        className={styles.tableHeader}
        scope="col"
        title={column.tooltip}
    >
        {column.title}
    </th>
);
ColumnHeader.propTypes = {
    column: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const propTypes = {
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func,
};

const defaultProps = {
    disabled: false,
    readOnly: false,
    data: {},
    value: {},
    onChange: undefined,
};


@FaramInputElement
export default class NumberMatrixInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static rowKeyExtractor = d => d.key;

    onChangeNumberField = (rowKey, colKey, fieldValue) => {
        const {
            value,
            onChange,
        } = this.props;

        if (!onChange) {
            return;
        }
        const settings = {
            [rowKey]: { $auto: {
                [colKey]: { $set: fieldValue },
            } },
        };
        const newValue = update(value, settings);
        onChange(newValue);
    }

    columnHeaderRendererParams = (key, column) => ({
        column,
    })

    rowRendererParams = (key, rowData) => {
        const {
            data,
            value,
            disabled,
            readOnly,
        } = this.props;

        return ({
            rowKey: key,
            data,
            rowData,
            value,
            disabled,
            readOnly,
            onChangeNumberField: this.onChangeNumberField,
        });
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
                                data={data.columnHeaders}
                                renderer={ColumnHeader}
                                rendererParams={this.columnHeaderRendererParams}
                                keySelector={NumberMatrixInput.rowKeyExtractor}
                            />
                        </tr>
                        <List
                            data={data.rowHeaders}
                            renderer={Row}
                            rendererParams={this.rowRendererParams}
                            keySelector={NumberMatrixInput.rowKeyExtractor}
                        />
                    </tbody>
                </table>
            </div>
        );
    }
}
