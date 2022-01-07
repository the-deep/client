import React, { Suspense, useMemo, useState, useCallback } from 'react';
import {
    Routes,
    Route,
    Navigate,
    generatePath,
} from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import {
    DropdownMenu,
    DropdownMenuItem,
} from '@the-deep/deep-ui';

import { useModalState } from '#hooks/stateManagement';
import ProjectSwitcher from '#components/general/ProjectSwitcher';
import PreloadMessage from '#base/components/PreloadMessage';
import SubNavbarContext from '#components/SubNavbar/context';
import SubNavbar, { SubNavbarIcons, SubNavbarActions } from '#components/SubNavbar';
import ProjectContext from '#base/context/ProjectContext';
import SmartNavLink from '#base/components/SmartNavLink';
import routes from '#base/configs/routes';
import _ts from '#ts';

import LeadEditModal from './Sources/LeadEditModal';
import BulkUpload from './Sources/BulkUpload';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Tagging(props: Props) {
    const { className } = props;
    const { project } = React.useContext(ProjectContext);

    const defaultRoute = generatePath(routes.sources.path, { projectId: project?.id });

    const [iconsNode, setIconsNode] = useState<Element | null | undefined>();
    const [actionsNode, setActionsNode] = useState<Element | null | undefined>();

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

    const navbarContextValue = useMemo(
        () => ({
            iconsNode,
            actionsNode,
            setIconsNode,
            setActionsNode,
        }),
        [iconsNode, actionsNode],
    );

    const handleSingleLeadSaveSuccess = useCallback(() => {
        hideSingleSourceAddModal();
    }, [hideSingleSourceAddModal]);

    const subNavbarComponents = (
        <>
            <SubNavbarIcons>
                <ProjectSwitcher />
            </SubNavbarIcons>
            <SubNavbarActions>
                <DropdownMenu
                    label={_ts('tagging', 'addSource')}
                >
                    <DropdownMenuItem
                        onClick={showSingleSourceAddModal}
                        name={undefined}
                    >
                        Add a website
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={showBulkUploadModal}
                        name={undefined}
                    >
                        Add sources
                    </DropdownMenuItem>
                </DropdownMenu>
            </SubNavbarActions>
        </>
    );

    return (
        <SubNavbarContext.Provider value={navbarContextValue}>
            <div className={_cs(styles.tagging, className)}>
                <SubNavbar
                    className={styles.subNavbar}
                >
                    <SmartNavLink
                        route={routes.sources}
                        className={styles.link}
                    />
                    <SmartNavLink
                        route={routes.dashboard}
                        className={styles.link}
                    />
                    <SmartNavLink
                        route={routes.leadGroups}
                        className={styles.link}
                    />
                    <SmartNavLink
                        route={routes.assessments}
                        className={styles.link}
                    />
                    <SmartNavLink
                        route={routes.aryDashboard}
                        className={styles.link}
                    />
                    <SmartNavLink
                        route={routes.export}
                        className={styles.link}
                    />
                </SubNavbar>
                <Routes>
                    <Route
                        path={routes.sources.pathForRoute}
                        element={subNavbarComponents}
                    />
                    <Route
                        path={routes.assessments.pathForRoute}
                        element={subNavbarComponents}
                    />
                    <Route
                        path={routes.leadGroups.pathForRoute}
                        element={subNavbarComponents}
                    />
                    <Route
                        path={routes.dashboard.pathForRoute}
                        element={subNavbarComponents}
                    />
                    <Route
                        path={routes.aryDashboard.pathForRoute}
                        element={subNavbarComponents}
                    />
                    <Route
                        path={routes.export.pathForRoute}
                        element={subNavbarComponents}
                    />
                </Routes>
                <Suspense
                    fallback={(
                        <PreloadMessage
                            className={styles.childView}
                            content="Loading page..."
                        />
                    )}
                >
                    <Routes>
                        <Route
                            path=""
                            element={<Navigate to={defaultRoute} />}
                        />
                        <Route
                            path={routes.sources.pathForRoute}
                            element={routes.sources.load({ className: styles.childView })}
                        />
                        <Route
                            path={routes.assessments.pathForRoute}
                            element={routes.assessments.load({ className: styles.childView })}
                        />
                        <Route
                            path={routes.leadGroups.pathForRoute}
                            element={routes.leadGroups.load({ className: styles.childView })}
                        />
                        <Route
                            path={routes.dashboard.pathForRoute}
                            element={routes.dashboard.load({ className: styles.childView })}
                        />
                        <Route
                            path={routes.aryDashboard.pathForRoute}
                            element={routes.aryDashboard.load({ className: styles.childView })}
                        />
                        <Route
                            path={routes.export.pathForRoute}
                            element={routes.export.load({ className: styles.childView })}
                        />
                        <Route
                            path={routes.fourHundredFour.pathForRoute}
                            element={routes.fourHundredFour.load({ className: styles.childView })}
                        />
                    </Routes>
                </Suspense>
            </div>
            {isSingleSourceModalShown && project?.id && (
                <LeadEditModal
                    projectId={project.id}
                    onClose={hideSingleSourceAddModal}
                    onLeadSaveSuccess={handleSingleLeadSaveSuccess}
                />
            )}
            {isBulkModalShown && project?.id && (
                <BulkUpload
                    onClose={hideBulkUploadModal}
                    projectId={project.id}
                />
            )}
        </SubNavbarContext.Provider>
    );
}

export default Tagging;
