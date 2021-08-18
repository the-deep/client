import React, { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import { gql, useMutation } from '@apollo/client';
import {
    ButtonLikeLink,
    QuickActionLink,
    QuickActionDropdownMenu,
    DropdownMenu,
    DropdownMenuItem,
    useConfirmation,
} from '@the-deep/deep-ui';
import {
    IoHelp,
    IoCompassOutline,
    IoNotificationsOutline,
    IoLogOutOutline,
} from 'react-icons/io5';

import SmartNavLink from '#base/components/SmartNavLink';
import Avatar from '#components/Avatar';
import { UserContext } from '#base/context/UserContext';
import route from '#base/configs/routes';
import { LogoutMutation } from '#generated/types';

import styles from './styles.css';

const LOGOUT = gql`
    mutation Logout {
        logout {
            ok
        }
    }
`;

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const { className } = props;

    const {
        authenticated,
        user,
        setUser,
    } = useContext(UserContext);

    const [logout] = useMutation<LogoutMutation>(
        LOGOUT,
        {
            onCompleted: (data) => {
                if (data.logout?.ok) {
                    setUser(undefined);
                }
                // FIXME: handle failure
            },
            // FIXME: handle failure
        },
    );

    const [
        modal,
        onLogoutClick,
    ] = useConfirmation({
        showConfirmationInitially: false,
        onConfirm: logout,
        message: 'Are you sure you want to logout?',
    });

    return (
        <nav className={_cs(className, styles.navbar)}>
            <div className={styles.appBrand}>
                DEEP
            </div>
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
                    <ButtonLikeLink
                        to={route.explore.path}
                        variant="tertiary"
                        icons={<IoCompassOutline />}
                    >
                        Explore DEEP
                    </ButtonLikeLink>
                    <QuickActionLink
                        to="https://deephelp.zendesk.com/hc/en-us"
                    >
                        <IoHelp />
                    </QuickActionLink>
                    <QuickActionDropdownMenu
                        label={<IoNotificationsOutline />}
                        popupContentClassName={styles.notificationContent}
                    >
                        You don&apos;t have any notification
                    </QuickActionDropdownMenu>
                </div>
            </div>
            {authenticated && user && (
                <DropdownMenu
                    icons={(
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
