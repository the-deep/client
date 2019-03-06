import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { reverseRoute, isObject } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import FormattedDate from '#rscv/FormattedDate';

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
    const fieldKeys = Object.keys(fields);

    // If the number of fields is zero, we show nothing
    if (fieldKeys.length === 0) {
        return null;
    }
    // If the number of fields is more than one, show aggregated log item
    if (fieldKeys.length > 1) {
        return (
            <AggregatedLogItem
                user={user}
                time={time}
                fields={fields}
            />
        );
    }

    const fieldKey = fieldKeys[0];
    const field = fields[fieldKey];

    const oldValue = isObject(field.old)
        ? field.old.title
        : field.old;

    const newValue = isObject(field.new)
        ? field.new.title
        : field.new;

    // This is written for string library to show these there
    // _ts('components.activityLog', 'logDescription')
    // _ts('components.activityLog', 'logDescriptionNew')
    const logDescription = (oldValue === '' || oldValue === undefined)
        ? 'logDescriptionNew'
        : 'logDescription';

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
            /* TODO: Required for links, write a map for all type of items
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
                { user && (
                    <div className={styles.user}>
                        <Icon
                            className={styles.icon}
                            name="user"
                        />
                        <Link
                            className={styles.link}
                            target="_blank"
                            to={reverseRoute(pathNames.userProfile, { userId: user.id })}
                        >
                            {user.name}
                        </Link>
                    </div>
                )}
                <div className={styles.date} >
                    <Icon
                        className={styles.icon}
                        name="calendar"
                    />
                    <FormattedDate
                        className={styles.formattedDate}
                        date={time}
                        mode="dd-MM-yyyy"
                    />
                </div>
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
