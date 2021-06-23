import React from 'react';
import {
    NavLink,
} from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';
import { pathNames } from '#constants';
import { SubNavbar } from '#components/general/Navbar';
import {
    Button,
} from '@the-deep/deep-ui';

import styles from './styles.scss';

function Navbar() {
    const sourcesRoute = reverseRoute(pathNames.sources, {});
    const dashboardRoute = reverseRoute(pathNames.taggingDashboard, {});
    const exportRoute = reverseRoute(pathNames.taggingExport, {});
    return (
        <SubNavbar>
            <div className={styles.subNavbar}>
                <NavLink
                    className={styles.navLink}
                    activeClassName={styles.active}
                    to={sourcesRoute}
                    exact
                >
                    sources
                </NavLink>
                <NavLink
                    className={styles.navLink}
                    activeClassName={styles.active}
                    to={dashboardRoute}
                    exact
                >
                    dashboard
                </NavLink>
                <NavLink
                    className={styles.navLink}
                    activeClassName={styles.active}
                    to={exportRoute}
                    exact
                >
                    export
                </NavLink>
                <Button
                    className={styles.button}
                    name={undefined}
                    variant="primary"
                >
                    Add
                </Button>
            </div>
        </SubNavbar>
    );
}

export default Navbar;
