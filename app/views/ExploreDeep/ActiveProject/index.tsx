import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextOutput,
} from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    className?: string;
    projectTitle?: string;
    frameworkTitle?: string;
}

function ActiveProject(props: Props) {
    const {
        className,
        projectTitle,
        frameworkTitle,
    } = props;

    return (
        <div className={_cs(className, styles.activeProject)}>
            <div className={styles.projectTitle}>
                {projectTitle}
            </div>
            <TextOutput
                label="Framework used"
                value={frameworkTitle}
                hideLabelColon
            />
        </div>
    );
}

export default ActiveProject;
