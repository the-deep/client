import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Button from '#rsca/Button';
import FormattedDate from '#rscv/FormattedDate';
import styles from './styles.scss';

const NOTIFICATION_STATUS_UNSEEN = 'unseen';
const NOTIFICATION_STATUS_SEEN = 'seen';

const propTypes = {
    className: PropTypes.string,
    icon: PropTypes.element,
    message: PropTypes.element,
    actions: PropTypes.element,
    timestamp: PropTypes.string,
    seenStatus: PropTypes.bool,
    notificationId: PropTypes.number.isRequired,
    onNotificationSeenStatusChange: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    icon: undefined,
    message: undefined,
    actions: undefined,
    timestamp: undefined,
    seenStatus: false,
};

function Notification(props) {
    const {
        className: classNameFromProps,
        icon,
        message,
        actions,
        timestamp,
        seenStatus,
        notificationId,
        onNotificationSeenStatusChange,
    } = props;

    const handleNotificationSeenStatusChange = useCallback(() => {
        const newSeenStatus = seenStatus ? NOTIFICATION_STATUS_UNSEEN : NOTIFICATION_STATUS_SEEN;
        onNotificationSeenStatusChange(
            notificationId,
            newSeenStatus,
        );
    }, [onNotificationSeenStatusChange, notificationId, seenStatus]);

    return (
        <div className={_cs(classNameFromProps, styles.notification)}>
            <div className={styles.left}>
                { icon }
                { !icon &&
                    <Icon
                        name="defaultIcon"
                        className={styles.defaultIcon}
                    />
                }
            </div>
            <div className={styles.center}>
                <div className={styles.message}>
                    { message }
                </div>
                <div className={styles.timestamp}>
                    <Icon
                        className={styles.timestampIcon}
                        name="calendar"
                    />
                    <FormattedDate
                        className={styles.date}
                        date={timestamp}
                        mode="dd-MM-yyyy"
                    />
                </div>
                { actions && (
                    <div className={styles.actions}>
                        { actions }
                    </div>
                )}
            </div>
            <div className={styles.right}>
                <Button
                    className={styles.statusChangeButton}
                    transparent
                    iconName={seenStatus ? 'undo' : 'check'}
                    onClick={handleNotificationSeenStatusChange}
                />
            </div>
        </div>
    );
}

Notification.propTypes = propTypes;
Notification.defaultProps = defaultProps;

export default Notification;
