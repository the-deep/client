import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    KeyFigure,
} from '@the-deep/deep-ui';
import { PurgeNull } from '@togglecorp/toggle-form';

import {
    AryDashboardFilterQuery,
    AssessmentRegistryCoordinationTypeEnum,
} from '#generated/types';

import styles from './styles.module.css';

interface Props {
    className?: string;
    data: NonNullable<PurgeNull<AryDashboardFilterQuery['project']>>['assessmentDashboardStatistics'];
}

function Statistics(props: Props) {
    const {
        className,
        data,
    } = props;

    const getCoordinationValue = useCallback(
        (coordinationType: AssessmentRegistryCoordinationTypeEnum) => {
            const matchedItem = data?.assessmentCount?.find(
                (coordination) => coordination?.coordinatedJoint === coordinationType,
            );

            return matchedItem?.count ?? 0;
        }, [data?.assessmentCount],
    );

    return (
        <div className={_cs(styles.statistics, className)}>
            <div className={styles.row}>
                <KeyFigure
                    label="Assessments"
                    value={data?.totalAssessment}
                    spacing="compact"
                    small
                />
                <KeyFigure
                    label="Joint Assessments"
                    value={getCoordinationValue('COORDINATED')}
                    spacing="compact"
                    small
                />
                <KeyFigure
                    label="Uncoordinated Assessments"
                    value={getCoordinationValue('UNCOORDINATED')}
                    spacing="compact"
                    small
                />
                <KeyFigure
                    label="Harmonized Assessments"
                    value={getCoordinationValue('HARMONIZED')}
                    spacing="compact"
                    small
                />
                <KeyFigure
                    label="Multisectoral Assessments"
                    value={data?.totalSinglesectorAssessment}
                    spacing="compact"
                    small
                />
                <KeyFigure
                    label="Single Sector Assessments"
                    value={data?.totalSinglesectorAssessment}
                    spacing="compact"
                    small
                />
            </div>
            <div className={styles.row}>
                <KeyFigure
                    label="Stakeholders"
                    value={data?.totalStakeholder}
                    spacing="compact"
                    small
                />
                {data?.stakeholderCount?.map((item) => (
                    <KeyFigure
                        key={item?.stakeholder}
                        label={item?.stakeholder}
                        value={item?.count}
                        spacing="compact"
                        small
                    />
                ))}
            </div>
            <div className={styles.row}>
                <KeyFigure
                    label="Collection Techniques"
                    value={data?.totalCollectionTechnique}
                    spacing="compact"
                    small
                />
                {data?.collectionTechniqueCount?.map((technique) => (
                    <KeyFigure
                        key={technique?.dataCollectionTechnique}
                        label={technique?.dataCollectionTechniqueDisplay}
                        value={technique?.count}
                        spacing="compact"
                        small
                    />
                ))}
            </div>
        </div>
    );
}

export default Statistics;
