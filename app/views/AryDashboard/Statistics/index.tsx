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
    projectId: string;
    data: NonNullable<PurgeNull<AryDashboardFilterQuery['project']>>['assessmentDashboardStatistics'];
}

function Statistics(props: Props) {
    const {
        className,
        projectId,
        data,
    } = props;
    // eslint-disable-next-line no-console
    console.log('here', projectId);

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
                />
                <KeyFigure
                    label="Joint Assessments"
                    value={getCoordinationValue('COORDINATED')}
                />
                <KeyFigure
                    label="Uncoordinated Assessments"
                    value={getCoordinationValue('UNCOORDINATED')}
                />
                <KeyFigure
                    label="Harmonized Assessments"
                    value={getCoordinationValue('HARMONIZED')}
                />
                <KeyFigure
                    label="Multisectoral Assessments"
                    value={data?.totalSinglesectorAssessment}
                />
                <KeyFigure
                    label="Single Sector Assessments"
                    value={data?.totalSinglesectorAssessment}
                />
            </div>
            <div className={styles.row}>
                <KeyFigure
                    label="Stakeholders"
                    value={data?.totalStakeholder}
                />
                {data?.stakeholderCount?.map((item) => (
                    <KeyFigure
                        key={item?.stakeholder}
                        label={item?.stakeholder}
                        value={item?.count}
                    />
                ))}
            </div>
            <div className={styles.row}>
                <KeyFigure
                    label="Collection Techniques"
                    value={data?.totalCollectionTechnique}
                />
                {data?.collectionTechniqueCount?.map((technique) => (
                    <KeyFigure
                        key={technique?.dataCollectionTechnique}
                        label={technique?.dataCollectionTechniqueDisplay}
                        value={technique?.count}
                    />
                ))}
            </div>
        </div>
    );
}

export default Statistics;
