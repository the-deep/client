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
                    <div className={styles.to}>
                        <Label
                            text={_ts('widgets.tagging.dateRange', 'fromLabel')}
                            className={styles.label}
                            show
                        />
                        <DateInput
                            className={styles.dateInput}
                            faramElementName="fromValue"
                            showLabel={false}
                            showHintAndError={false}
                        />
                    </div>
                    <div className={styles.from}>
                        <Label
                            text={_ts('widgets.tagging.dateRange', 'toLabel')}
                            className={styles.label}
                            show
                        />
                        <DateInput
                            className={styles.dateInput}
                            faramElementName="toValue"
                            showLabel={false}
                            showHintAndError={false}
                        />
                    </div>
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
