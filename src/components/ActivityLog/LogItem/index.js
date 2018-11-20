import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import FormattedDate from '#rscv/FormattedDate';

import { reverseRoute } from '#rsu/common';
import { pathNames } from '#constants';
import { camelToNormalCase } from '#utils/common';
import _ts from '#ts';

import AggregatedLogItem from '../AggregatedLogItem';
import styles from './styles.scss';

const LogItem = ({
    user,
    time,
    fields,
}) => {
    if (Object.keys(fields).length > 1) {
        return (
            <AggregatedLogItem
                user={user}
                time={time}
                fields={fields}
            />
        );
    }
    const {
        name: userName,
        id: userId,
    } = user;

    const fieldKey = Object.keys(fields)[0];
    let oldValue = fields[fieldKey].old;
    let newValue = fields[fieldKey].new;

    let logDescription = 'logDescription';
    if (typeof newValue === 'object') {
        oldValue = oldValue && oldValue.title;
        newValue = newValue.title;
    }
    if (oldValue === '' || oldValue === undefined) {
        logDescription = 'logDescriptionNew';
    }
    //
    // This is written for string library to show these there
    // _ts('components.activityLog', 'logDescription')
    // _ts('components.activityLog', 'logDescriptionNew')

    const log = _ts(
        'components.activityLog',
        logDescription,
        {
            field: (
                <span className={styles.value}>
                    {camelToNormalCase(fieldKey)}
                </span>
            ),
            oldValue: (
                <span className={styles.value}>
                    {oldValue}
                </span>
            ),
            newValue: (
                <span className={styles.value}>
                    {newValue}
                </span>
            ),
            /*
             * TODO: Required for links, write a map for all type of items
                oldValue: (
                    <Link
                        className={styles.link}
                        target="_blank"
                        to={reverseRoute(pathNames[fieldKey], { [`${fieldKey}Id`]: oldValue.id })}
                    >
                        {oldValue.title}
                    </Link>
                ),
                newValue: (
                    <Link
                        className={styles.link}
                        target="_blank"
                        to={reverseRoute(pathNames[fieldKey], { [`${fieldKey}Id`]: newValue.id })}
                    >
                        {newValue.title}
                    </Link>
                ),
                */
        },
    );

    return (
        <div className={styles.logItem} >
            <div className={styles.log}>
                {log}
            </div>
            <div className={styles.metaData}>
                <Link
                    className={styles.user}
                    target="_blank"
                    to={reverseRoute(pathNames.userProfile, { userId })}
                >
                    {userName}
                </Link>
                <span className={styles.date} >
                    <FormattedDate
                        date={time}
                        mode="dd-MM-yyyy"
                    />
                </span>
            </div>
        </div>
    );
};

LogItem.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
    }).isRequired,
    time: PropTypes.string.isRequired,
    fields: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default LogItem;
