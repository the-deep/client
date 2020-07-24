import React, { useState, useMemo, useCallback } from 'react';
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

const NOTIFICATION_STATUS_UNSEEN = 'unseen';
const NOTIFICATION_STATUS_SEEN = 'seen';

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

const NotificationItem = ({ notification, closeModal, onNotificationReload }) => {
    const Item = notificationItems[notification.notificationType];

    if (Item) {
        return (
            <Item
                closeModal={closeModal}
                notification={notification}
                notificationType={notification.notificationType}
                onNotificationReload={onNotificationReload}
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
                return {};
            }

            const lastDate = new Date();
            // Default is always 7 days old
            lastDate.setDate(lastDate.getDate() - 7);

            if (dateRange === '30d') {
                lastDate.setDate(lastDate.getDate() - 30);
            }
            return {
                isPending: !!isPending,
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
            props: {
                setNotifications,
                updateNotificationStatus,
            },
            response: { results },
        }) => {
            setNotifications({ notifications: results });
            const unseenNotifications = results.filter(
                d => d.status === NOTIFICATION_STATUS_UNSEEN,
            );

            if (unseenNotifications.length > 0) {
                const notificationStatusUpdateBody = unseenNotifications.map(
                    d => ({
                        id: d.id,
                        status: NOTIFICATION_STATUS_SEEN,
                    }),
                );
                updateNotificationStatus(notificationStatusUpdateBody);
            }
        },
    },
};

const notificationKeySelector = n => n.id;

const tabs = {
    notifications: _ts('notifications', 'notificationsTabLabel'),
    requests: _ts('notifications', 'requestsTabLabel'),
};

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
        },
        closeModal,
    } = props;

    const [activeTab, setActiveTab] = useState('notifications');
    const [dateRange, setDateRange] = useState('7d');

    const notificationItemRendererParams = useCallback((_, d) => ({
        closeModal,
        notification: d,
        onNotificationReload: reDoNotificationsRequest,
    }), [closeModal, reDoNotificationsRequest]);

    const filteredNotifications = useMemo(() => {
        if (activeTab === 'requests') {
            return notifications.filter(n => n.data.status === 'pending');
        }
        return notifications.filter(n => n.data.status !== 'pending');
    }, [notifications, activeTab]);

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
                data={filteredNotifications}
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
