import React, { useState } from 'react';
import { connect } from 'react-redux';
import { isNotDefined } from '@togglecorp/fujs';
import {
    Button,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    PendingMessage,
} from '@the-deep/deep-ui';

import FullPageHeader from '#dui/FullPageHeader';
import BackLink from '#dui/BackLink';
import { useRequest } from '#utils/request';

import {
    activeProjectFromStateSelector,
    projectIdFromRouteSelector,
} from '#redux';
import _ts from '#ts';

import {
    ProjectDetails,
    AppState,
} from '#typings';
import { notifyOnFailure } from '#utils/requestNotify';

import ProjectDetailsForm from './ProjectDetailsForm';
import Framework from './Framework';
import Users from './Users';
import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    projectId: projectIdFromRouteSelector(state),
    activeProject: activeProjectFromStateSelector(state),
});

interface ViewProps {
    projectId: number;
    activeProject: ProjectDetails;
}

type TabNames = 'general' | 'users' | 'framework';

function ProjectEdit(props: ViewProps) {
    const {
        projectId,
        activeProject,
    } = props;

    const [activeTab, setActiveTab] = useState<TabNames>('general');
    const {
        pending: projectGetPending,
        response: projectDetails,
        retrigger: triggerProjectsGet,
    } = useRequest<ProjectDetails>({
        skip: isNotDefined(projectId),
        url: `server://projects/${projectId}/`,
        method: 'GET',
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('projectEdit', 'projectDetailsLabel'))({ error: errorBody }),
    });

    return (
        <div className={styles.projectEdit}>
            <Tabs
                useHash
                value={activeTab}
                onChange={setActiveTab}
                initialHash="framework"
            >
                <FullPageHeader
                    className={styles.header}
                    actionsClassName={styles.actions}
                    heading={projectId ? activeProject.title : _ts('projectEdit', 'createProjectLabel')}
                    contentClassName={styles.content}
                    actions={(
                        <>
                            <Button
                                name={undefined}
                                className={styles.button}
                                variant="primary"
                                // NOTE: To be fixed later
                                disabled
                            >
                                {_ts('projectEdit', 'saveButtonLabel')}
                            </Button>
                            <BackLink
                                className={styles.button}
                                defaultLink="/"
                            >
                                {_ts('projectEdit', 'closeButtonLabel')}
                            </BackLink>
                        </>
                    )}
                >
                    <TabList className={styles.tabList}>
                        <Tab
                            name="general"
                            className={styles.tab}
                            activeClassName={styles.activeTab}
                        >
                            {_ts('projectEdit', 'projectDetailsLabel')}
                        </Tab>
                        <Tab
                            name="users"
                            className={styles.tab}
                            activeClassName={styles.activeTab}
                            disabled={isNotDefined(projectId)}
                        >
                            {_ts('projectEdit', 'usersLabel')}
                        </Tab>
                        <Tab
                            name="framework"
                            className={styles.tab}
                            activeClassName={styles.activeTab}
                            disabled={isNotDefined(projectId)}
                        >
                            {_ts('projectEdit', 'frameworkLabel')}
                        </Tab>
                    </TabList>
                </FullPageHeader>
                <div className={styles.tabPanelContainer}>
                    {projectGetPending && <PendingMessage />}
                    <TabPanel
                        className={styles.tabPanel}
                        name="general"
                    >
                        <ProjectDetailsForm
                            key={projectId}
                            projectId={projectId}
                            projectDetails={projectDetails}
                            pending={projectGetPending}
                            onProjectChange={triggerProjectsGet}
                        />
                    </TabPanel>
                    <TabPanel
                        name="users"
                        className={styles.tabPanel}
                    >
                        { projectId && (
                            <Users
                                projectId={projectId}
                            />
                        )}
                    </TabPanel>
                    <TabPanel
                        name="framework"
                        className={styles.tabPanel}
                    >
                        { projectId && (
                            <Framework
                                projectId={projectId}
                                projectDetails={projectDetails}
                                onProjectChange={triggerProjectsGet}
                            />
                        )}
                    </TabPanel>
                </div>
            </Tabs>
        </div>
    );
}

export default connect(mapStateToProps)(ProjectEdit);
