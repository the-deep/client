import React from 'react';
import {
    reverseRoute,
    _cs,
} from '@togglecorp/fujs';
import {
    Container,
    Tag,
    QuickActionButton,
    QuickActionLink,
    PendingMessage,
    TextOutput,
} from '@the-deep/deep-ui';

import Icon from '#rscg/Icon';

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
    className?: string;
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
        className,
    } = props;

    const completed = false;
    // setIsCompleted to be used when the status is passed by API

    const editLink = reverseRoute(pathNames.pillarAnalysis, {
        projectId,
        analysisId,
        pillarId,
    });

    const disabled = pendingPillarDelete;

    return (
        <Container
            className={_cs(styles.analysisPillar, className)}
            sub
            heading={title}
            headingDescription={(
                <Tag variant={completed ? 'accent' : 'gradient1'}>
                    {completed
                        ? _ts('analysis', 'completeLabel')
                        : _ts('analysis', 'inProgressLabel')
                    }
                </Tag>
            )}
            inlineHeadingDescription
            headerActions={(
                <>
                    <QuickActionLink
                        to={editLink}
                        disabled={disabled}
                    >
                        <Icon name="edit" />
                    </QuickActionLink>
                    <QuickActionButton
                        name={undefined}
                        disabled={disabled}
                    >
                        <Icon name="copy" />
                    </QuickActionButton>
                    <QuickActionButton
                        name={pillarId}
                        onClick={onDelete}
                        disabled={disabled}
                    >
                        <Icon name="delete" />
                    </QuickActionButton>
                </>
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
            horizontallyCompactContent
        >
            {pendingPillarDelete && <PendingMessage />}
            <div className={styles.metaSection}>
                <TextOutput
                    label={_ts('analysis', 'analyst')}
                    value={assigneeName}
                    block
                    hideLabelColon
                />
            </div>
            <div className={styles.statementsSection}>
                <TextOutput
                    label={_ts('analysis', 'statementsTitle')}
                    block
                    value={statements?.map(statement => (
                        <TextOutput
                            key={statement.id}
                            value={statement.statement}
                            description={`${statement.analyticalEntries.length} Entries`}
                        />
                    ))}
                />
            </div>
        </Container>
    );
}

export default AnalysisPillar;
