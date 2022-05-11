import React, { useState } from 'react';
import {
    Tabs,
    ContainerCard,
} from '@the-deep/deep-ui';
import {
    ExportDataTypeEnum,
} from '#generated/types';
import ExportHistory from '../../Tagging/Export/ExportHistory';

import { useModalState } from '#hooks/stateManagement';
import ProjectContext from '#base/context/ProjectContext';
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
                heading="Export History"
                headingSize="extraSmall"
                headerClassName={styles.header}
                contentClassName={styles.content}
            >
                <ExportHistory
                    projectId={activeProject}
                    type={entryType}
                />
            </ContainerCard>
        </Tabs>
    );
}

export default Export;
