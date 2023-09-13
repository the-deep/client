import { AssessmentRegistryScoreAnalyticalStatementTypeEnum, AssessmentRegistryScoreCriteriaTypeEnum } from '#generated/types';
import { ContainerCard } from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';
import React from 'react';
import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
} from 'recharts';

type AnalyticalData = {
  [key: AssessmentRegistryScoreAnalyticalStatementTypeEnum]: {
    analyticalStatement: AssessmentRegistryScoreAnalyticalStatementTypeEnum;
    analyticalStatementDisplay: string;
    date: string;
    finalScore: number;
    scoreCriteria: AssessmentRegistryScoreCriteriaTypeEnum;
    scoreCriteriaDisplay: string;
    scoreType: AssessmentRegistryScoreCriteriaTypeEnum;
  };
};

interface Props {
    className?: string;
    heading?: string;
    data: AnalyticalData[];
}

function MedianRadarChart(props: Props) {
    const {
        className,
        heading,
        data,
    } = props;

    return (
        <ContainerCard
            className={_cs(className)}
            heading={heading}
            headingSize="extraSmall"
            spacing="loose"
        >
            <RadarChart
                outerRadius="80"
                width={350}
                height={350}
                data={data}
            >
                <PolarGrid radialLines={false} gridType="circle" />
                <PolarAngleAxis dataKey="scoreCriteriaDisplay" />
                <PolarRadiusAxis />
                <Radar
                    dataKey="finalScore"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                />
            </RadarChart>
        </ContainerCard>
    );
}
export default MedianRadarChart;
