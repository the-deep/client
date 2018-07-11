import PropTypes from 'prop-types';
import React from 'react';

import NumberInput from '#rs/components/Input/NumberInput';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    columnValue: PropTypes.number,
    disabled: PropTypes.bool.isRequired,
    onNumberInputChange: PropTypes.func.isRequired,
};

const defaultProps = {
    columnValue: undefined,
};

export default class ColumnElement extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            columnValue,
            disabled,
            onNumberInputChange,
        } = this.props;

        return (
            <td className={styles.tableCell} >
                <NumberInput
                    placeholder={_ts('framework.numberMatrixWidget', 'numberPlaceholder')}
                    showLabel={false}
                    onChange={onNumberInputChange}
                    value={columnValue}
                    showHintAndError={false}
                    separator=" "
                    disabled={disabled}
                />
            </td>
        );
    }
}
