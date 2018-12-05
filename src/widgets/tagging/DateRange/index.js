import React from 'react';
// import PropTypes from 'prop-types';

import AccentButton from '#rsca/Button/AccentButton';
import DateInput from '#rsci/DateInput';
import Label from '#rsci/Label';
import _ts from '#ts';
import { iconNames } from '#constants';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
export default class DateRangeWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static handleValueSwap = value => ({
        ...value,
        toValue: value.fromValue,
        fromValue: value.toValue,
    })

    render() {
        return (
            <div className={styles.dateRange}>
                <div className={styles.inputs}>
                    <DateInput
                        className={styles.dateInput}
                        label={_ts('widgets.tagging.dateRange', 'fromLabel')}
                        faramElementName="fromValue"
                    />
                    <DateInput
                        className={styles.dateInput}
                        label={_ts('widgets.tagging.dateRange', 'toLabel')}
                        faramElementName="toValue"
                    />
                </div>
                <div className={styles.actions}>
                    <AccentButton
                        title={_ts('widgets.tagging.dateRange', 'swapButtonTitle')}
                        iconName={iconNames.swap}
                        faramElementName="swap-button"
                        faramAction={DateRangeWidget.handleValueSwap}
                        transparent
                    />
                </div>
            </div>
        );
    }
}
