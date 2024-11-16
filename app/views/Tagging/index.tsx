import React, { useContext, Suspense, useMemo, useState, useCallback } from 'react';
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
import { useQuery } from '@apollo/client';

import { useModalState } from '#hooks/stateManagement';
import ProjectSwitcher from '#components/general/ProjectSwitcher';
import TestTag from '#components/TestTag';
import { UserContext } from '#base/context/UserContext';
import PreloadMessage from '#base/components/PreloadMessage';
import SubNavbarContext from '#components/SubNavbar/context';
import SubNavbar, { SubNavbarIcons, SubNavbarActions } from '#components/SubNavbar';
import ProjectContext from '#base/context/ProjectContext';
import SmartNavLink from '#base/components/SmartNavLink';
import routes from '#base/configs/routes';
import _ts from '#ts';

import LeadEditModal from '#components/general/LeadEditModal';
import BulkUploadModal from '#components/general/BulkUploadModal';

import {
    ConnectorSourcesCountQuery,
    ConnectorSourcesCountQueryVariables,
} from '#generated/types';

import UnifiedConnectorModal from './UnifiedConnectorModal';
import { CONNECTOR_SOURCES_COUNT } from './queries';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Tagging(props: Props) {
    const { className } = props;
    const { user } = useContext(UserContext);
    const { project } = useContext(ProjectContext);

    const variables = useMemo(() => (
        project?.id ? { projectId: project.id } : undefined
    ), [project]);

    const {
        data,
    } = useQuery<ConnectorSourcesCountQuery, ConnectorSourcesCountQueryVariables>(
        CONNECTOR_SOURCES_COUNT,
        {
            skip: !variables,
            variables,
        },
    );

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

    const [
        isUnifiedConnectorModalShown,
        showUnifiedConnectorModal,
        hideUnifiedConnectorModal,
    ] = useModalState(false);

    const navbarContextValue = useMemo(
        () => ({
            iconsNode,
            setIconsNode,
            actionsNode,
            setActionsNode,
        }),
        [iconsNode, actionsNode],
    );

    const handleSingleLeadSaveSuccess = useCallback(() => {
        hideSingleSourceAddModal();
    }, [hideSingleSourceAddModal]);

    const isConnectorsAccessible = true;

    // const isConnectorsAccessible = !!user
    //    ?.accessibleFeatures?.some((feature) => feature.key === 'CONNECTORS');

    const newSourcesCount = data?.project?.unifiedConnector?.sourceCountWithoutIngnoredAndAdded;

    const subNavbarComponents = (
        <>
            <SubNavbarIcons>
                <ProjectSwitcher />
                {project?.isTest && <TestTag />}
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
                    {isConnectorsAccessible && (
                        <DropdownMenuItem
                            onClick={showUnifiedConnectorModal}
                            name={undefined}
                        >
                            {`Add sources from connectors (${newSourcesCount ?? 0} new)`}
                        </DropdownMenuItem>
                    )}
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
                        route={routes.assessments}
                        className={styles.link}
                    />
                    <SmartNavLink
                        exact
                        route={routes.aryDashboard}
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
                        path={routes.assessments.path}
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
                        path={routes.aryDashboard.path}
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
                            {routes.sources.load({ className: styles.childView })}
                        </Route>
                        <Route
                            exact
                            path={routes.assessments.path}
                        >
                            {routes.assessments.load({ className: styles.childView })}
                        </Route>
                        <Route
                            exact
                            path={routes.dashboard.path}
                        >
                            {routes.dashboard.load({ className: styles.childView })}
                        </Route>
                        <Route
                            exact
                            path={routes.aryDashboard.path}
                        >
                            {routes.aryDashboard.load({ className: styles.childView })}
                        </Route>
                        <Route
                            exact
                            path={routes.export.path}
                        >
                            {routes.export.load({ className: styles.childView })}
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
                    projectId={project.id}
                    onClose={hideSingleSourceAddModal}
                    onLeadSaveSuccess={handleSingleLeadSaveSuccess}
                />
            )}
            {isBulkModalShown && project?.id && (
                <BulkUploadModal
                    onClose={hideBulkUploadModal}
                    projectId={project.id}
                />
            )}
            {isUnifiedConnectorModalShown && project?.id && (
                <UnifiedConnectorModal
                    onClose={hideUnifiedConnectorModal}
                    projectId={project.id}
                />
            )}
        </SubNavbarContext.Provider>
    );
}

export default Tagging;
