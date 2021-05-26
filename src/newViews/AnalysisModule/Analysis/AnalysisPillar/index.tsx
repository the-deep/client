import React, { useCallback } from 'react';
import { reverseRoute } from '@togglecorp/fujs';
import {
    Container,
    Tag,
    QuickActionButton,
    QuickActionLink,
    DateOutput,
    PendingMessage,
} from '@the-deep/deep-ui';

import Icon from '#rscg/Icon';
import TextOutput from '#components/general/TextOutput';

import { AnalysisPillars } from '#typings';
import { pathNames } from '#constants';

import _ts from '#ts';
import styles from './styles.scss';

interface ComponentProps {
    analysisId: number;
    assigneeName?: string;
    statements?: AnalysisPillars['analyticalStatements'];
    title: string;
    createdAt: string;
    onDelete: (value: number) => void;
    pillarId: AnalysisPillars['id'];
    projectId: number;
    pendingPillarDelete: boolean;
}

function AnalysisPillar(props: ComponentProps) {
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
    } = props;

    const completed = false;
    // setIsCompleted to be used when the status is passed by API

    const handleDeletePillar = useCallback(() => {
        onDelete(pillarId);
    }, [pillarId, onDelete]);

    const editLink = reverseRoute(pathNames.pillarAnalysis, {
        projectId,
        analysisId,
        pillarId,
    });

    const disabled = pendingPillarDelete;

    return (
        <Container
            className={styles.pillar}
            sub
            heading={(
                <div className={styles.left}>
                    {title}
                    <Tag
                        className={styles.tag}
                        variant={completed ? 'accent' : 'gradient1'}
                    >
                        {completed
                            ? _ts('analysis', 'completeLabel')
                            : _ts('analysis', 'inProgressLabel')
                        }
                    </Tag>
                </div>
            )}
            headerClassName={styles.heading}
            headerActions={(
                <div className={styles.headerRight}>
                    <QuickActionLink
                        to={editLink}
                        disabled={disabled}
                        className={styles.button}
                    >
                        <Icon name="edit" />
                    </QuickActionLink>
                    <QuickActionButton
                        name={undefined}
                        className={styles.button}
                        disabled={disabled}
                    >
                        <Icon name="copy" />
                    </QuickActionButton>
                    <QuickActionButton
                        name={undefined}
                        className={styles.button}
                        onClick={handleDeletePillar}
                        disabled={disabled}
                    >
                        <Icon name="delete" />
                    </QuickActionButton>
                </div>
            )}
            headerDescription={(
                <div className={styles.subHeading}>
                    {_ts('analysis', 'creationDate')}
                    <DateOutput
                        value={createdAt}
                        format="dd MMM, yyyy"
                    />
                </div>
            )}
        >
            <div className={styles.pillarBody}>
                {pendingPillarDelete && <PendingMessage />}
                <div className={styles.analystItem}>
                    <TextOutput
                        label={_ts('analysis', 'analyst')}
                        value={assigneeName}
                        noColon
                        type="small-block"
                    />
                </div>
                <div className={styles.statementsItem}>
                    <TextOutput
                        label={_ts('analysis', 'statementsTitle')}
                        type="small-block"
                        value={(
                            <div className={styles.statements}>
                                {statements?.map(statement => (
                                    <div
                                        key={statement.id}
                                        className={styles.statement}
                                    >
                                        <div className={styles.statementText}>
                                            {statement.statement}
                                        </div>
                                        <div className={styles.entryCount}>
                                            {`${statement.analyticalEntries.length} Entries`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                </div>
            </div>
        </Container>
    );
}

export default AnalysisPillar;
