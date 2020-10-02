import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface QualityControlProps {
    className?: string;
    projectId: number;
}

function QualityControl(props: QualityControlProps) {
    const {
        className,
        projectId,
    } = props;

    return (
        <div className={_cs(className, styles.qualityControl)}>
            Quality control for
            <div>
                {projectId}
            </div>
        </div>
    );
}

export default QualityControl;
