import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
    assigneeName?: string;
    pillarTitle?: string;
    status?: string;
}

function PillarAssignment(props: Props) {
    const {
        className,
        assigneeName,
        pillarTitle,
        status,
    } = props;

    return (
        <div className={_cs(styles.pillarAssignment, className)}>
            <div
                className={styles.assigneeName}
                title={assigneeName}
            >
                { assigneeName }
            </div>
            <div
                className={styles.pillarTitle}
                title={pillarTitle}
            >
                { pillarTitle }
            </div>
            <div
                className={styles.status}
                title={status}
            >
                { status }
            </div>
        </div>
    );
}

export default PillarAssignment;
