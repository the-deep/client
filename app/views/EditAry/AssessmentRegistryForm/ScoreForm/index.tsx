import React, {
    useState,
    useMemo,
    useCallback,
} from 'react';
import {
    Tab,
    TabList,
    TabPanel,
    Tabs,
    KeyFigure,
    KeyFigureProps,
    ListView,
    Message,
} from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
    getErrorObject,
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
    _cs,
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

interface ScoreStatsValue {
    key: string;
    label: string;
    score: number;
}

const keySelector = (d: ScoreStatsValue) => d.key;

interface Props {
    projectId: string;
    value: PartialFormType,
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>
    loading?: boolean;
}

function ScoreForm(props: Props) {
    const {
        projectId,
        value,
        setFieldValue,
        error: riskyError,
        loading,
    } = props;

    const error = getErrorObject(riskyError);

    const [activeTab, setActiveTab] = useState<TabOptions>('qualityScores');

    const {
        loading: scorePending,
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
            score: Math.round((median(sectorWiseDensityValue ?? []) ?? 0) * 100) / 100,
        };

        const scoreToScoreGroupMap = listToMap(
            scoreOptions,
            (k) => k.scoreCriteria,
            (d) => d.analyticalStatement,
        );

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

        const scoreGroupScores = [...Object.values(scoreStatsList ?? [])].sort(
            (a, b) => (compareString(a.label, b.label)),
        );

        return [
            ...scoreGroupScores,
            analyticalDensityValue,
            {
                key: 'FINAL_SCORE',
                label: 'Final Score',
                score: Math.round(((
                    sum(
                        scoreGroupScores.map((item) => item.score),
                    ) + analyticalDensityValue.score) / 5) * 100) / 100,
            },
        ];
    }, [
        scoreOptions,
        value.scoreRatings,
        value.scoreAnalyticalDensity,
    ]);

    const scoreStatsValueParams = useCallback(
        (_: string, data: ScoreStatsValue): KeyFigureProps => ({
            label: data.label,
            value: data.score,
        }), [],
    );

    if (loading || scorePending) {
        return (
            <Message pending={loading || scorePending} />
        );
    }

    return (
        <div className={styles.scoreForm}>
            <ListView
                className={styles.scores}
                data={scoreStatsValue}
                keySelector={keySelector}
                renderer={KeyFigure}
                rendererParams={scoreStatsValueParams}
                pending={false}
                filtered={false}
                errored={false}
            />
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
                variant="primary"
            >
                <TabList className={styles.list}>
                    <Tab
                        name="qualityScores"
                        className={_cs(
                            styles.tab,
                            error?.scoreRatings && styles.error,
                        )}
                    >
                        Quality Scores
                    </Tab>
                    <Tab
                        name="analyticalDensity"
                        className={_cs(
                            styles.tab,
                            error?.scoreAnalyticalDensity && styles.error,
                        )}
                    >
                        Analytical Density
                    </Tab>
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
