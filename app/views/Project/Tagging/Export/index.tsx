import React, { useState } from 'react';
import { IoAdd } from 'react-icons/io5';
import {
    Modal,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    ContainerCard,
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
                        <Tab
                            name="export-assessment-history"
                            transparentBorder
                        >
                            Export Assessment History
                        </Tab>
                    </TabList>
                )}
                headingContainerClassName={styles.actionButtons}
                headerActions={(
                    <>
                        <Button
                            name="export-entry"
                            onClick={showCreateNewExportModal}
                            icons={<IoAdd />}
                            variant="primary"
                        >
                            New Export
                        </Button>
                        <Button // TODO: properly check permissions
                            name="export-assessment"
                            onClick={showNewAssessmentModal}
                            icons={<IoAdd />}
                            variant="secondary"
                        >
                            New Assessment Export
                        </Button>
                    </>
                )}
                contentClassName={styles.content}
            >
                <TabPanel
                    name="export-entry-history"
                    className={styles.tabPanel}
                >
                    {activeProject && (
                        <ExportHistory
                            projectId={activeProject}
                            type={entryType}
                        />
                    )}
                </TabPanel>
                <TabPanel
                    name="export-assessment-history"
                    className={styles.tabPanel}
                >
                    {activeProject && (
                        <ExportHistory
                            projectId={activeProject}
                            type={assessmentType}
                        />
                    )}
                </TabPanel>
                {newExportModalShown && activeProject && (
                    <Modal
                        className={styles.modal}
                        heading="Setup new export file"
                        size="cover"
                        onCloseButtonClick={hideCreateNewExportModal}
                        bodyClassName={styles.body}
                    >
                        <EntriesExportSelection
                            className={styles.selection}
                            projectId={activeProject}
                            onSuccess={hideCreateNewExportModal}
                        />
                    </Modal>
                )}
                {newAssessmentModalShown && activeProject && (
                    <Modal
                        className={styles.modal}
                        size="cover"
                        heading="Setup new assessment export file"
                        onCloseButtonClick={hideNewAssessmentModal}
                        bodyClassName={styles.body}
                    >
                        <AssessmentsExportSelection
                            className={styles.selection}
                            projectId={activeProject}
                            onSuccess={hideNewAssessmentModal}
                        />
                    </Modal>
                )}
            </ContainerCard>
        </Tabs>
    );
}

export default Export;
