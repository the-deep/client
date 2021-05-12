import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import { ProjectDetails } from '#typings';

import FrameworkDetail from './FrameworkDetail';
import styles from './styles.scss';

interface Props {
    className?: string;
    projectId: number;
    projectDetails?: ProjectDetails;
    onProjectChange: () => void;
}

function ProjectFramework(props: Props) {
    const {
        className,
        projectId,
        projectDetails,
        onProjectChange,
    } = props;

    const [
        selectedFramework,
        setSelectedFramework,
    ] = useState<number| undefined>(projectDetails?.analysisFramework ?? 5);

    return (
        <div className={_cs(styles.framework, className)}>
            <div className={styles.leftContainer}>
                Framework {projectId}
            </div>
            {selectedFramework && (
                <FrameworkDetail
                    projectFrameworkId={projectDetails?.analysisFramework}
                    projectId={projectId}
                    frameworkId={selectedFramework}
                    className={styles.rightContainer}
                    onProjectChange={onProjectChange}
                    onFrameworkChange={setSelectedFramework}
                />
            )}
        </div>
    );
}

export default ProjectFramework;
