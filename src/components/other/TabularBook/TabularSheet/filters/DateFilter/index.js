
import PropTypes from 'prop-types';
import React from 'react';

import DateInput from '#rsci/DateInput';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

export default class DateFilter extends React.PureComponent {
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
            <div className={_cs(className, styles.dateFilter)} >
                <DateInput
                    placeholder={_ts('tabular.sheets.date', 'fromPlaceholder')}
                    disabled={disabled}
                    value={value.from}
                    onChange={this.handleFromFilterChange}
                    showLabel={false}
                    showHintAndError={false}
                />
                <DateInput
                    className={styles.toInput}
                    placeholder={_ts('tabular.sheets.date', 'toPlaceholder')}
                    disabled={disabled}
                    value={value.to}
                    onChange={this.handleToFilterChange}
                    showLabel={false}
                    showHintAndError={false}
                />
            </div>
        );
    }
}
