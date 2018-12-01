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
    notificationsGetRequest: PropTypes.object, // eslint-disable-line react/forbid-props-types
};

const defaultProps = {
    notificationsGetRequest: {},
};

const requests = {
    notificationsGetRequest: {
        url: '/notifications/',
        method: requestMethods.GET,
        onMount: true,
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

const notificationKeySelector = n => n.id;
const notificationItemRendererParams = (_, d) => ({ notification: d });

const emptyObject = {};
const emptyList = [];

@RequestCoordinator
@RequestClient(requests)
export default class Notifications extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
                    <h3 className={styles.heading} >
                        {_ts('notifications', 'notificationHeaderTitle')}
                    </h3>
                </header>
                <ListView
                    className={styles.content}
                    data={notifications}
                    keySelector={notificationKeySelector}
                    renderer={NotificationItem}
                    rendererParams={notificationItemRendererParams}
                />
            </div>
        );
    }
}
