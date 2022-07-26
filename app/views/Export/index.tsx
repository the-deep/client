import React, { useState } from 'react';
import {
    useLocation,
} from 'react-router-dom';
import { IoAdd } from 'react-icons/io5';
import {
    Tabs,
    Tab,
    TabList,
    TabPanel,
    ContainerCard,
} from '@the-deep/deep-ui';

import {
    ExportDataTypeEnum,
} from '#generated/types';
import ProjectContext from '#base/context/ProjectContext';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import routes from '#base/configs/routes';

import ExportHistory from '#components/general/ExportHistory';

import styles from './styles.css';

type ExportType = 'export-entry-history' | 'export-assessment-history';

const entryType: ExportDataTypeEnum[] = ['ENTRIES'];
const assessmentType: ExportDataTypeEnum[] = ['PLANNED_ASSESSMENTS', 'ASSESSMENTS'];

function Export() {
    const { project } = React.useContext(ProjectContext);
    const activeProject = project ? project.id : undefined;
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<ExportType | undefined>(location.state as ExportType | undefined ?? 'export-entry-history');

    return (
        <Tabs
            onChange={setActiveTab}
            value={activeTab}
        >
            <ContainerCard
                className={styles.container}
                headingSize="extraSmall"
                headerClassName={styles.header}
                heading={(
                    <TabList
                        className={styles.tabList}
                    >
                        <Tab
                            name="export-entry-history"
                            transparentBorder
                        >
                            Export History
                        </Tab>
                        {project?.hasAssessmentTemplate && (
                            <Tab
                                name="export-assessment-history"
                                transparentBorder
                            >
                                Export Assessment History
                            </Tab>
                        )}
                    </TabList>
                )}
                headerActionsContainerClassName={styles.actionButtons}
                headerActions={(
                    <>
                        <SmartButtonLikeLink
                            icons={(<IoAdd />)}
                            variant="primary"
                            route={routes.exportCreate}
                            attrs={{
                                projectId: activeProject,
                            }}
                        >
                            New Export
                        </SmartButtonLikeLink>
                        {project?.hasAssessmentTemplate && (
                            <SmartButtonLikeLink
                                variant="secondary"
                                icons={(<IoAdd />)}
                                route={routes.assessmentExportCreate}
                                attrs={{
                                    projectId: activeProject,
                                }}
                            >
                                New Assessment Export
                            </SmartButtonLikeLink>
                        )}
                    </>
                )}
                contentClassName={styles.content}
            >
                <TabPanel
                    name="export-entry-history"
                    activeClassName={styles.tabPanel}
                >
                    {activeProject && (
                        <ExportHistory
                            projectId={activeProject}
                            type={entryType}
                        />
                    )}
                </TabPanel>
                {project?.hasAssessmentTemplate && (
                    <TabPanel
                        name="export-assessment-history"
                        activeClassName={styles.tabPanel}
                    >
                        {activeProject && (
                            <ExportHistory
                                projectId={activeProject}
                                type={assessmentType}
                            />
                        )}
                    </TabPanel>
                )}
            </ContainerCard>
        </Tabs>
    );
}

export default Export;
