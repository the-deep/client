import React from 'react';
// import PropTypes from 'prop-types';

import TimeInput from '#rsci/TimeInput';
import Label from '#rsci/Label';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
export default class TimeRangeWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div className={styles.timeRange}>
                <div className={styles.to}>
                    <Label
                        text={_ts('widgets.tagging.timeRange', 'fromLabel')}
                        className={styles.label}
                        show
                    />
                    <TimeInput
                        className={styles.timeInput}
                        faramElementName="fromValue"
                        showLabel={false}
                        showHintAndError={false}
                    />
                </div>
                <div className={styles.from}>
                    <Label
                        text={_ts('widgets.tagging.timeRange', 'toLabel')}
                        className={styles.label}
                        show
                    />
                    <TimeInput
                        className={styles.timeInput}
                        faramElementName="toValue"
                        showLabel={false}
                        showHintAndError={false}
                    />
                </div>
            </div>
        );
    }
}
