import React from 'react';
import PropTypes from 'prop-types';

import FormattedDate from '#rscv/FormattedDate';
import { FaramOutputElement } from '#rscg/FaramElements';
import _ts from '#ts';

import styles from './styles.scss';

const emptyComponent = () => (
    <div className={styles.empty}>
        {_ts('widgets.view.dateRange', 'datePlaceholder')}
    </div>
);

const propTypes = {
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    value: {},
    className: '',
};

@FaramOutputElement
export default class DateRangeOutput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            value: {
                to,
                from,
            } = {},
            className,
        } = this.props;

        if (!to && !from) {
            return null;
        }

        return (
            <div className={className}>
                <FormattedDate
                    value={from}
                    className={styles.date}
                    mode="dd-MM-yyyy"
                    emptyComponent={emptyComponent}
                />
                <span className={styles.to}>
                    {_ts('widgets.view.dateRange', 'toLabel')}
                </span>
                <FormattedDate
                    value={to}
                    className={styles.date}
                    mode="dd-MM-yyyy"
                    emptyComponent={emptyComponent}
                />
            </div>
        );
    }
}
