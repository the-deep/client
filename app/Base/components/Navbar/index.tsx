import React, { useCallback, useContext, useRef, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
    Border,
    QuickActionLink,
    QuickActionDropdownMenu,
    DropdownMenu,
    DropdownMenuItem,
    useConfirmation,
    useAlert,
    Svg,
} from '@the-deep/deep-ui';
import {
    IoHelp,
    IoCompassOutline,
    IoNotificationsOutline,
    IoLogInOutline,
    IoLogOutOutline,
} from 'react-icons/io5';

import Notifications from '#components/Notifications';
import SmartNavLink from '#base/components/SmartNavLink';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import Avatar from '#components/Avatar';
import { UserContext } from '#base/context/UserContext';
import route from '#base/configs/routes';
import { zendeskSupportUrl, extensionChromeUrl } from '#base/configs/env';
import localforageInstance from '#base/configs/localforage';
import {
    LogoutMutation,
    UserNotificationsCountQuery,
    UserNotificationsCountQueryVariables,
} from '#generated/types';
import deepLogo from '#resources/img/deep-logo-new.svg';

import { LOGOUT, USER_NOTIFICATIONS_COUNT } from './queries';

import styles from './styles.css';

const NOTIFICATION_POLL_INTERVAL = 60000;

interface Props {
    className?: string;
    disabled?: boolean;
}

function Navbar(props: Props) {
    const {
        className,
        disabled,
    } = props;
    const alert = useAlert();

    const {
        authenticated,
        user,
        setUser,
    } = useContext(UserContext);

    const notificationRef = useRef<
        { setShowPopup: React.Dispatch<React.SetStateAction<boolean>> }
    >(null);
    const settingsRef = useRef<
        { setShowPopup: React.Dispatch<React.SetStateAction<boolean>> }
    >(null);

    const {
        data: notifications,
    } = useQuery<UserNotificationsCountQuery, UserNotificationsCountQueryVariables>(
        USER_NOTIFICATIONS_COUNT,
        {
            pollInterval: NOTIFICATION_POLL_INTERVAL,
        },
    );

    const [logout] = useMutation<LogoutMutation>(
        LOGOUT,
        {
            onCompleted: (data) => {
                if (data.logout?.ok) {
                    setUser(undefined);
                    localforageInstance.clear();
                } else {
                    alert.show(
                        'Failed to logout.',
                        { variant: 'error' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to logout.',
                    { variant: 'error' },
                );
            },
        },
    );

    const [
        modal,
        onLogoutClick,
    ] = useConfirmation<undefined>({
        showConfirmationInitially: false,
        onConfirm: logout,
        message: 'Are you sure you want to logout?',
    });

    const handleCloseNotificationClick = useCallback(() => {
        notificationRef?.current?.setShowPopup(false);
    }, []);

    useEffect(
        () => {
            if (disabled) {
                settingsRef?.current?.setShowPopup(false);
                notificationRef?.current?.setShowPopup(false);
            }
        },
        [disabled],
    );

    const notificationsCount = notifications?.notifications?.totalCount;

    return (
        <nav className={_cs(className, styles.navbar)}>
            <Link
                to={route.home.path}
                className={styles.appBrand}
            >
                <Svg
                    className={styles.logo}
                    src={deepLogo}
                />
            </Link>
            <div className={styles.main}>
                <div className={styles.navLinks}>
                    <SmartNavLink
                        exact
                        route={route.home}
                        className={styles.link}
                    />
                    <SmartNavLink
                        route={route.tagging}
                        className={styles.link}
                    />
                    <SmartNavLink
                        route={route.analysis}
                        className={styles.link}
                    />
                </div>
                <div className={styles.actions}>
                    <SmartButtonLikeLink
                        route={route.explore}
                        variant="tertiary"
                        icons={<IoCompassOutline />}
                    >
                        Explore DEEP
                    </SmartButtonLikeLink>
                    <SmartButtonLikeLink
                        route={route.login}
                        variant="tertiary"
                        icons={(
                            <IoLogInOutline />
                        )}
                    >
                        Login
                    </SmartButtonLikeLink>
                    <QuickActionLink
                        title="DEEP Support"
                        target="_blank"
                        rel="noopener noreferrer"
                        to={zendeskSupportUrl}
                    >
                        <IoHelp />
                    </QuickActionLink>
                    {authenticated && (
                        <QuickActionDropdownMenu
                            label={(<IoNotificationsOutline />)}
                            componentRef={notificationRef}
                            className={styles.notificationButton}
                            actions={notificationsCount !== 0 ? notificationsCount : undefined}
                            popupClassName={styles.popup}
                            actionsContainerClassName={styles.notificationCount}
                            disabled={disabled}
                            persistent
                        >
                            <Notifications
                                closeNotification={handleCloseNotificationClick}
                            />
                        </QuickActionDropdownMenu>
                    )}
                </div>
            </div>
            {authenticated && user && (
                <DropdownMenu
                    componentRef={settingsRef}
                    actions={(
                        <Avatar
                            className={styles.avatar}
                            src={user.displayPictureUrl}
                            name={user.displayName ?? 'Anon'}
                        />
                    )}
                    label={user.displayName ?? 'Anon'}
                    className={styles.userDisplay}
                    variant="transparent"
                    disabled={disabled}
                >
                    <DropdownMenuItem
                        href={route.myProfile.path}
                    >
                        User Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        href={route.userGroups.path}
                    >
                        User Groups
                    </DropdownMenuItem>
                    <Border
                        inline
                        width="thin"
                    />
                    <DropdownMenuItem
                        href={route.termsOfService.path}
                    >
                        Terms and Privacy
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        href={extensionChromeUrl}
                        linkProps={{
                            // FIXME: we should not need to add "to" here
                            to: extensionChromeUrl,
                            target: '_blank',
                            rel: 'noopener noreferrer',
                        }}
                    >
                        Chrome Extension
                    </DropdownMenuItem>
                    <Border
                        inline
                        width="thin"
                    />
                    <DropdownMenuItem
                        name={undefined}
                        onClick={onLogoutClick}
                        actions={(
                            <IoLogOutOutline />
                        )}
                    >
                        Logout
                    </DropdownMenuItem>
                </DropdownMenu>
            )}
            {modal}
        </nav>
    );
}

export default Navbar;
