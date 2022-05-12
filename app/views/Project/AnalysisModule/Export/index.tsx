import React from 'react';
import {
    ContainerCard,
} from '@the-deep/deep-ui';
import {
    ExportDataTypeEnum,
} from '#generated/types';

import ExportHistory from '#views/Project/Tagging/Export/ExportHistory';
import ProjectContext from '#base/context/ProjectContext';

import styles from './styles.css';

const analysisType: ExportDataTypeEnum[] = ['ANALYSES'];

function Export() {
    const { project } = React.useContext(ProjectContext);
    const activeProject = project ? project.id : undefined;

    return (
        <ContainerCard
            className={styles.container}
            heading="Export History"
            headingSize="extraSmall"
            headerClassName={styles.header}
            contentClassName={styles.content}
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
