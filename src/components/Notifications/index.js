import PropTypes from 'prop-types';
import React from 'react';

import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

import _ts from '#ts';

import ProjectJoinRequestItem from './items/ProjectJoinRequest';
import ProjectJoinRequestAbortItem from './items/ProjectJoinRequestAbort';
import ProjectJoinResponseItem from './items/ProjectJoinResponse';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    notificationsGetRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    notificationsGetRequest: {},
};

const requests = {
    notificationsGetRequest: {
        url: '/notifications/',
        method: requestMethods.GET,
        onMount: true,
        isUnique: true,
        onSuccess: ({ props: { onRequestSuccess } }) => {
            if (onRequestSuccess) {
                onRequestSuccess();
            }
        },
    },
};

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
    <div className={styles.emptyComponent} >
        {_ts('notifications', 'noNotificationsText')}
    </div>
);

const notificationKeySelector = n => n.id;
const notificationItemRendererParams = (_, d) => ({ notification: d });

const emptyObject = {};
const emptyList = [];

const requestsToListen = [
    'projectJoinApproveRequest',
    'projectJoinRejectRequest',
    'notificationsGetRequest',
];

@RequestCoordinator
@RequestClient(requests, requestsToListen)
export default class Notifications extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillReceiveProps(nextProps) {
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

    render() {
        const {
            className: classNameFromProps,
            notificationsGetRequest: {
                pending: notificationsPending,
                response: {
                    results: notifications = emptyList,
                } = emptyObject,
            },
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.notifications}
        `;

        return (
            <div className={className} >
                {notificationsPending && <LoadingAnimation />}
                <header className={styles.header} >
                    <h4 className={styles.heading} >
                        {_ts('notifications', 'notificationHeaderTitle')}
                    </h4>
                </header>
                <ListView
                    className={styles.content}
                    data={notifications}
                    keySelector={notificationKeySelector}
                    renderer={NotificationItem}
                    rendererParams={notificationItemRendererParams}
                    emptyComponent={NotificationEmpty}
                />
            </div>
        );
    }
}
