import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import DropdownMenu from '#rsca/DropdownMenu';

import {
    setNotificationsCountAction,
    notificationsCountSelector,
} from '#redux';

import Notifications from './Notifications';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    setNotificationsCount: PropTypes.func.isRequired,
    notificationsCount: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: undefined,
};

const requestOptions = {
    notificationsCountRequest: {
        logWarning: false,
        logInfo: false,
        url: '/notifications/count/',
        method: methods.GET,
        onSuccess: ({
            props: { setNotificationsCount },
            response: count,
            params: { startRequestDelayed },
        }) => {
            setNotificationsCount({ count });
            startRequestDelayed();
        },
        extras: {
            schemaName: 'notificationsCountResponse',
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
@RequestClient(requestOptions)
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
        const {
            requests: {
                notificationsCountRequest,
            },
        } = this.props;

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

    render() {
        const {
            className: classNameFromProps,
            notificationsCount: {
                unseenNotifications = 0,
                unseenRequests = 0,
            } = {},
        } = this.props;

        return (
            <div className={_cs(classNameFromProps, styles.notifica)}>
                { unseenNotifications > 0 && (<div className={styles.count} />)}
                { unseenRequests > 0 && (<div className={styles.requestCount} />)}
                <DropdownMenu
                    className={styles.dropdownMenu}
                    dropdownClassName={styles.notificationDropdown}
                    dropdownIcon="notification"
                    dropdownIconClassName={styles.icon}
                >
                    <Notifications
                        className={styles.notifications}
                        unseenNotificationsCount={unseenNotifications}
                        unseenRequestsCount={unseenRequests}
                    />
                </DropdownMenu>
            </div>
        );
    }
}
