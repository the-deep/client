import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

import DropdownMenu from '#rsca/DropdownMenu';
import { iconNames } from '#constants';

import {
    setNotificationsCountAction,
    notificationsCountSelector,
} from '#redux';

import Notifications from './Notifications';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    setNotificationsCount: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    notificationsStatusUpdateRequest: PropTypes.func.isRequired,
    notificationsCountRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    notificationsCount: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    notificationsCountRequest: {},
    className: '',
};

const requests = {
    notificationsCountRequest: {
        logWarning: false,
        logInfo: false,
        url: '/notifications/count/',
        method: requestMethods.GET,
        onSuccess: ({
            props: { setNotificationsCount },
            response: count,
            params: { startRequestDelayed },
        }) => {
            setNotificationsCount({ count });
            startRequestDelayed();
        },
        schemaName: 'notificationsCountResponse',
    },
    notificationsStatusUpdateRequest: {
        url: '/notifications/status/',
        method: requestMethods.PUT,
        body: ({ params: { body } }) => body,
        onSuccess: ({ params: { onSuccess } }) => {
            onSuccess();
        },
    },
};

const NOTIFICATION_POLL_INTERVAL = 120000;

const mapStateToProps = state => ({
    notificationsCount: notificationsCountSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNotificationsCount: params => dispatch(setNotificationsCountAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requests)
export default class Notifica extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // TODO: use request's shouldPoll once it is usable
    componentDidMount() {
        this.startRequest();
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    startRequest = () => {
        const { notificationsCountRequest } = this.props;

        notificationsCountRequest.do({
            startRequestDelayed: this.startRequestDelayed,
        });
    }

    startRequestDelayed = () => {
        this.timeout = setTimeout(
            this.startRequest,
            NOTIFICATION_POLL_INTERVAL,
        );
    }

    handleNotificationsStatusUpdateSuccess = () => {
        this.startRequest();
    }

    updateNotificationStatus = (body) => {
        const { notificationsStatusUpdateRequest } = this.props;
        notificationsStatusUpdateRequest.do({
            body,
            onSuccess: this.handleNotificationsStatusUpdateSuccess,
        });
    }

    render() {
        const {
            className: classNameFromProps,
            notificationsCount: {
                unseen: unseenNotificationCount = 0,
            } = {},
        } = this.props;

        const iconClassName = `
            ${iconNames.notification}
            ${styles.icon}
        `;

        const className = `
            ${classNameFromProps}
            ${styles.notifica}
        `;

        return (
            <div className={className}>
                { unseenNotificationCount > 0 && (
                    <div className={styles.count}>
                        { unseenNotificationCount }
                    </div>
                )}
                <DropdownMenu
                    className={styles.dropdownMenu}
                    dropdownClassName={styles.notificationDropdown}
                    dropdownIcon={iconClassName}
                >
                    <Notifications
                        className={styles.notifications}
                        updateNotificationStatus={this.updateNotificationStatus}
                    />
                </DropdownMenu>
            </div>
        );
    }
}
