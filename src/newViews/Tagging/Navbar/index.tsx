import React from 'react';
import { connect } from 'react-redux';
import {
    withRouter,
    NavLink,
} from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';
import { pathNames } from '#constants';
import { SubNavbar } from '#components/general/Navbar';
import { IoChevronDown } from 'react-icons/io5';
import {
    AppState,
} from '#typings';
import {
    Button,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import { activeProjectIdFromStateSelector } from '#redux';

import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectIdFromStateSelector(state),
});
interface Props {
    activeProject: number;
}
function Navbar(props: Props) {
    const {
        activeProject,
    } = props;

    const sourcesRoute = reverseRoute(
        pathNames.tagging,
        { projectId: activeProject },
    );
    const dashboardRoute = reverseRoute(
        pathNames.taggingDashboard,
        { projectId: activeProject },
    );
    const exportRoute = reverseRoute(
        pathNames.taggingExport,
        { projectId: activeProject },
    );

    return (
        <SubNavbar>
            <div className={styles.links}>
                <NavLink
                    className={styles.navLink}
                    activeClassName={styles.active}
                    to={sourcesRoute}
                    exact
                >
                    {_ts('tagging', 'sources')}
                </NavLink>
                <NavLink
                    className={styles.navLink}
                    activeClassName={styles.active}
                    to={dashboardRoute}
                    exact
                >
                    {_ts('tagging', 'dashboard')}
                </NavLink>
                <NavLink
                    className={styles.navLink}
                    activeClassName={styles.active}
                    to={exportRoute}
                    exact
                >
                    {_ts('tagging', 'export')}
                </NavLink>
            </div>
            <div className={styles.actions}>
                <Button
                    className={styles.button}
                    name={undefined}
                    variant="secondary"
                    actions={<IoChevronDown />}
                    disabled
                >
                    {_ts('tagging', 'addSource')}
                </Button>
            </div>
        </SubNavbar>
    );
}

export default withRouter(connect(mapStateToProps)(Navbar));
