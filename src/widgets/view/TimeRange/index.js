import React from 'react';
import PropTypes from 'prop-types';

import NormalFormattedTime from '#rscv/FormattedTime';
import { FaramOutputElement } from '#rscg/FaramElements';
import _ts from '#ts';

import styles from './styles.scss';

const FormattedTime = FaramOutputElement(NormalFormattedTime);

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const emptyComponent = () => (
    // FIXME: use strings
    <div className={styles.empty}>
        hh:mm
    </div>
);

// eslint-disable-next-line react/prefer-stateless-function
export default class TimeRangeViewWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
        } = this.props;

        return (
            <div className={`${className} ${styles.timeRange}`}>
                <FormattedTime
                    faramElementName="fromValue"
                    className={styles.time}
                    mode="hh:mm"
                    emptyComponent={emptyComponent}
                />
                <span className={styles.to}>
                    {_ts('widgets.view.timeRange', 'toLabel')}
                </span>
                <FormattedTime
                    faramElementName="toValue"
                    className={styles.time}
                    mode="hh:mm"
                    emptyComponent={emptyComponent}
                />
            </div>
        );
    }
}
