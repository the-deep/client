import React, {
    useState,
    useMemo,
} from 'react';
import {
    Tab,
    TabList,
    TabPanel,
    Tabs,
    KeyFigure,
} from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
} from '@togglecorp/toggle-form';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    isDefined,
    isNotDefined,
    sum,
    listToMap,
    median,
    compareString,
} from '@togglecorp/fujs';

import {
    AssessmentRegistryScoreAnalyticalStatementTypeEnum,
    GetQualityScoreListQuery,
    GetQualityScoreListQueryVariables,
} from '#generated/types';

import QualityScoreForm from './QualityScoreForm';
import AnalyticalDensityForm from './AnalyticalDensityForm';
import {
    PartialFormType,
} from '../formSchema';

import styles from './styles.css';

type TabOptions = 'qualityScores' | 'analyticalDensity' | undefined;

const scoring = {
    VERY_POOR: 0,
    POOR: 0.5,
    FAIR: 1,
    GOOD: 1.5,
    VERY_GOOD: 2,
};

const GET_QUALITY_SCORE_LIST = gql`
    query GetQualityScoreList(
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            id
            assessmentRegistryOptions {
                scoreOptions {
                    scoreCriteriaDisplay
                    scoreCriteria
                    analyticalStatementDisplay
                    analyticalStatement
                }
            }
        }
    }
`;

interface Props {
    projectId: string;
    value: PartialFormType,
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>
}

function ScoreForm(props: Props) {
    const {
        projectId,
        value,
        setFieldValue,
        error,
    } = props;

    const [activeTab, setActiveTab] = useState<TabOptions>('qualityScores');

    const {
        data: qualityScoreList,
    } = useQuery<GetQualityScoreListQuery, GetQualityScoreListQueryVariables>(
        GET_QUALITY_SCORE_LIST,
        {
            variables: {
                projectId,
            },
        },
    );

    const scoreOptions = qualityScoreList?.project?.assessmentRegistryOptions?.scoreOptions;
    const scoreToScoreGroupMap = listToMap(
        scoreOptions,
        (k) => k.scoreCriteria,
        (d) => d.analyticalStatement,
    );

    const scoreStatsValue = useMemo(() => {
        // NOTE: Analytical Density Value
        const sectorWiseDensityValue = value.scoreAnalyticalDensity?.map(
            (density) => {
                const figureProvideValue = density.figureProvided?.length ?? 0;
                const analysisLevelValue = density.analysisLevelCovered?.length ?? 0;
                return (figureProvideValue * analysisLevelValue) / 10;
            },
        ).filter(isDefined);

        const analyticalDensityValue = {
            key: 'ANALYTICAL_DENSITY',
            label: 'Analytical density',
            score: median(sectorWiseDensityValue ?? []) ?? 0,
        };

        // TODO: Replace string to enum
        interface Accumulator {
            [key: string]: number;
        }

        interface ScoreStatsAccumulator {
            [key: string]: {
                label: string;
                key: AssessmentRegistryScoreAnalyticalStatementTypeEnum;
                score: number;
            };
        }

        const scoreRatingValue = value.scoreRatings?.reduce<Accumulator>(
            (acc, scoreRating) => {
                if (isNotDefined(scoreRating.rating) || isNotDefined(scoreRating.scoreType)) {
                    return acc;
                }
                const key = scoreToScoreGroupMap?.[scoreRating.scoreType];
                const score = scoring?.[scoreRating.rating];

                if (isNotDefined(key) || isNotDefined(score)) {
                    return acc;
                }
                const currentValueForGroup = acc?.[key];

                acc[key] = (currentValueForGroup ?? 0) + score;

                return acc;
            },
            {},
        );

        const scoreStatsList = scoreOptions?.reduce<ScoreStatsAccumulator>(
            (acc, elem) => {
                acc[elem.analyticalStatement] = {
                    key: elem.analyticalStatement,
                    label: elem.analyticalStatementDisplay,
                    score: scoreRatingValue?.[elem.analyticalStatement] ?? 0,
                };

                return acc;
            },
            {},
        );

        const scoreGroupScores = Object.values(scoreStatsList ?? []).sort(
            (a, b) => (compareString(a.label, b.label)),
        );

        return [
            ...scoreGroupScores,
            analyticalDensityValue,
            {
                key: 'FINAL_SCORE',
                label: 'Final Score',
                score: (sum(
                    scoreGroupScores.map((item) => item.score),
                ) + analyticalDensityValue.score) / 5,
            },
        ];
    }, [
        scoreOptions,
        scoreToScoreGroupMap,
        value.scoreRatings,
        value.scoreAnalyticalDensity,
    ]);

    return (
        <div className={styles.scoreForm}>
            <div className={styles.scores}>
                {scoreStatsValue.map((stats) => (
                    <KeyFigure
                        key={stats.key}
                        label={stats.label}
                        value={stats.score}
                    />
                ))}
            </div>
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
                variant="primary"
            >
                <TabList>
                    <Tab name="qualityScores">Quality Scores</Tab>
                    <Tab name="analyticalDensity">Analytical Density</Tab>
                    <div className={styles.dummy} />
                </TabList>
                <TabPanel
                    name="qualityScores"
                    className={styles.tabPanel}
                >
                    <QualityScoreForm
                        value={value}
                        scoreOptions={scoreOptions}
                        setFieldValue={setFieldValue}
                        error={error}
                    />
                </TabPanel>
                <TabPanel
                    name="analyticalDensity"
                    className={styles.tabPanel}
                >
                    <AnalyticalDensityForm
                        value={value}
                        setFieldValue={setFieldValue}
                        error={error}
                    />
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default ScoreForm;
