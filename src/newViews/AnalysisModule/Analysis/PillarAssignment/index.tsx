import React from 'react';
import { _cs } from '@togglecorp/fujs';

import _ts from '#ts';

import styles from './styles.scss';

interface Props {
    className?: string;
    assigneeName?: string;
    pillarTitle?: string;
    entriesAnalyzed?: number;
    totalEntries?: number;
}

function PillarAssignment(props: Props) {
    const {
        className,
        assigneeName,
        pillarTitle,
        entriesAnalyzed = 0,
        totalEntries = 0,
    } = props;

    let statusLabel = _ts('analysis', 'inProgressTagLabel');
    if (entriesAnalyzed === totalEntries && entriesAnalyzed > 0) {
        statusLabel = _ts('analysis', 'analysisCompletedTagLabel');
    } else if (totalEntries === 0) {
        statusLabel = _ts('analysis', 'noAnalysisTagLabel');
    }
    const isAnalysisCompleted = entriesAnalyzed === totalEntries && totalEntries > 0;

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
                className={_cs(
                    styles.status,
                    isAnalysisCompleted && styles.completedAnalysis,
                )}
                title={statusLabel}
            >
                { statusLabel }
            </div>
        </div>
    );
}

export default PillarAssignment;
