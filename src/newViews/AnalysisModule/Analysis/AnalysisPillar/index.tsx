import React, { useCallback } from 'react';
import {
    reverseRoute,
    _cs,
} from '@togglecorp/fujs';
import {
    NumberOutput,
    Container,
    Tag,
    QuickActionConfirmButton,
    ButtonLikeLink,
    PendingMessage,
    TextOutput,
    List,
} from '@the-deep/deep-ui';
import { FiEdit2 } from 'react-icons/fi';
import Cloak from '#components/general/Cloak';
import {
    IoTrashBinOutline,
} from 'react-icons/io5';

import {
    PillarSummary,
    AnalyticalStatementSummary,
} from '#types';
import { pathNames } from '#constants';
import { calcPercent } from '#utils/safeCommon';

import _ts from '#ts';
import styles from './styles.scss';

function shouldHideEdit({
    hasAnalysisFramework,
    entryPermissions,
}: {
    hasAnalysisFramework: boolean;
    entryPermissions: {
        create: boolean;
        modify: boolean;
    };
}) {
    return (!hasAnalysisFramework || !(entryPermissions.create || entryPermissions.modify));
}

const statementKeySelector = (d: AnalyticalStatementSummary) => d.id;

export interface Props {
    analysisId: number;
    assigneeName?: string;
    statements?: AnalyticalStatementSummary[];
    title: string;
    createdAt: string;
    onDelete: (value: number) => void;
    pillarId: PillarSummary['id'];
    projectId: number;
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

    const isAnalysisCompleted = analyzedEntries === totalEntries && totalEntries > 0;
    let statusLabel = _ts('analysis', 'inProgressTagLabel');
    if (analyzedEntries === totalEntries && analyzedEntries > 0) {
        statusLabel = _ts('analysis', 'analysisCompletedTagLabel');
    } else if (totalEntries === 0) {
        statusLabel = _ts('analysis', 'noAnalysisTagLabel');
    }

    const editLink = reverseRoute(pathNames.pillarAnalysis, {
        projectId,
        analysisId,
        pillarId,
    });

    const disabled = pendingPillarDelete;

    const onDeleteConfirmClick = useCallback(() => {
        onDelete(pillarId);
    }, [onDelete, pillarId]);

    const statementRendererParams = useCallback((key, data: AnalyticalStatementSummary) => ({
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
            sub
            heading={title}
            headerClassName={styles.header}
            headingDescription={(
                <Tag variant={isAnalysisCompleted ? 'accent' : 'gradient1'}>
                    {statusLabel}
                </Tag>
            )}
            inlineHeadingDescription
            headerActions={(
                <Cloak
                    hide={shouldHideEdit}
                    render={(
                        <>
                            <ButtonLikeLink
                                to={editLink}
                                disabled={disabled}
                                variant="tertiary"
                                icons={(
                                    <FiEdit2 />
                                )}
                            >
                                {_ts('analysis', 'continueAnalysisButton')}
                            </ButtonLikeLink>
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
                        </>
                    )}
                />
            )}
            headerDescription={(
                <TextOutput
                    className={styles.createdAt}
                    label={_ts('analysis', 'creationDate')}
                    value={createdAt}
                    valueType="date"
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
