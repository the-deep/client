import PropTypes from 'prop-types';
import React from 'react';

import NumberInput from '#rsci/NumberInput';

import styles from './styles.scss';

const propTypes = {
    rowKey: PropTypes.string.isRequired,
    columnKey: PropTypes.string.isRequired,
    columnValue: PropTypes.number,
    disabled: PropTypes.bool.isRequired,
    readOnly: PropTypes.bool.isRequired,
    onChangeNumberField: PropTypes.func.isRequired,
};

const defaultProps = {
    columnValue: undefined,
};

export default class ColumnElement extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleNumberInputChange = (newValue) => {
        const {
            rowKey,
            columnKey,
            onChangeNumberField,
        } = this.props;

        onChangeNumberField(rowKey, columnKey, newValue);
    }

    render() {
        const {
            columnValue,
            disabled,
            readOnly,
        } = this.props;

        return (
            <td className={styles.tableCell} >
                <NumberInput
                    showLabel={false}
                    onChange={this.handleNumberInputChange}
                    value={columnValue}
                    showHintAndError={false}
                    separator=" "
                    disabled={disabled}
                    readOnly={readOnly}
                />
            </td>
        );
    }
}
