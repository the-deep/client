import React, { useCallback, useContext } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import {
    useHistory,
    generatePath,
    useParams,
} from 'react-router-dom';
import {
    Button,
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';

import FullPageHeader from '#components/FullPageHeader';
import BackLink from '#components/BackLink';
import { UserContext } from '#base/context/UserContext';
import { ProjectContext } from '#base/context/ProjectContext';
import routes from '#base/configs/routes';
import { ProjectDetails } from '#types';
import _ts from '#ts';

import ProjectDetailsForm from './ProjectDetailsForm';
import Framework from './Framework';
import Users from './Users';
import GeoAreas from './GeoAreas';

import styles from './styles.css';

function ProjectEdit() {
    const { user } = useContext(UserContext);
    const { project } = useContext(ProjectContext);

    const history = useHistory();

    const { projectId: projectIdFromRoute } = useParams<{ projectId: string | undefined }>();

    const projectId = projectIdFromRoute ? +projectIdFromRoute : undefined;
    const userId = user ? +user.id : undefined;

    const handleCreate = useCallback(
        (response: ProjectDetails) => {
            const { id } = response;
            history.replace(generatePath(routes.projectEdit.path, {
                projectId: id,
            }));
        },
        [history],
    );

    const heading = project && project.id === projectIdFromRoute
        ? project.title
        : _ts('projectEdit', 'createProjectLabel');

    return (
        <div className={styles.projectEdit}>
            <Tabs
                useHash
                defaultHash="general"
            >
                <FullPageHeader
                    className={styles.header}
                    heading={heading}
                    actions={(
                        <>
                            <BackLink
                                className={styles.button}
                                defaultLink="/"
                            >
                                {_ts('projectEdit', 'closeButtonLabel')}
                            </BackLink>
                            <Button
                                name={undefined}
                                className={styles.button}
                                variant="primary"
                                // NOTE: To be fixed later
                                disabled
                            >
                                {_ts('projectEdit', 'saveButtonLabel')}
                            </Button>
                        </>
                    )}
                >
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
                    </TabList>
                </FullPageHeader>
                <div className={styles.tabPanelContainer}>
                    <TabPanel
                        className={styles.tabPanel}
                        name="general"
                    >
                        <ProjectDetailsForm
                            key={projectId}
                            projectId={projectId}
                            onCreate={handleCreate}
                        />
                    </TabPanel>
                    <TabPanel
                        className={styles.tabPanel}
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
                        className={styles.tabPanel}
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
                        className={styles.tabPanel}
                    >
                        {projectId && (
                            <Framework projectId={projectId} />
                        )}
                    </TabPanel>
                </div>
            </Tabs>
        </div>
    );
}

export default ProjectEdit;
