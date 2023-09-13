import { AssessmentRegistryScoreAnalyticalStatementTypeEnum, AssessmentRegistryScoreCriteriaTypeEnum } from '#generated/types';
import { ContainerCard } from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';
import React from 'react';
import {
    PolarAngleAxis,
    ResponsiveContainer,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
} from 'recharts';

import styles from './styles.css';

interface AnalyticalData {
    analyticalStatement?: AssessmentRegistryScoreAnalyticalStatementTypeEnum;
    analyticalStatementDisplay?: string;
    finalScore?: number;
    scoreCriteria?: AssessmentRegistryScoreCriteriaTypeEnum;
    scoreCriteriaDisplay?: string;
    scoreType?: string;
}

interface Props {
    className?: string;
    heading?: string;
    data: AnalyticalData[];
    labelKey?: string;
}

function MedianRadarChart(props: Props) {
    const {
        className,
        heading,
        data,
        labelKey,
    } = props;

    return (
        <ContainerCard
            className={_cs(styles.medianRadarChart, className)}
            heading={heading}
            headingSize="extraSmall"
            spacing="loose"
            borderBelowHeader
            borderBelowHeaderWidth="thin"
        >
            <ResponsiveContainer
                debounce={300}
                className={styles.responsiveContainer}
                width={300}
                height={300}
            >
                <RadarChart
                    outerRadius="60"
                    data={data}
                >
                    <PolarGrid radialLines={false} gridType="circle" />
                    <PolarAngleAxis dataKey={labelKey} />
                    <PolarRadiusAxis />
                    <Radar
                        dataKey="finalScore"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                        dot
                    />
                </RadarChart>
            </ResponsiveContainer>
        </ContainerCard>
    );
}
export default MedianRadarChart;
