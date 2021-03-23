import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Button from '#rsca/Button';
import FormattedDate from '#rscv/FormattedDate';
import ReactMarkdown from 'react-markdown';

import _ts from '#ts';

import styles from './styles.scss';

export const NOTIFICATION_STATUS_UNSEEN = 'unseen';
export const NOTIFICATION_STATUS_SEEN = 'seen';

const propTypes = {
    className: PropTypes.string,
    icon: PropTypes.element,
    message: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
        PropTypes.node,
    ]),
    actions: PropTypes.element,
    timestamp: PropTypes.string,
    seenStatus: PropTypes.bool,
    notificationId: PropTypes.number.isRequired,
    onNotificationSeenStatusChange: PropTypes.func.isRequired,
    description: PropTypes.string,
    descriptionLabel: PropTypes.string,
};

const defaultProps = {
    className: '',
    icon: undefined,
    message: undefined,
    actions: undefined,
    timestamp: undefined,
    seenStatus: false,
    description: '',
    descriptionLabel: undefined,
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
        description,
        descriptionLabel,
    } = props;

    const handleNotificationSeenStatusChange = useCallback(() => {
        const newSeenStatus = seenStatus ? NOTIFICATION_STATUS_UNSEEN : NOTIFICATION_STATUS_SEEN;
        onNotificationSeenStatusChange(
            notificationId,
            newSeenStatus,
        );
    }, [onNotificationSeenStatusChange, notificationId, seenStatus]);

    const [isExpanded, setExpanded] = useState(false);

    const handleButtonClick = useCallback(() => {
        setExpanded(currentIsExpanded => !currentIsExpanded);
    }, [setExpanded]);

    return (
        <div
            className={_cs(
                classNameFromProps,
                styles.notification,
                seenStatus && styles.read,
            )}
        >
            <div className={styles.left}>
                { icon }
                { !icon &&
                    <Icon
                        name="defaultIcon"
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
                        mode="dd-MM-yyyy at hh:mm aaa"
                    />
                    {isTruthyString(description) && (
                        <Button
                            className={styles.expandButton}
                            transparent
                            onClick={handleButtonClick}
                            iconName="chat"
                        >
                            {isExpanded
                                ? _ts('notifications', 'hideLabel', { label: descriptionLabel })
                                : _ts('notifications', 'showLabel', { label: descriptionLabel })
                            }
                        </Button>
                    )}
                </div>
                {isTruthyString(description) && (
                    <div className={styles.extraTextContainer}>
                        {isExpanded && (
                            <ReactMarkdown
                                className={styles.description}
                                source={description}
                            />
                        )}
                    </div>
                )}
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
                    title={seenStatus
                        ? _ts('notifications', 'markAsPendingLabel')
                        : _ts('notifications', 'markAsCompletedLabel')
                    }
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
