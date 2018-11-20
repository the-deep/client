import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import FormattedDate from '#rscv/FormattedDate';

import { reverseRoute } from '#rsu/common';
import { pathNames } from '#constants';
import { camelToNormalCase } from '#utils/common';
import _ts from '#ts';

import styles from './styles.scss';

// TODO: Show all the edited fields in detail

const AggregatedLogItem = ({
    user: {
        name: userName,
        id: userId,
    },
    time,
    fields,
}) => {
    const fieldKeys = Object.keys(fields);
    const fieldKeysTitles = fieldKeys.map(f => camelToNormalCase(f));

    const log = _ts(
        'components.activityLog',
        'aggregatedLogItem',
        {
            fields: (
                <span className={styles.fields}>
                    {fieldKeysTitles.join(', ')}
                </span>
            ),
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

AggregatedLogItem.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
    }).isRequired,
    time: PropTypes.string.isRequired,
    fields: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default AggregatedLogItem;
