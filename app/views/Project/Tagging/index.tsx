import React, { Suspense, useMemo, useState, useCallback } from 'react';
import {
    Switch,
    Route,
    Redirect,
    generatePath,
} from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import {
    DropdownMenu,
    DropdownMenuItem,
} from '@the-deep/deep-ui';

import { useModalState } from '#hooks/stateManagement';
import ProjectSwitcher from '#components/ProjectSwitcher';
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
    const [refreshTimestamp, setRefreshTimestamp] = useState<number | undefined>();

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
        setRefreshTimestamp(new Date().getTime());
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
                    >
                        {_ts('tagging', 'addSource')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={showBulkUploadModal}
                    >
                        {_ts('bulkUpload', 'title')}
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
                        exact
                        route={routes.sources}
                        className={styles.link}
                    />
                    <SmartNavLink
                        exact
                        route={routes.dashboard}
                        className={styles.link}
                    />
                    <SmartNavLink
                        exact
                        route={routes.export}
                        className={styles.link}
                    />
                </SubNavbar>
                <Switch>
                    <Route
                        exact
                        path={routes.sources.path}
                    >
                        {subNavbarComponents}
                    </Route>
                    <Route
                        exact
                        path={routes.dashboard.path}
                    >
                        {subNavbarComponents}
                    </Route>
                    <Route
                        exact
                        path={routes.export.path}
                    >
                        {subNavbarComponents}
                    </Route>
                </Switch>
                <Suspense
                    fallback={(
                        <PreloadMessage
                            className={styles.childView}
                            content="Loading page..."
                        />
                    )}
                >
                    <Switch>
                        <Route
                            exact
                            path={routes.tagging.path}
                        >
                            <Redirect to={defaultRoute} />
                        </Route>
                        <Route
                            exact
                            path={routes.sources.path}
                        >
                            {routes.sources.load({ className: styles.childView, refreshTimestamp })}
                        </Route>
                        <Route
                            exact
                            path={routes.dashboard.path}
                        >
                            {routes.dashboard.load({ className: styles.childView })}
                        </Route>
                        <Route
                            exact
                            path={routes.export.path}
                        >
                            {routes.export.load({ className: styles.childView })}
                        </Route>
                        <Route
                            exact
                            path={routes.taggingFlow.path}
                        >
                            {routes.taggingFlow.load({ className: styles.childView })}
                        </Route>
                        <Route
                            exact
                            path={routes.fourHundredFour.path}
                        >
                            {routes.fourHundredFour.load({ className: styles.childView })}
                        </Route>
                    </Switch>
                </Suspense>
            </div>
            {isSingleSourceModalShown && project?.id && (
                <LeadEditModal
                    projectId={+project.id}
                    onClose={hideSingleSourceAddModal}
                    onLeadSaveSuccess={handleSingleLeadSaveSuccess}
                />
            )}
            {isBulkModalShown && (
                <BulkUpload
                    onClose={hideBulkUploadModal}
                />
            )}
        </SubNavbarContext.Provider>
    );
}

export default Tagging;
