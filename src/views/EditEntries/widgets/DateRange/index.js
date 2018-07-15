import React from 'react';
// import PropTypes from 'prop-types';

import DateInput from '#rs/components/Input/DateInput';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
export default class DateRangeWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div className={styles.dateRange}>
                <DateInput
                    className={styles.dateInput}
                    faramElementName="fromValue"
                    showLabel={false}
                    showHintAndError={false}
                />
                <span className={styles.to}>
                    {_ts('editEntry.widgets', 'dateRangeToLabel')}
                </span>
                <DateInput
                    className={styles.dateInput}
                    faramElementName="toValue"
                    showLabel={false}
                    showHintAndError={false}
                />
            </div>
        );
    }
}
