import React from 'react';
import { Heading } from '@the-deep/deep-ui';
import {
    listToMap,
    isDefined,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import {
    AssessmentRegistryScoreAnalyticalStatementTypeEnum,
    AssessmentRegistryScoreCriteriaTypeEnum,
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
    value: PartialFormType,
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>
    scoreList: {
        analyticalState: string;
        list: {
            scoreCriteriaDisplay: string;
            scoreCriteria: AssessmentRegistryScoreCriteriaTypeEnum;
            analyticalStatementDisplay: string;
            analyticalStatement: AssessmentRegistryScoreAnalyticalStatementTypeEnum;
        }[];
    }[] | undefined
}

function QualityScoreForm(props: Props) {
    const {
        value,
        setFieldValue,
        error: riskyError,
        scoreList,
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
