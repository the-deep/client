import React, { useCallback, useState } from 'react';

import Icon from '#rscg/Icon';
import QuickActionButton from '#dui/QuickActionButton';
import Container from '#dui/Container';
import Tag from '#dui/Tag';
import FormattedDate from '#rscv/FormattedDate';
import TextOutput from '#components/general/TextOutput';

import {
    AnalysisPillars,
} from '#typings';

import _ts from '#ts';
import styles from './styles.scss';

interface ComponentProps extends Omit<AnalysisPillars, 'id' | 'analysis'> {
    pillarId: AnalysisPillars['id'];
    setDeleteId: (value: number) => void;
    createdOn: string | number;
}

function AnalysisPillar(props: ComponentProps) {
    const {
        pillarId,
        title,
        assigneeName,
        setDeleteId,
        createdOn,
    } = props;

    const [isCompleted, setIsCompleted] = useState(false);
    // setIsCompleted to be used when the status is passed by API

    const handleDeletePillar = useCallback(() => {
        setDeleteId(pillarId);
    }, [pillarId, setDeleteId]);

    return (
        <Container
            className={styles.pillar}
            heading={(
                <div className={styles.left}>
                    {title}
                    <Tag
                        className={styles.tag}
                        variant={isCompleted ? 'accent' : 'gradient1'}
                    >
                        {isCompleted
                            ? _ts('analysis', 'completeLabel')
                            : _ts('analysis', 'inProgressLabel')
                        }
                    </Tag>
                </div>
            )}
            headerClassName={styles.heading}
            headerActions={(
                <div className={styles.headerRight}>
                    <QuickActionButton
                        className={styles.button}
                    >
                        <Icon name="edit" />
                    </QuickActionButton>
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
                        value={createdOn}
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
