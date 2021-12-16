import React, { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import { Link } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';
import {
    QuickActionLink,
    QuickActionDropdownMenu,
    DropdownMenu,
    DropdownMenuItem,
    useConfirmation,
    useAlert,
} from '@the-deep/deep-ui';
import {
    IoHelp,
    IoCompassOutline,
    IoNotificationsOutline,
    IoLogInOutline,
    IoLogOutOutline,
} from 'react-icons/io5';

import Svg from '#components/Svg';
import Notifications from '#components/Notifications';
import SmartNavLink from '#base/components/SmartNavLink';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import Avatar from '#components/Avatar';
import { UserContext } from '#base/context/UserContext';
import route from '#base/configs/routes';
import {
    LogoutMutation,
    UserNotificationsCountQuery,
    UserNotificationsCountQueryVariables,
} from '#generated/types';
import deepLogo from '#resources/img/deep-logo-new.svg';

import styles from './styles.css';

const NOTIFICATION_POLL_INTERVAL = 60000;

const LOGOUT = gql`
    mutation Logout {
        logout {
            ok
        }
    }
`;

export const USER_NOTIFICATIONS_COUNT = gql`
    query UserNotificationsCount {
        notifications(
            status: UNSEEN,
        ) {
            totalCount
        }
    }
`;

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const { className } = props;
    const alert = useAlert();

    const {
        authenticated,
        user,
        setUser,
    } = useContext(UserContext);

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
                        to="https://deephelp.zendesk.com/hc/en-us"
                    >
                        <IoHelp />
                    </QuickActionLink>
                    {authenticated && (
                        <QuickActionDropdownMenu
                            label={(<IoNotificationsOutline />)}
                            className={styles.notificationButton}
                            actions={notificationsCount !== 0 ? notificationsCount : undefined}
                            popupClassName={styles.popup}
                            actionsContainerClassName={styles.notificationCount}
                            persistent
                        >
                            <Notifications />
                        </QuickActionDropdownMenu>
                    )}
                </div>
            </div>
            {authenticated && user && (
                <DropdownMenu
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
