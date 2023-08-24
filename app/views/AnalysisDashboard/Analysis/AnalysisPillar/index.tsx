import React, { useContext, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    NumberOutput,
    Container,
    Tag,
    QuickActionConfirmButton,
    PendingMessage,
    TextOutput,
    List,
} from '@the-deep/deep-ui';
import { FiEdit2 } from 'react-icons/fi';
import {
    IoTrashBinOutline,
} from 'react-icons/io5';

import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import {
    PillarSummary,
    AnalyticalStatementSummary,
} from '#types';
import routes from '#base/configs/routes';
import { ProjectContext } from '#base/context/ProjectContext';
import { calcPercent } from '#utils/common';

import _ts from '#ts';
import styles from './styles.css';

const statementKeySelector = (d: AnalyticalStatementSummary) => d.id;

export interface Props {
    analysisId: number;
    assigneeName?: string;
    statements?: AnalyticalStatementSummary[];
    title: string;
    createdAt: string;
    onDelete: (value: number) => void;
    pillarId: PillarSummary['id'];
    projectId: string;
    pendingPillarDelete: boolean;
    className?: string;
    totalEntries: number;
    analyzedEntries?: number;
}

function AnalysisPillar(props: Props) {
    const {
        pillarId,
        title,
        assigneeName,
        onDelete,
        projectId,
        analysisId,
        createdAt,
        pendingPillarDelete,
        statements,
        className,
        totalEntries,
        analyzedEntries = 0,
    } = props;

    const {
        project,
    } = useContext(ProjectContext);

    // NOTE: using entry delete permission for analysis pillar
    const canDeleteAnalysisPillar = project?.allowedPermissions?.includes('DELETE_ENTRY');

    const isAnalysisCompleted = analyzedEntries === totalEntries && totalEntries > 0;
    let statusLabel = _ts('analysis', 'inProgressTagLabel');
    if (analyzedEntries === totalEntries && analyzedEntries > 0) {
        statusLabel = _ts('analysis', 'analysisCompletedTagLabel');
    } else if (totalEntries === 0) {
        statusLabel = _ts('analysis', 'noAnalysisTagLabel');
    }

    const disabled = pendingPillarDelete;

    const onDeleteConfirmClick = useCallback(() => {
        onDelete(pillarId);
    }, [onDelete, pillarId]);

    const statementRendererParams = useCallback((_: number, data: AnalyticalStatementSummary) => ({
        className: styles.statement,
        valueContainerClassName: styles.statementText,
        descriptionContainerClassName: styles.description,
        description: _ts(
            'analysis',
            'entriesCount',
            {
                entriesCount: data.entriesCount,
            },
        ),
        value: data.statement,
    }), []);

    return (
        <Container
            className={_cs(styles.analysisPillar, className)}
            heading={title}
            headingSize="small"
            headingDescription={(
                <Tag variant={isAnalysisCompleted ? 'accent' : 'gradient1'}>
                    {statusLabel}
                </Tag>
            )}
            inlineHeadingDescription
            headerActions={(
                <>
                    <SmartButtonLikeLink
                        route={routes.pillarAnalysis}
                        attrs={{
                            projectId,
                            analysisId,
                            pillarAnalysisId: pillarId,
                        }}
                        disabled={disabled}
                        variant="tertiary"
                        icons={(
                            <FiEdit2 />
                        )}
                    >
                        {_ts('analysis', 'continueAnalysisButton')}
                    </SmartButtonLikeLink>
                    {canDeleteAnalysisPillar && (
                        <QuickActionConfirmButton
                            name={pillarId}
                            onConfirm={onDeleteConfirmClick}
                            title={_ts('analysis', 'deletePillarButtonTitle')}
                            message={_ts('analysis', 'deletePillarConfirmMessage')}
                            disabled={disabled}
                            showConfirmationInitially={false}
                            variant="secondary"
                        >
                            <IoTrashBinOutline />
                        </QuickActionConfirmButton>
                    )}
                </>
            )}
            headerDescription={(
                <TextOutput
                    label={_ts('analysis', 'creationDate')}
                    value={createdAt}
                    valueType="date"
                    hideLabelColon
                />
            )}
            contentClassName={styles.content}
        >
            {pendingPillarDelete && <PendingMessage />}
            <div className={styles.leftContainer}>
                <TextOutput
                    label={_ts('analysis', 'analyst')}
                    value={assigneeName}
                    block
                    hideLabelColon
                />
                <TextOutput
                    label={_ts('analysis', 'entriesAnalyzed')}
                    value={(
                        <div className={styles.completion}>
                            <NumberOutput
                                value={calcPercent(analyzedEntries, totalEntries)}
                                suffix="%"
                                precision={2}
                            />
                            <div className={styles.label}>
                                {_ts(
                                    'analysis',
                                    'analysisLabel',
                                    {
                                        totalEntries,
                                        analyzedEntries,
                                    },
                                )}
                            </div>
                        </div>
                    )}
                    block
                    hideLabelColon
                />
            </div>
            {(statements?.length ?? 0) > 0 && (
                <TextOutput
                    className={styles.rightContainer}
                    label={_ts('analysis', 'statementsTitle')}
                    block
                    valueContainerClassName={styles.statementsContainer}
                    value={(
                        <List
                            data={statements}
                            rendererParams={statementRendererParams}
                            renderer={TextOutput}
                            keySelector={statementKeySelector}
                        />
                    )}
                />
            )}
        </Container>
    );
}

export default AnalysisPillar;
