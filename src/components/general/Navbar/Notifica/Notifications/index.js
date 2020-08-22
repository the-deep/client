import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    _cs,
    encodeDate,
} from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import ScrollTabs from '#rscv/ScrollTabs';
import SegmentInput from '#rsci/SegmentInput';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import {
    setNotificationsAction,
    notificationItemsSelector,
    notificationsCountSelector,
} from '#redux';

import { getDateWithTimezone } from '#utils/common';

import _ts from '#ts';

import ProjectJoinRequestItem from './items/ProjectJoinRequest';
import ProjectJoinRequestAbortItem from './items/ProjectJoinRequestAbort';
import ProjectJoinResponseItem from './items/ProjectJoinResponse';
import EntryCommentItem from './items/EntryCommentItem';

import styles from './styles.scss';

const notificationItems = {
    project_join_request: ProjectJoinRequestItem,
    project_join_response: ProjectJoinResponseItem,
    project_join_request_abort: ProjectJoinRequestAbortItem,

    entry_comment_add: EntryCommentItem,
    entry_comment_reply_add: EntryCommentItem,
    entry_comment_resolved: EntryCommentItem,
    entry_comment_assignee_change: EntryCommentItem,
    entry_comment_modify: EntryCommentItem,
    entry_comment_reply_modify: EntryCommentItem,
};

const NotificationItem = ({
    notification,
    closeModal,
    onNotificationReload,
    onNotificationSeenStatusChange,
}) => {
    const Item = notificationItems[notification.notificationType];

    if (Item) {
        return (
            <Item
                closeModal={closeModal}
                notification={notification}
                notificationType={notification.notificationType}
                onNotificationReload={onNotificationReload}
                onNotificationSeenStatusChange={onNotificationSeenStatusChange}
            />
        );
    }

    console.error(`Item not found for notification type: ${notification.notificationType}`);

    return null;
};

NotificationItem.propTypes = {
    notification: PropTypes.shape({
        notificationType: PropTypes.string,
    }).isRequired,
    closeModal: PropTypes.func.isRequired,
    onNotificationReload: PropTypes.func.isRequired,
    onNotificationSeenStatusChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    notificationsCount: notificationsCountSelector(state),
    notifications: notificationItemsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNotifications: params => dispatch(setNotificationsAction(params)),
});

const requestOptions = {
    notificationsGetRequest: {
        url: '/notifications/',
        query: ({ params: {
            dateRange,
            isPending,
        } }) => {
            if (dateRange === 'all') {
                return {
                    is_pending: !!isPending,
                };
            }

            const lastDate = new Date();
            // Default is always 7 days old
            lastDate.setDate(lastDate.getDate() - 7);

            if (dateRange === '30d') {
                lastDate.setDate(lastDate.getDate() - 30);
            }
            return {
                is_pending: !!isPending,
                timestamp__gte: getDateWithTimezone(encodeDate(lastDate)),
            };
        },
        method: methods.GET,
        onMount: true,
        onPropsChanged: {
            notificationsCount: ({
                props: {
                    notificationsCount: {
                        unseen: newUnseenNotificationCount,
                        total: newTotalNotificationCount,
                    },
                },
                prevProps: {
                    notificationsCount: {
                        total: oldTotalNotificationCount,
                    },
                },
            }) => newTotalNotificationCount !== oldTotalNotificationCount
                || newUnseenNotificationCount > 0,
        },
        onSuccess: ({
            props: { setNotifications },
            response: { results },
        }) => {
            setNotifications({ notifications: results });
        },
    },
    notificationStatusUpdateRequest: {
        url: '/notifications/status/',
        method: methods.PUT,
        body: ({ params: { body } }) => body,
        onSuccess: ({ params: { onSuccess } }) => {
            onSuccess();
        },
    },
};

const notificationKeySelector = n => n.id;

const tabs = {
    notifications: (
        <div className={styles.tabTitle}>
            <span className={_cs(styles.count, styles.notificationsCount)} />
            {_ts('notifications', 'notificationsTabLabel')}
        </div>
    ),
    requests: (
        <div className={styles.tabTitle}>
            <span className={_cs(styles.count, styles.requestsCount)} />
            {_ts('notifications', 'requestsTabLabel')}
        </div>
    ),
};

const seenStatusOptions = [
    {
        key: 'read',
        label: _ts('notifications', 'readNotificationsLabel'),
    },
    {
        key: 'unread',
        label: _ts('notifications', 'unreadNotificationsLabel'),
    },
    {
        key: 'all',
        label: _ts('notifications', 'allNotificationsLabel'),
    },
];

