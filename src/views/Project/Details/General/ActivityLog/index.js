import PropTypes from 'prop-types';
import React from 'react';

import ListView from '#rscv/List/ListView';
import _ts from '#ts';

import LogItem from './LogItem';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    log: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    log: [],
    className: '',
};

export default class ActivityLog extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static logItemKeySelector = l => l.key;

    logParam = (key, log) => ({
        user: log.user,
        time: log.timestamp,
        fields: log.fields,
    });

    render() {
        const {
            log,
            className,
        } = this.props;

        return (
            <div className={`${styles.activityLog} ${className}`}>
                <h3 className={styles.header}>
                    {_ts('components.activityLog', 'activityLogTitle')}
                </h3>
                <ListView
                    className={styles.log}
                    data={log}
                    renderer={LogItem}
                    rendererParams={this.logParam}
                    keySelector={ActivityLog.logItemKeySelector}
                />
            </div>
        );
    }
}
