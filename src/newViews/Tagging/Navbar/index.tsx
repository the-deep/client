import React from 'react';
import { connect } from 'react-redux';
import {
    NavLink,
} from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';
import { pathNames } from '#constants';
import { SubNavbar } from '#components/general/Navbar';
import {
    AppState,
} from '#typings';
import {
    DropdownMenu,
    DropdownMenuItem,
} from '@the-deep/deep-ui';

import _ts from '#ts';
import { activeProjectIdFromStateSelector } from '#redux';

import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectIdFromStateSelector(state),
});

interface Props {
    activeProject: number;
    onAddSingleSourceClick?: () => void;
    onBulkUploadClick?: () => void;
}

function Navbar(props: Props) {
    const {
        activeProject,
        onAddSingleSourceClick,
        onBulkUploadClick,
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
                <DropdownMenu
                    label={_ts('tagging', 'addSource')}
                >
                    <DropdownMenuItem
                        onClick={onAddSingleSourceClick}
                    >
                        {_ts('tagging', 'addSource')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onBulkUploadClick}
                    >
                        {_ts('bulkUpload', 'title')}
                    </DropdownMenuItem>
                </DropdownMenu>
            </div>
        </SubNavbar>
    );
}

export default connect(mapStateToProps)(Navbar);
