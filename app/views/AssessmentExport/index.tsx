import React from 'react';
import {
    ContainerCard,
} from '@the-deep/deep-ui';

import { ExportDataTypeEnum } from '#generated/types';
import ProjectContext from '#base/context/ProjectContext';
import ExportHistory from '#views/Export/ExportHistory';

import styles from './styles.css';

const analysisType: ExportDataTypeEnum[] = ['ANALYSES'];

function Export() {
    const { project } = React.useContext(ProjectContext);
    const activeProject = project ? project.id : undefined;

    return (
        <ContainerCard
            className={styles.container}
            heading="Export History"
            headingSize="small"
            contentClassName={styles.content}
            borderBelowHeaderWidth="thin"
            borderBelowHeader
        >
            {activeProject && (
                <ExportHistory
                    projectId={activeProject}
                    type={analysisType}
                />
            )}
        </ContainerCard>
    );
}

export default Export;
