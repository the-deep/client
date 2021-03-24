import React, { useState } from 'react';
import { connect } from 'react-redux';
import { isNotDefined } from '@togglecorp/fujs';
import {
    Button,
} from '@the-deep/deep-ui';

import FullPageHeader from '#dui/FullPageHeader';
import BackLink from '#dui/BackLink';
import Tabs, { Tab, TabList, TabPanel } from '#dui/Tabs';

import {
    activeProjectFromStateSelector,
    projectIdFromRouteSelector,
} from '#redux';
import _ts from '#ts';

import {
    ProjectDetails,
    AppState,
} from '#typings';

import ProjectDetailsForm from './ProjectDetailsForm';
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

    return (
        <div className={styles.projectEdit}>
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
            >
                <FullPageHeader
                    className={styles.header}
                    actionsClassName={styles.actions}
                    heading={projectId ? activeProject.title : _ts('projectEdit', 'createProjectLabel')}
                    contentClassName={styles.content}
                    actions={(
                        <>
                            <Button
                                className={styles.button}
                                variant="primary"
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
                <TabPanel name="general">
                    <ProjectDetailsForm
                        projectId={projectId}
                    />
                </TabPanel>
                <TabPanel name="users">
                    {_ts('projectEdit', 'usersLabel')}
                </TabPanel>
                <TabPanel name="framework">
                    {_ts('projectEdit', 'frameworkLabel')}
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default connect(mapStateToProps)(ProjectEdit);
