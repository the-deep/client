import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { isNotDefined, reverseRoute } from '@togglecorp/fujs';
import { Redirect } from 'react-router-dom';
import {
    Button,
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';

import { pathNames } from '#constants';
import FullPageHeader from '#dui/FullPageHeader';
import BackLink from '#dui/BackLink';

import {
    activeProjectFromStateSelector,
    projectIdFromRouteSelector,
    activeUserSelector,
    setProjectAction,
    setActiveProjectAction,
} from '#redux';
import _ts from '#ts';

import {
    ProjectDetails,
    AppState,
} from '#typings';

import ProjectDetailsForm from './ProjectDetailsForm';
import Framework from './Framework';
import Users from './Users';
import styles from './styles.scss';

type TabNames = 'general' | 'users' | 'framework';

interface PropsFromDispatch {
    setUserProject: typeof setProjectAction;
    setActiveProject: typeof setActiveProjectAction;
}

interface PropsFromState {
    projectId: number;
    activeProject: ProjectDetails;
    activeUser: { userId: number };
}

function ProjectEdit(props: PropsFromState & PropsFromDispatch) {
    const {
        projectId,
        activeProject,
        activeUser,
        setUserProject,
        setActiveProject,
    } = props;

    const [activeTab, setActiveTab] = useState<TabNames>('general');
    const [redirectId, setRedirectId] = useState<number | undefined>();

    const handleCreate = useCallback(
        (response: ProjectDetails) => {
            const { id } = response;
            setActiveProject({ activeProject: id });
            setUserProject({ project: response, userId: activeUser.userId });
            setRedirectId(id);
        },
        [activeUser.userId, setActiveProject, setUserProject],
    );

    if (redirectId) {
        const newRoute = reverseRoute(pathNames.editProject, {
            redirectId,
        });
        return (
            <Redirect
                to={newRoute}
            />
        );
    }

    return (
        <div className={styles.projectEdit}>
            <Tabs
                useHash
                value={activeTab}
                onChange={setActiveTab}
                initialHash="general"
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
                        name="users"
                        className={styles.tabPanel}
                    >
                        {projectId && (
                            <Users
                                projectId={projectId}
                                activeUserId={activeUser.userId}
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

const mapStateToProps = (state: AppState) => ({
    projectId: projectIdFromRouteSelector(state),
    activeProject: activeProjectFromStateSelector(state),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    setUserProject: params => dispatch(setProjectAction(params)),
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectEdit);
