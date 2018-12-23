import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import FormattedDate from '#rscv/FormattedDate';

import { reverseRoute } from '#rsu/common';
import {
    pathNames,
    iconNames,
} from '#constants';
import { camelToNormalCase } from '#utils/common';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

// TODO: Show all the edited fields in detail

const AggregatedLogItem = ({
    user,
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
                { user && (
                    <div className={styles.user}>
                        <span className={_cs(iconNames.user, styles.icon)} />
                        <Link
                            className={styles.link}
                            target="_blank"
                            to={reverseRoute(pathNames.userProfile, { userId: user.id })}
                        >
                            {user.name}
                        </Link>
                    </div>
                )}
                <span className={styles.date} >
                    <span className={_cs(iconNames.calendar, styles.icon)} />
                    <FormattedDate
                        className={styles.formattedDate}
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
