import React, { useState } from 'react';
import { IoAdd } from 'react-icons/io5';
import {
    Modal,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    Container,
    Button,
} from '@the-deep/deep-ui';

import {
    ExportDataTypeEnum,
} from '#generated/types';
import { useModalState } from '#hooks/stateManagement';
import ProjectContext from '#base/context/ProjectContext';

import ExportHistory from './ExportHistory';
import AssessmentsExportSelection from './AssessmentsExportSelection';
import EntriesExportSelection from './EntriesExportSelection';
import styles from './styles.css';

type ExportType = 'export-entry-history' | 'export-assessment-history';

const entryType: ExportDataTypeEnum[] = ['ENTRIES'];
const assessmentType: ExportDataTypeEnum[] = ['PLANNED_ASSESSMENTS', 'ASSESSMENTS'];

function Export() {
    const { project } = React.useContext(ProjectContext);
    const activeProject = project ? project.id : undefined;
    const [activeTab, setActiveTab] = useState<ExportType | undefined>('export-entry-history');

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
                                type={entryType}
                            />
                        )}
                    </TabPanel>
                    <TabPanel name="export-assessment-history">
                        {activeProject && (
                            <ExportHistory
                                projectId={activeProject}
                                type={assessmentType}
                            />
                        )}
                    </TabPanel>
                </Tabs>
                {newExportModalShown && activeProject && (
                    <Modal
                        className={styles.modal}
                        heading="Setup new export file"
                        onCloseButtonClick={hideCreateNewExportModal}
                        bodyClassName={styles.body}
                    >
                        <EntriesExportSelection
                            className={styles.selection}
                            projectId={activeProject}
                        />
                    </Modal>
                )}
                {newAssessmentModalShown && activeProject && (
                    <Modal
                        className={styles.modal}
                        heading="Setup new assessment export file"
                        onCloseButtonClick={hideNewAssessmentModal}
                        bodyClassName={styles.body}
                    >
                        <AssessmentsExportSelection
                            className={styles.selection}
                            projectId={activeProject}
                        />
                    </Modal>
                )}
            </div>
        </Container>
    );
}

export default Export;
