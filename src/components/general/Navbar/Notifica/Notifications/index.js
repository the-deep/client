import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';

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

const NotificationEmpty = () => (
    <Message>
        {_ts('notifications', 'noNotificationsText')}
    </Message>
);

const propTypes = {
    className: PropTypes.string,
    notifications: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    closeModal: PropTypes.func,
};

const defaultProps = {
    className: '',
    notifications: [],
    closeModal: undefined,
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

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requestOptions)
export default class Notifications extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static notificationKeySelector = n => n.id;

    static groupKeySelector = notification => (
        notification.data.status === 'pending' ? 'pending' : 'notPending'
    );

    static pendingToNumber = a => (a === 'pending' ? 1 : 0);

    static groupComparator = (a, b) => (
        Notifications.pendingToNumber(b) - Notifications.pendingToNumber(a)
    )

    notificationItemRendererParams = (_, d) => ({
        closeModal: this.props.closeModal,
        notification: d,
        onNotificationReload: this.props.requests.notificationsGetRequest.do,
    });

    groupRendererParams = (groupKey) => {
        const pendingTitle = _ts('notifications', 'pendingHeaderTitle');
        const otherTitle = _ts('notifications', 'otherHeaderTitle');

        const children = groupKey === 'pending' ? pendingTitle : otherTitle;
        return { children };
    }

    render() {
        const {
            className: classNameFromProps,
            notifications,
            requests: {
                notificationsGetRequest: { pending: notificationsPending },
            },
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.notifications}
        `;

        return (
            <div className={className} >
                { notificationsPending && (
                    <div className={styles.loadingAnimation}>
                        <LoadingAnimation />
                    </div>
                )}
                {/*
                TODO: Fix heading
                <header className={styles.header} >
                    <h3 className={styles.heading} >
                        {_ts('notifications', 'notificationHeaderTitle')}
                    </h3>
                    { notificationsPending && (
                        <div className={styles.loadingAnimation}>
                            <LoadingAnimation
                                small
                            />
                        </div>
                    )}
                </header>
                */}
                <ListView
                    className={styles.content}
                    data={notifications}
                    keySelector={Notifications.notificationKeySelector}
                    renderer={NotificationItem}
                    rendererParams={this.notificationItemRendererParams}
                    groupKeySelector={Notifications.groupKeySelector}
                    groupRendererParams={this.groupRendererParams}
                    groupRendererClassName={styles.heading}
                    groupComparator={Notifications.groupComparator}
                    emptyComponent={NotificationEmpty}
                />
            </div>
        );
    }
}
