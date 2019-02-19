import React from 'react';
// import PropTypes from 'prop-types';
import { FaramGroup } from '@togglecorp/faram';

import AccentButton from '#rsca/Button/AccentButton';
import TimeInput from '#rsci/TimeInput';
import _ts from '#ts';
import { iconNames } from '#constants';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
export default class TimeRangeWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static handleValueSwap = value => ({
        ...value,
        to: value.from,
        from: value.to,
    })

    render() {
        return (
            <div className={styles.timeRange}>
                <FaramGroup faramElementName="value">
                    <div className={styles.inputs}>
                        <TimeInput
                            className={styles.timeInput}
                            label={_ts('widgets.tagging.timeRange', 'fromLabel')}
                            faramElementName="from"
                        />
                        <TimeInput
                            className={styles.timeInput}
                            label={_ts('widgets.tagging.timeRange', 'toLabel')}
                            faramElementName="to"
                        />
                    </div>
                    <div className={styles.actions}>
                        <AccentButton
                            title={_ts('widgets.tagging.timeRange', 'swapButtonTitle')}
                            iconName={iconNames.swap}
                            faramElementName="swap-button"
                            faramAction={TimeRangeWidget.handleValueSwap}
                            transparent
                        />
                    </div>
                </FaramGroup>
            </div>
        );
    }
}
