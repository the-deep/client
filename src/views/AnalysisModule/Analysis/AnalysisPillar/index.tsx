import React, { useCallback } from 'react';
import {
    reverseRoute,
} from '@togglecorp/fujs';
import {
    Container,
    Tag,
    QuickActionButton,
    QuickActionLink,
} from '@the-deep/deep-ui';

import Icon from '#rscg/Icon';
import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';
import TextOutput from '#components/general/TextOutput';

import {
    AnalysisPillars,
} from '#typings';
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
                    <span className={styles.boldText}>
                        {_ts('analysis', 'creationDate')}
                    </span>
                    <FormattedDate
                        value={createdAt}
                        mode=" MMM dd yyyy"
                    />
                </div>
            )}
        >
            <div className={styles.pillarBody}>
                {pendingPillarDelete && <LoadingAnimation />}
                <div className={styles.left}>
                    <div className={styles.analystItem}>
                        <TextOutput
                            className={styles.textOutput}
                            label={_ts('analysis', 'analyst')}
                            value={assigneeName}
                            valueClassName={styles.value}
                            noColon
                        />
                    </div>
                    <div className={styles.statementsItem}>
                        <div>
                            Statements
                        </div>
                        <div className={styles.statements}>
                            {statements?.map(statement => (
                                <div
                                    key={statement.id}
                                    className={styles.statement}
                                >
                                    <div>
                                        {statement.statement}
                                    </div>
                                    <div>
                                        {statement.analyticalEntries.length}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}

export default AnalysisPillar;
