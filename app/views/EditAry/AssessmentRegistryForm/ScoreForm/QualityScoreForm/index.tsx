import React,
{
    useCallback,
    useMemo,
} from 'react';
import { ListView } from '@the-deep/deep-ui';
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
import { GetQualityScoreListQuery } from '#generated/types';

import ScoreHeading,
{
    Props as ScoreHeadingProps,
} from './ScoreHeading';
import QualityScoreInput,
{
    Props as QualityScoreInputProps,
} from './QualityScoreInput';

import {
    PartialFormType,
    ScoreRatingsType,
} from '../../formSchema';

import styles from './styles.css';

type ScoreOptions = NonNullable<NonNullable<NonNullable<GetQualityScoreListQuery>['project']>['assessmentRegistryOptions']>['scoreOptions'][number]

const keySelector = (d: ScoreOptions) => d.scoreCriteria;
const groupKeySelector = (g: ScoreOptions) => g.analyticalStatementDisplay;

interface Props {
    value: PartialFormType,
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
    scoreOptions: ScoreOptions[] | undefined;
}

function QualityScoreForm(props: Props) {
    const {
        value,
        setFieldValue,
        error: riskyError,
        scoreOptions,
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
    const scoreValueIndex = useMemo(() => listToMap(
        scoreValue,
        (k) => k.scoreType ?? '',
        (_, __, index) => index,
    ), [scoreValue]);
    const scoreInputParams = useCallback(
        (_: string, data: ScoreOptions): QualityScoreInputProps => {
            const scoreIndex = scoreValueIndex?.[data.scoreCriteria];
            const scoreRatingValue = isDefined(scoreIndex)
                ? scoreValue?.[scoreIndex]
                : undefined;
            const selectedClientId = isDefined(scoreIndex)
                ? scoreValue?.[scoreIndex].clientId : undefined;
            const scoreItemError = isDefined(selectedClientId)
                ? scoreError?.[selectedClientId]
                : undefined;
            return {
                scoreType: data.scoreCriteria,
                scoreCriteria: data.scoreCriteriaDisplay,
                error: scoreItemError,
                name: scoreIndex,
                value: scoreRatingValue,
                onChange: setScoreRating,
            };
        },
        [
            setScoreRating,
            scoreValue,
            scoreError,
            scoreValueIndex,
        ],
    );

    const groupScoreInputParams = useCallback(
        (key: string): Omit<ScoreHeadingProps, 'children' | 'className'> => ({
            analyticalState: key,
        }),
        [],
    );

    return (
        <ListView
            className={styles.qualityScoreForm}
            data={scoreOptions}
            keySelector={keySelector}
            renderer={QualityScoreInput}
            rendererParams={scoreInputParams}
            grouped
            groupRenderer={ScoreHeading}
            groupRendererParams={groupScoreInputParams}
            groupKeySelector={groupKeySelector}
            pending={false}
            filtered={false}
            errored={false}
        />
    );
}

export default QualityScoreForm;
