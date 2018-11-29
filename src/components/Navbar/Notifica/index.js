import PropTypes from 'prop-types';
import React from 'react';
import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

import DropdownMenu from '#rsca/DropdownMenu';

import { iconNames } from '#constants';

import Notifications from '#views/Notifications';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const requests = {
    notificationCountRequest: {
        url: '/users/me/notification-count/',
        method: requestMethods.GET,
        query: () => ({ timestamp: (new Date()).getTime() }),
        onMount: true,
    },
};

@RequestCoordinator
@RequestClient(requests)
export default class Notifica extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            notificationCountRequest: {
                response: {
                    // TODO: use new instead of total
                    total: newNotificationCount = 0,
                } = {},
            },
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
                <div className={styles.count}>
                    { newNotificationCount }
                </div>
                <DropdownMenu
                    className={styles.dropdownMenu}
                    dropdownClassName={styles.notificationDropdown}
                    dropdownIcon={iconClassName}
                >
                    <Notifications className={styles.notifications} />
                </DropdownMenu>
            </div>
        );
    }
}
