import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    NumberOutput,
} from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    className?: string;
    frameworkTitle?: string;
    projectCount?: number;
    sourceCount?: number;
}

function ActiveFramework(props: Props) {
    const {
        className,
        frameworkTitle,
        projectCount,
        sourceCount,
    } = props;

    return (
        <div className={_cs(className, styles.activeFramework)}>
            <div className={styles.frameworkTitle}>
                {frameworkTitle}
            </div>
            <NumberOutput
                className={styles.count}
                value={projectCount}
                suffix="projects"
                numberClassName={styles.number}
            />
            <NumberOutput
                className={styles.count}
                value={sourceCount}
                suffix="sources"
                numberClassName={styles.number}
            />
        </div>
    );
}

export default ActiveFramework;
