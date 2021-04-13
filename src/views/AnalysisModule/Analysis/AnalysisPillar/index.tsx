import React, { useCallback, useState } from 'react';
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
    title: string;
    createdAt: string;
    onDelete: (value: number) => void;
    pillarId: AnalysisPillars['id'];
    projectId: number;
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
    } = props;

    // FIXME: setCompleted to be used when the status is passed by API
    const [completed] = useState(false);

    const handleDeletePillar = useCallback(() => {
        onDelete(pillarId);
    }, [pillarId, onDelete]);

    const editLink = reverseRoute(pathNames.pillarAnalysis, {
        projectId,
        analysisId,
        pillarId,
    });

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
                    >
                        <Icon name="edit" />
                    </QuickActionLink>
                    <QuickActionButton
                        className={styles.button}
                    >
                        <Icon name="copy" />
                    </QuickActionButton>
                    <QuickActionButton
                        className={styles.button}
                        onClick={handleDeletePillar}
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
                <div className={styles.left}>
                    <div className={styles.item}>
                        <TextOutput
                            className={styles.textOutput}
                            label={_ts('analysis', 'analyst')}
                            value={assigneeName}
                            valueClassName={styles.value}
                            noColon
                        />
                    </div>
                </div>
            </div>
        </Container>
    );
}

export default AnalysisPillar;
