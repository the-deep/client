import React,
{
    useMemo,
} from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    listToGroupList,
    listToMap,
    mapToList,
    mapToMap,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import { NumberOutput } from '@the-deep/deep-ui';
import {
    CnaQuestionsQuery,
    CnaQuestionsQueryVariables,
} from '#generated/types';
import {
    CnaType,
    PartialFormType,
} from '../formSchema';
import AnswerQuestionInput from './AnswerQuestionInput';

import styles from './styles.css';

const CNA_QUESTIONS = gql`
    query CnaQuestions (
        $projectId: ID!
    ) {
        project(id: $projectId) {
            assessmentRegistryOptions {
                cnaQuestions {
                    id
                    question
                    sectorDisplay
                    subSectorDisplay
                    sector
                    subSector
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

function CnaForm(props: Props) {
    const {
        projectId,
        value,
        setFieldValue,
        error: riskyError,
    } = props;

    const {
        setValue: setAnswerValue,
    } = useFormArray<
        'cna',
        CnaType
    >('cna', setFieldValue);

    const {
        data: cnaResponse,
    } = useQuery<CnaQuestionsQuery, CnaQuestionsQueryVariables>(
        CNA_QUESTIONS,
        {
            variables: {
                projectId,
            },
        },
    );
    const error = getErrorObject(
        riskyError,
    );

    const cnaError = getErrorObject(error?.cna);
    const responseCna = cnaResponse?.project?.assessmentRegistryOptions?.cnaQuestions;
    const cnaValue = value.cna;

    const cnaQuestions = useMemo(() => {
        const sectorList = listToGroupList(
            responseCna,
            (cna) => cna?.sectorDisplay ?? '',
        );
        const subSectorList = mapToMap(
            sectorList,
            (d) => d,
            (k) => listToGroupList(
                k,
                (d) => (d.subSectorDisplay ?? ''),
            ),
        );
        const finalList = mapToList(subSectorList, (d, key) => ({
            sector: key,
            subSector: mapToList(
                d,
                (questions, subSector) => ({
                    subSector,
                    questions,
                }),
            ),
        }));

        return finalList;
    }, [responseCna]);

    const answerMapIndex = listToMap(
        cnaValue,
        (k) => k.question,
        (_, __, index) => index,
    ) ?? {};

    const questionPercentage = useMemo(() => {
        const sectorQuestions = listToGroupList(
            responseCna,
            (val) => val.sectorDisplay ?? '',
            (element) => {
                const answer = cnaValue?.find((ans) => ans.question === element.id);
                return {
                    id: element.id,
                    name: element.sectorDisplay,
                    answer: answer?.answer,
                };
            },
        );

        const finalList = mapToList(
            sectorQuestions,
            (questions, key) => ({
                sector: key,
                questions,
                percentage: ((questions.filter(
                    (question) => question.answer,
                ).length) / questions.length) * 100,
            }),
        );
        return finalList;
    }, [responseCna, cnaValue]);

    return (
        <div className={styles.cnaForm}>
            <div className={styles.sectorStats}>
                {questionPercentage?.map((question) => (
                    <div
                        key={question.sector}
                        className={styles.sectorStatsContent}
                    >
                        <NumberOutput
                            value={question.percentage}
                            precision={1}
                            suffix="%"
                        />
                        <div className={styles.sectorLabel}>
                            {question.sector}
                        </div>
                    </div>
                ))}
            </div>
            {cnaQuestions?.map((cna) => (
                <div
                    key={cna.sector}
                    className={styles.sectorWrapper}
                >
                    <div className={styles.sectorHeading}>
                        {cna.sector}
                    </div>
                    {cna.subSector.map((subSector) => (
                        <div
                            key={subSector.subSector}
                            className={styles.subSectorWrapper}
                        >
                            <div className={styles.subSectorHeading}>
                                {subSector.subSector}
                            </div>
                            {subSector.questions.map((question) => {
                                const answerIndex = answerMapIndex[question.id];
                                const answerValue = cnaValue?.[answerIndex];
                                return (
                                    <AnswerQuestionInput
                                        key={question.id}
                                        question={question.question}
                                        onChange={setAnswerValue}
                                        value={answerValue}
                                        name={answerIndex !== -1 ? answerIndex : undefined}
                                        error={cnaError?.[answerIndex]}
                                        questionId={question.id}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default CnaForm;
