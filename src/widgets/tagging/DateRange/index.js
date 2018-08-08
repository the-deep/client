import React from 'react';
// import PropTypes from 'prop-types';

import DateInput from '#rsci/DateInput';
import Label from '#rsci/Label';
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
        );
    }
}
