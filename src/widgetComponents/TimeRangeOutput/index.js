import React from 'react';
import PropTypes from 'prop-types';
import { FaramOutputElement } from '@togglecorp/faram';

import FormattedTime from '#rscv/FormattedTime';
import _ts from '#ts';

import styles from './styles.scss';

// FIXME: use strings
const emptyComponent = () => (
    <div className={styles.empty}>
        hh:mm
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
export default class TimeRangeOutput extends React.PureComponent {
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
                <FormattedTime
                    value={from}
                    mode="hh:mm"
                    emptyComponent={emptyComponent}
                />
                <span className={styles.to}>
                    {_ts('widgets.view.timeRange', 'toLabel')}
                </span>
                <FormattedTime
                    value={to}
                    mode="hh:mm"
                    emptyComponent={emptyComponent}
                />
            </div>
        );
    }
}
