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
import ExportHistory from './ExportHistory';

import { useModalState } from '#hooks/stateManagement';
import ProjectContext from '#base/context/ProjectContext';
import styles from './styles.css';

type ExportType = 'export-entry-history' | 'export-assessment-history';

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
                contentClassName={styles.content}
            >
                <ExportHistory
                    projectId="6"
                    type={[]}
                />
            </ContainerCard>
        </Tabs>
    );
}

export default Export;
