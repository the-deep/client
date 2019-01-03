import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';

import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

import {
    setNotificationsAction,
    updateNotificationAction,
    notificationItemsSelector,
    notificationsCountSelector,
} from '#redux';

import _ts from '#ts';

import ProjectJoinRequestItem from './items/ProjectJoinRequest';
import ProjectJoinRequestAbortItem from './items/ProjectJoinRequestAbort';
import ProjectJoinResponseItem from './items/ProjectJoinResponse';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    notificationsGetRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectJoinApproveRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectJoinRejectRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    notifications: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    notificationsGetRequest: {},
    projectJoinApproveRequest: {},
    projectJoinRejectRequest: {},
    notifications: [],
};

const NOTIFICATION_STATUS_UNSEEN = 'unseen';
const NOTIFICATION_STATUS_SEEN = 'seen';

const requests = {
    notificationsGetRequest: {
        url: '/notifications/',
        method: requestMethods.GET,
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

const mapStateToProps = state => ({
    notificationsCount: notificationsCountSelector(state),
    notifications: notificationItemsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNotifications: params => dispatch(setNotificationsAction(params)),
    updateNotification: params => dispatch(updateNotificationAction(params)),
});

const notificationItems = {
    project_join_request: ProjectJoinRequestItem,
    project_join_response: ProjectJoinResponseItem,
    project_join_request_abort: ProjectJoinRequestAbortItem,
};

const NotificationItem = ({ notification }) => {
    const Item = notificationItems[notification.notificationType];

    if (Item) {
        return <Item notification={notification} />;
    }

    return null;
};

NotificationItem.propTypes = {
    notification: PropTypes.shape({
        notificationTypes: PropTypes.string,
    }).isRequired,
};

const NotificationEmpty = () => (
    <Message>
        {_ts('notifications', 'noNotificationsText')}
    </Message>
);

const notificationKeySelector = n => n.id;
const notificationItemRendererParams = (_, d) => ({ notification: d });

const requestsToListen = [
    'projectJoinApproveRequest',
    'projectJoinRejectRequest',
    'notificationsGetRequest',
];

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requests, requestsToListen)
export default class Notifications extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static groupKeySelector = notification => (notification.data.status === 'pending' ? 'pending' : 'notPending');

    static pendingToNumber = a => (a === 'pending' ? 1 : 0);

    static groupComparator = (a, b) => (
        Notifications.pendingToNumber(b) - Notifications.pendingToNumber(a)
    )

    componentWillReceiveProps(nextProps) {
        // TODO: use request's onPropChange, once the feature gets implemented
        const {
            projectJoinApproveRequest: newProjectJoinApproveRequest,
            projectJoinRejectRequest: newProjectJoinRejectRequest,
            notificationsGetRequest,
        } = nextProps;

        const {
            projectJoinApproveRequest: oldProjectJoinApproveRequest,
            projectJoinRejectRequest: oldProjectJoinRejectRequest,
        } = this.props;

        if (newProjectJoinApproveRequest.pending !== oldProjectJoinApproveRequest.pending
            || newProjectJoinRejectRequest.pending !== oldProjectJoinRejectRequest.pending) {
            notificationsGetRequest.do();
        }
    }

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
            notificationsGetRequest: {
                pending: notificationsPending,
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
                    keySelector={notificationKeySelector}
                    renderer={NotificationItem}
                    rendererParams={notificationItemRendererParams}
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
