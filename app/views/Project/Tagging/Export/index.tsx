import React, { useState } from 'react';
import { IoAdd } from 'react-icons/io5';
import {
    Tabs,
    Tab,
    TabList,
    TabPanel,
    Container,
    Button,
} from '@the-deep/deep-ui';
import { useModalState } from '#hooks/stateManagement';

import ProjectContext from '#base/context/ProjectContext';

import ExportHistory from './ExportHistory';
import NewAssessmentExport from './NewAssessmentExport';
import NewExport from './NewExport';
import styles from './styles.css';

type ExportType = 'export-entry-history' | 'export-assessment-history';

function Export() {
    const { project } = React.useContext(ProjectContext);
    const activeProject = project ? +project.id : undefined;
    const [activeTab, setActiveTab] = useState<ExportType>('export-entry-history');

    const [
        newExportModalShown,
        showCreateNewExportModal,
        hideCreateNewExportModal,
    ] = useModalState(false);

    const [
        newAssessmentModalShown,
        showNewAssessmentModal,
        hideNewAssessmentModal,
    ] = useModalState(false);

    return (
        <Container
            className={styles.container}
        >
            <div className={styles.content}>
                <Tabs
                    onChange={setActiveTab}
                    value={activeTab}
                >
                    <div className={styles.top}>
                        <TabList
                            className={styles.tabList}
                        >
                            <Tab name="export-entry-history">
                                Export History
                            </Tab>
                            <Tab name="export-assessment-history">
                                Export Assessment History
                            </Tab>
                        </TabList>

                        <div className={styles.actionButtons}>
                            <Button
                                name="export-entry"
                                className={styles.button}
                                onClick={showCreateNewExportModal}
                                icons={<IoAdd />}
                                variant="secondary"
                            >
                                New Export
                            </Button>
                            <Button // TODO: properly check permissions
                                name="export-assessment"
                                className={styles.button}
                                onClick={showNewAssessmentModal}
                                icons={<IoAdd />}
                                variant="secondary"
                            >
                                New Assessment Export
                            </Button>
                        </div>
                    </div>
                    <TabPanel name="export-entry-history">
                        {activeProject && (
                            <ExportHistory
                                projectId={activeProject}
                                type="entries"
                            />
                        )}
                    </TabPanel>
                    <TabPanel name="export-assessment-history">
                        {activeProject && (
                            <ExportHistory
                                projectId={activeProject}
                                type="assessments"
                            />
                        )}
                    </TabPanel>
                </Tabs>
                {newExportModalShown && activeProject && (
                    <NewExport
                        projectId={activeProject}
                        onClose={hideCreateNewExportModal}
                    />
                )}
                {newAssessmentModalShown && activeProject && (
                    <NewAssessmentExport
                        onClose={hideNewAssessmentModal}
                        projectId={activeProject}
                    />
                )}
            </div>
        </Container>
    );
}

export default Export;
