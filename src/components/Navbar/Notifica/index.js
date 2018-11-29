import PropTypes from 'prop-types';
import React from 'react';

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

export default class Notifica extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { className } = this.props;

        const iconClassName = `
            ${iconNames.notification}
            ${styles.icon}
        `;

        return (
            <DropdownMenu
                className={className}
                dropdownClassName={styles.notificationDropdown}
                dropdownIcon={iconClassName}
            >
                <Notifications className={styles.notifications} />
            </DropdownMenu>
        );
    }
}
