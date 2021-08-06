import React, { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ButtonLikeLink,
    QuickActionLink,
    QuickActionDropdownMenu,
    DropdownMenu,
    DropdownMenuItem,
    Border,
} from '@the-deep/deep-ui';
import {
    IoHelp,
    IoCompassOutline,
    IoNotificationsOutline,
} from 'react-icons/io5';

import SmartNavLink from '#base/components/SmartNavLink';
import Avatar from '#components/Avatar';
import { UserContext } from '#base/context/UserContext';
import route from '#base/configs/routes';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const { className } = props;

    const {
        authenticated,
        user,
    } = useContext(UserContext);

    return (
        <nav className={_cs(className, styles.navbar)}>
            <Border />
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
                        My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        href={route.userGroups.path}
                    >
                        User groups
                    </DropdownMenuItem>
                </DropdownMenu>
            )}
        </nav>
    );
}

export default Navbar;
