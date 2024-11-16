import React, { useState, useCallback, useContext, useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import {
    useHistory,
    generatePath,
    useParams,
} from 'react-router-dom';
import {
    useAlert,
    Tabs,
    QuickActionButton,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';
import { IoShareSocialOutline } from 'react-icons/io5';

import SubNavbar, {
    SubNavbarChildren,
} from '#components/SubNavbar';
import SubNavbarContext from '#components/SubNavbar/context';
import { UserContext } from '#base/context/UserContext';
import { ProjectContext } from '#base/context/ProjectContext';
import routes from '#base/configs/routes';
import BackLink from '#components/BackLink';
import _ts from '#ts';

import ProjectDetailsForm from './ProjectDetailsForm';
import Framework from './Framework';
import Connector from './Connector';
import Users from './Users';
import GeoAreas from './GeoAreas';

import styles from './styles.css';

function ProjectEdit() {
    const { user } = useContext(UserContext);
    const { project } = useContext(ProjectContext);
    const [childrenNode, setChildrenNode] = useState<Element | null | undefined>();
    const [actionsNode, setActionsNode] = useState<Element | null | undefined>();
    const [iconsNode, setIconsNode] = useState<Element | null | undefined>();
    const navbarContextValue = useMemo(
        () => ({
            childrenNode,
            iconsNode,
            actionsNode,
            setChildrenNode,
            setActionsNode,
            setIconsNode,
        }),
        [childrenNode, actionsNode, iconsNode],
    );

    const history = useHistory();
    const alert = useAlert();

    const { projectId } = useParams<{ projectId: string | undefined }>();
    const userId = user?.id;

    const isConnectorsAccessible = true;

    // const isConnectorsAccessible = !!user
    //     ?.accessibleFeatures?.some((feature) => feature.key === 'CONNECTORS');

    const handleCreate = useCallback(
        (newProjectId: string) => {
            history.replace(generatePath(routes.projectEdit.path, {
                projectId: newProjectId,
            }));
        },
        [history],
    );

    const heading = project && project.id === projectId
        ? project.title
        : _ts('projectEdit', 'createProjectLabel');

    const copyToClipboard = useCallback(() => {
        const url = `${window.location.protocol}//${window.location.host}${generatePath(routes.tagging.path, { projectId })}`;
        navigator.clipboard.writeText(url);

        alert.show(
            'Successfully copied URL to clipboard.',
            {
                variant: 'info',
            },
        );
    }, [projectId, alert]);

    return (
        <div className={styles.projectEdit}>
            <SubNavbarContext.Provider value={navbarContextValue}>
                <Tabs
                    useHash
                    defaultHash="general"
                >
                    <SubNavbar
                        className={styles.header}
                        heading={heading}
                        homeLinkShown
                        defaultActions={(
                            <>
                                {projectId && (
                                    <QuickActionButton
                                        className={styles.shareButton}
                                        name="copy"
                                        variant="secondary"
                                        title="Get sharable link for other users"
                                        onClick={copyToClipboard}
                                    >
                                        <IoShareSocialOutline />
                                    </QuickActionButton>
                                )}
                                <BackLink
                                    defaultLink="/"
                                >
                                    {_ts('projectEdit', 'closeButtonLabel')}
                                </BackLink>
                            </>
                        )}
                    />
                    <SubNavbarChildren>
                        <TabList className={styles.tabList}>
                            <Tab
                                name="general"
                                className={styles.tab}
                                transparentBorder
                            >
                                {_ts('projectEdit', 'projectDetailsLabel')}
                            </Tab>
                            <Tab
                                name="geo-areas"
                                className={styles.tab}
                                disabled={isNotDefined(projectId)}
                                transparentBorder
                            >
                                {_ts('projectEdit', 'geoAreas')}
                            </Tab>
                            <Tab
                                name="users"
                                className={styles.tab}
                                disabled={isNotDefined(projectId)}
                                transparentBorder
                            >
                                {_ts('projectEdit', 'usersLabel')}
                            </Tab>
                            <Tab
                                name="framework"
                                className={styles.tab}
                                disabled={isNotDefined(projectId)}
                                transparentBorder
                            >
                                {_ts('projectEdit', 'frameworkLabel')}
                            </Tab>
                            {isConnectorsAccessible && (
                                <Tab
                                    name="connectors"
                                    className={styles.tab}
                                    disabled={isNotDefined(projectId)}
                                    transparentBorder
                                >
                                    Connectors
                                </Tab>
                            )}
                        </TabList>
                    </SubNavbarChildren>
                    <div className={styles.tabPanelContainer}>
                        <TabPanel
                            activeClassName={styles.tabPanel}
                            name="general"
                        >
                            <ProjectDetailsForm
                                key={projectId}
                                projectId={projectId}
                                onCreate={handleCreate}
                            />
                        </TabPanel>
                        <TabPanel
                            activeClassName={styles.tabPanel}
                            name="geo-areas"
                        >
                            {projectId && (
                                <GeoAreas
                                    activeProject={projectId}
                                />
                            )}
                        </TabPanel>
                        <TabPanel
                            name="users"
                            activeClassName={styles.tabPanel}
                        >
                            {projectId && (
                                <Users
                                    projectId={projectId}
                                    activeUserId={userId}
                                />
                            )}
                        </TabPanel>
                        <TabPanel
                            name="framework"
                            activeClassName={styles.tabPanel}
                        >
                            {projectId && (
                                <Framework
                                    projectId={projectId}
                                />
                            )}
                        </TabPanel>
                        {isConnectorsAccessible && (
                            <TabPanel
                                name="connectors"
                                activeClassName={styles.tabPanel}
                            >
                                {projectId && (
                                    <Connector
                                        projectId={projectId}
                                    />
                                )}
                            </TabPanel>
                        )}
                    </div>
                </Tabs>
            </SubNavbarContext.Provider>
        </div>
    );
}

export default ProjectEdit;
