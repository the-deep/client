import React from 'react';
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

    return (
        <div className={_cs(styles.framework, className)}>
            <div className={styles.leftContainer}>
                Framework {projectId}
            </div>
            {projectDetails?.analysisFramework && (
                <FrameworkDetail
                    projectFrameworkId={projectDetails.analysisFramework}
                    projectId={projectId}
                    frameworkId={5}
                    // frameworkId={projectDetails.analysisFramework}
                    className={styles.rightContainer}
                    onProjectChange={onProjectChange}
                />
            )}
        </div>
    );
}

export default ProjectFramework;
