import PropTypes from 'prop-types';
import React from 'react';

import NumberInput from '#rsci/NumberInput';
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
        this.props.onChange({
            ...this.props.value,
            from: value,
        });
    }

    handleToFilterChange = (value) => {
        this.props.onChange({
            ...this.props.value,
            to: value,
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
                    placeholder={_ts('tabular.sheets.number', 'fromPlaceholder')}
                    disabled={disabled}
                    value={value.from}
                    onChange={this.handleFromFilterChange}
                    showLabel={false}
                    showHintAndError={false}
                    separator=" "
                />
                <NumberInput
                    className={styles.toInput}
                    placeholder={_ts('tabular.sheets.number', 'toPlaceholder')}
                    disabled={disabled}
                    value={value.to}
                    onChange={this.handleToFilterChange}
                    showLabel={false}
                    showHintAndError={false}
                    separator=" "
                />
            </div>
        );
    }
}
