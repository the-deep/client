import React, { useMemo } from 'react';
import { Heading } from '@the-deep/deep-ui';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    listToGroupList,
    listToMap,
    isDefined,
    mapToList,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import {
    GetQualityScoreListQuery,
    GetQualityScoreListQueryVariables,
} from '#generated/types';

import QualityScoreInput from './QualityScoreInput';
import {
    PartialFormType,
    ScoreRatingsType,
} from '../../formSchema';

import styles from './styles.css';

interface ScoreHeadingProps {
    analyticalState: string;
}

function ScoreHeading(props: ScoreHeadingProps) {
    const {
        analyticalState,
    } = props;

    return (
        <div className={styles.headingContent}>
            <Heading
                size="extraSmall"
                className={styles.scoreHeading}
            >
                {analyticalState}
            </Heading>
            <Heading
                size="extraSmall"
                className={styles.scoreHeading}
            >
                Score
            </Heading>
            <Heading
                size="extraSmall"
                className={styles.scoreHeading}
            >
                Justification
            </Heading>
        </div>
    );
}
interface Props {
    projectId: string;
    value: PartialFormType,
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>
}
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

function QualityScoreForm(props: Props) {
    const {
        projectId,
        value,
        setFieldValue,
        error: riskyError,
    } = props;

    const {
        setValue: setScoreRating,
    } = useFormArray<
        'scoreRatings',
        ScoreRatingsType
    >('scoreRatings', setFieldValue);

    const error = getErrorObject(
        riskyError,
    );

    const scoreValue = value.scoreRatings;
    const scoreError = getErrorObject(error?.scoreRatings);

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

    const scoreList = useMemo(() => {
        const scoreOptions = qualityScoreList?.project?.assessmentRegistryOptions?.scoreOptions;
        const analyticalList = listToGroupList(
            scoreOptions,
            (score) => score.analyticalStatementDisplay,
        );

        const finalAnalyticalList = mapToList(
            analyticalList,
            (list, key) => ({
                analyticalState: key,
                list,
            }),
        );
        return finalAnalyticalList;
    }, [qualityScoreList]);

    const scoreValueIndex = listToMap(
        scoreValue,
        (k) => k.scoreType ?? '',
        (_, __, index) => index,
    );

    return (
        <div className={styles.qualityScoreForm}>
            {scoreList?.map((score) => (
                <div
                    className={styles.qualityScoreContent}
                    key={score.analyticalState}
                >
                    <ScoreHeading
                        analyticalState={score.analyticalState}
                    />
                    {score.list.map((list) => {
                        const scoreIndex = scoreValueIndex?.[list.scoreCriteria];
                        const scoreRatingValue = isDefined(scoreIndex)
                            ? scoreValue?.[scoreIndex]
                            : undefined;
                        const scoreItemError = isDefined(scoreIndex)
                            ? scoreError?.[scoreIndex]
                            : undefined;
                        return (
                            <QualityScoreInput
                                key={list.scoreCriteria}
                                scoreType={list.scoreCriteria}
                                scoreCriteria={list.scoreCriteriaDisplay}
                                error={scoreItemError}
                                name={scoreIndex}
                                value={scoreRatingValue}
                                onChange={setScoreRating}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

export default QualityScoreForm;
