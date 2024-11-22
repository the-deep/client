import React from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import _ts from '#ts';

import styles from './styles.css';

export interface Props {
    className?: string;
    assigneeName: string | null | undefined;
    pillarTitle: string;
    analyzedEntries: number;
    totalEntries?: number;
}

function PillarAssignment(props: Props) {
    const {
        className,
        assigneeName,
        pillarTitle,
        analyzedEntries = 0,
        totalEntries = 0,
    } = props;

    let statusLabel = _ts('analysis', 'inProgressTagLabel');
    if (analyzedEntries === totalEntries && analyzedEntries > 0) {
        statusLabel = _ts('analysis', 'analysisCompletedTagLabel');
    } else if (totalEntries === 0) {
        statusLabel = _ts('analysis', 'noAnalysisTagLabel');
    }
    const isAnalysisCompleted = analyzedEntries === totalEntries && totalEntries > 0;

    return (
        <div className={_cs(styles.pillarAssignment, className)}>
            <div
                className={styles.assigneeName}
                title={isDefined(assigneeName) ? assigneeName : undefined}
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
