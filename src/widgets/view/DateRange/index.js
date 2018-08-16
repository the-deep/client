import React from 'react';
import PropTypes from 'prop-types';

import FormattedDate from '#rscv/FormattedDate';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.object,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    data: {},
};

const emptyComponent = () => (
    // FIXME: use strings
    <div className={styles.empty}>
        dd-mm-yyyy
    </div>
);

// eslint-disable-next-line react/prefer-stateless-function
export default class DateRangeViewWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            data: {
                fromValue,
                toValue,
            } = {},
            className,
        } = this.props;

        return (
            <div className={`${className} ${styles.dateRange}`}>
                <FormattedDate
                    date={fromValue}
                    className={styles.date}
                    mode="dd-MM-yyyy"
                    emptyComponent={emptyComponent}
                />
                <span className={styles.to}>
                    {_ts('widgets.view.dateRange', 'toLabel')}
                </span>
                <FormattedDate
                    className={styles.date}
                    date={toValue}
                    mode="dd-MM-yyyy"
                    emptyComponent={emptyComponent}
                />
            </div>
        );
    }
}
