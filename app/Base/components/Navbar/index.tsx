import React, { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ButtonLikeLink,
    QuickActionLink,
    QuickActionDropdownMenu,
} from '@the-deep/deep-ui';
import {
    IoHelp,
    IoCompassOutline,
    IoNotificationsOutline,
} from 'react-icons/io5';

import SmartNavLink from '#base/components/SmartNavLink';
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
                        exact
                        route={route.tagging}
                        className={styles.link}
                    />
                    <SmartNavLink
                        exact
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
            <div className={styles.userMenu}>
                {authenticated && user && (
                    <div className={styles.userDisplayName}>
                        {user.displayName ?? 'Anon'}
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
