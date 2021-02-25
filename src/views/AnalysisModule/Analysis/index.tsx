import React from 'react';
import { _cs } from '@togglecorp/fujs';

import FormattedDate from '#rscv/FormattedDate';
import ContainerCard from '#dui/ContainerCard';
import Button from '#dui/Button';
import Icon from '#rscg/Icon';
import QuickActionButton from '#dui/QuickActionButton';

import _ts from '#ts';

import styles from './styles.scss';

const emptyComponent = () => null;

interface ComponentProps {
    className?: string;
    title: string;
    startDate?: string;
    endDate?: string;
}

function Analysis(props: ComponentProps) {
    const {
        title,
        className,
        startDate,
        endDate,
    } = props;

    return (
        <ContainerCard
            className={_cs(className, styles.analysisItem)}
            heading={title}
            sub
            headerDescription={(
                <>
                    <FormattedDate
                        title={_ts('analysis', 'startDateLabel')}
                        value={startDate}
                        mode="MMM yyyy"
                        emptyComponent={emptyComponent}
                    />
                    {startDate && endDate && (
                        <div className={styles.separator}>-</div>
                    )}
                    <FormattedDate
                        title={_ts('analysis', 'endDateLabel')}
                        value={endDate}
                        mode="MMM yyyy"
                        emptyComponent={emptyComponent}
                    />
                </>
            )}
            headerActions={(
                <div className={styles.headerRight}>
                    <Button
                        className={styles.button}
                        variant="tertiary"
                        icons={(
                            <Icon name="add" />
                        )}
                    >
                        {_ts('analysis', 'addPillarAnalysis')}
                    </Button>
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
                    >
                        <Icon name="delete" />
                    </QuickActionButton>
                </div>
            )}
        >
            Content
        </ContainerCard>
    );
}

export default Analysis;
