import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import {
    NavLink,
} from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';
import {
    DropdownMenu,
    DropdownMenuItem,
} from '@the-deep/deep-ui';

import { pathNames } from '#constants';
import { SubNavbar } from '#components/general/Navbar';
import { AppState } from '#typings';
import { activeProjectIdFromStateSelector } from '#redux';
import _ts from '#ts';

import { useModalState } from '#hooks/stateManagement';
import LeadEditModal from '../Sources/LeadEditModal';
import BulkUpload from '../Sources/BulkUpload';

import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectIdFromStateSelector(state),
});

interface Props {
    activeProject: number;
    onSourcesAdd?: () => void;
}

function Navbar(props: Props) {
    const {
        activeProject,
        onSourcesAdd,
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

    const [
        isSingleSourceModalShown,
        showSingleSourceAddModal,
        hideSingleSourceAddModal,
    ] = useModalState(false);

    const [
        isBulkModalShown,
        showBulkUploadModal,
        hideBulkUploadModal,
    ] = useModalState(false);

    const handleSingleLeadSaveSuccess = useCallback(() => {
        if (onSourcesAdd) {
            onSourcesAdd();
        }
        hideSingleSourceAddModal();
    }, [onSourcesAdd, hideSingleSourceAddModal]);

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
                        onClick={showSingleSourceAddModal}
                    >
                        {_ts('tagging', 'addSource')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={showBulkUploadModal}
                    >
                        {_ts('bulkUpload', 'title')}
                    </DropdownMenuItem>
                </DropdownMenu>
            </div>
            {isSingleSourceModalShown && (
                <LeadEditModal
                    projectId={activeProject}
                    onClose={hideSingleSourceAddModal}
                    onLeadSaveSuccess={handleSingleLeadSaveSuccess}
                />
            )}
            {isBulkModalShown && (
                <BulkUpload
                    onClose={hideBulkUploadModal}
                />
            )}
        </SubNavbar>
    );
}

export default connect(mapStateToProps)(Navbar);
