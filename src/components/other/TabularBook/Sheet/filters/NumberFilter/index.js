import PropTypes from 'prop-types';
import React from 'react';

import NumberInput from '#rsci/NumberInput';

import { DATA_TYPE } from '#entities/tabular';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';


export default class NumberFilter extends React.PureComponent {
    static propTypes = {
        disabled: PropTypes.bool,
        // eslint-disable-next-line react/forbid-prop-types
        value: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
    };

    static defaultProps = {
        value: {},
        disabled: false,
        className: '',
    };

    handleFromFilterChange = (value) => {
        const { value: { numberTo } = {} } = this.props;
        this.props.onChange({
            type: DATA_TYPE.number,
            numberTo,
            numberFrom: value,
        });
    }

    handleToFilterChange = (value) => {
        const { value: { numberFrom } = {} } = this.props;
        this.props.onChange({
            type: DATA_TYPE.number,
            numberFrom,
            numberTo: value,
        });
    }

    render() {
        const {
            value = {},
            className,
            disabled,
        } = this.props;

        return (
            <div className={_cs(className, styles.numberFilter)} >
                <NumberInput
                    label={_ts('tabular.filter.number', 'fromPlaceholder')}
                    placeholder="Any"
                    disabled={disabled}
                    value={value.numberFrom}
                    onChange={this.handleFromFilterChange}
                    showHintAndError={false}
                    separator=" "
                />
                <NumberInput
                    className={styles.toInput}
                    label={_ts('tabular.filter.number', 'toPlaceholder')}
                    placeholder="Any"
                    disabled={disabled}
                    value={value.numberTo}
                    onChange={this.handleToFilterChange}
                    showHintAndError={false}
                    separator=" "
                />
            </div>
        );
    }
}