const dateRangeOptions = [
    {
        key: '7d',
        label: _ts('notifications', '7daysLabel'),
    },
    {
        key: '30d',
        label: _ts('notifications', '30daysLabel'),
    },
    {
        key: 'all',
        label: _ts('notifications', 'allDaysLabel'),
    },
];

const seenStatusKeySelector = d => d.key;
const seenStatusLabelSelector = d => d.label;

const dateRangeKeySelector = d => d.key;
const dateRangeLabelSelector = d => d.label;

const emptyNotifications = () => (
    <Message>{_ts('notifications', 'noNotificationsText')}</Message>
);

const emptyRequests = () => (
    <Message>{_ts('notifications', 'noPendingActionsText')}</Message>
);

function Notifications(props) {
    const {
        className: classNameFromProps,
        notifications,
        requests: {
            notificationsGetRequest: {
                pending: notificationsPending,
                do: reDoNotificationsRequest,
            },
            notificationStatusUpdateRequest: {
                do: notificationStatusUpdate,
            },
        },
        closeModal,
    } = props;

    const [activeTab, setActiveTab] = useState('notifications');
    const [dateRange, setDateRange] = useState('7d');
    const [seenStatus, setSeenStatus] = useState('all');

    const handleNotificationsReload = useCallback(() => {
        reDoNotificationsRequest({
            dateRange,
            isPending: activeTab === 'requests',
        });
    }, [reDoNotificationsRequest, activeTab, dateRange]);

    const handleNotificationSeenStatusChange = useCallback((
        notificationId,
        newSeenStatus,
    ) => {
        notificationStatusUpdate({
            body: [{
                id: notificationId,
                status: newSeenStatus,
            }],
        });
    }, [notificationStatusUpdate]);

    const notificationItemRendererParams = useCallback((_, d) => ({
        closeModal,
        notification: d,
        onNotificationReload: handleNotificationsReload,
        onNotificationSeenStatusChange: handleNotificationSeenStatusChange,
    }), [
        closeModal,
        handleNotificationsReload,
        handleNotificationSeenStatusChange,
    ]);

    const handleTabChange = useCallback((newTab) => {
        setActiveTab(newTab);
        reDoNotificationsRequest({
            dateRange,
            isPending: newTab === 'requests',
        });
    }, [
        dateRange,
        setActiveTab,
        reDoNotificationsRequest,
    ]);

    const handleSeenStatusChange = useCallback((newSeenStatus) => {
        setSeenStatus(newSeenStatus);
        reDoNotificationsRequest({
            isPending: activeTab === 'requests',
            dateRange,
        });
    }, [activeTab, setSeenStatus, dateRange, reDoNotificationsRequest]);

    const handleDateRangeChange = useCallback((newDateRange) => {
        setDateRange(newDateRange);
        reDoNotificationsRequest({
            isPending: activeTab === 'requests',
            dateRange: newDateRange,
        });
    }, [activeTab, setDateRange, reDoNotificationsRequest]);

    return (
        <div className={_cs(classNameFromProps, styles.notifications)} >
            { notificationsPending && <LoadingAnimation />}
            <ScrollTabs
                tabs={tabs}
                onClick={handleTabChange}
                active={activeTab}
            >
                <SegmentInput
                    className={styles.seenStatus}
                    options={seenStatusOptions}
                    keySelector={seenStatusKeySelector}
                    labelSelector={seenStatusLabelSelector}
                    value={seenStatus}
                    onChange={handleSeenStatusChange}
                    showHintAndError={false}
                    showLabel={false}
                />
                <SegmentInput
                    className={styles.dateRange}
                    options={dateRangeOptions}
                    keySelector={dateRangeKeySelector}
                    labelSelector={dateRangeLabelSelector}
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    showHintAndError={false}
                    showLabel={false}
                />
            </ScrollTabs>
            <ListView
                className={styles.content}
                data={notifications}
                keySelector={notificationKeySelector}
                renderer={NotificationItem}
                rendererParams={notificationItemRendererParams}
                emptyComponent={activeTab === 'requests' ? emptyRequests : emptyNotifications}
            />
        </div>
    );
}

Notifications.propTypes = {
    className: PropTypes.string,
    notifications: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    closeModal: PropTypes.func,
};

Notifications.defaultProps = {
    className: '',
    notifications: [],
    closeModal: undefined,
};

export default connect(mapStateToProps, mapDispatchToProps)(
    RequestCoordinator(RequestClient(requestOptions)(Notifications)),
);
