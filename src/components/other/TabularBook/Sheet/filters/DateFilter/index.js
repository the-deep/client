import PropTypes from 'prop-types';
import React from 'react';

import DateInput from '#rsci/DateInput';

import { DATA_TYPE } from '#entities/tabular';
import _ts from '#ts';

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
        const { value: { dateTo } = {} } = this.props;
        this.props.onChange({
            type: DATA_TYPE.datetime,
            dateTo,
            dateFrom: value,
        });
    }

    handleToFilterChange = (value) => {
        const { value: { dateFrom } = {} } = this.props;
        this.props.onChange({
            type: DATA_TYPE.datetime,
            dateFrom,
            dateTo: value,
        });
    }

    render() {
        const {
            value = {},
            className,
            disabled,
        } = this.props;
        return (
            <div className={className} >
                <DateInput
                    placeholder={_ts('tabular.filter.date', 'fromPlaceholder')}
                    disabled={disabled}
                    value={value.dateFrom}
                    onChange={this.handleFromFilterChange}
                    showLabel={false}
                    showHintAndError={false}
                />
                <DateInput
                    placeholder={_ts('tabular.filter.date', 'toPlaceholder')}
                    disabled={disabled}
                    value={value.dateTo}
                    onChange={this.handleToFilterChange}
                    showLabel={false}
                    showHintAndError={false}
                />
            </div>
        );
    }
}
