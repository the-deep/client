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
    mapToList,
    mapToMap,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
    Error,
} from '@togglecorp/toggle-form';
import BooleanInput from '#components/selections/BooleanInput';
import {
    CnaQuestionsQuery,
    CnaQuestionsQueryVariables,
} from '#generated/types';

import styles from './styles.css';
import { PartialFormType } from '../formSchema';

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
    error: Error<PartialFormType>;
}

interface BooleanOption {
    key: 'true' | 'false';
    value: string;
}

const answerOptions: BooleanOption[] = [
    { key: 'true', value: 'Yes' },
    { key: 'false', value: 'No' },
];

function CnaForm(props: Props) {
    const {
        projectId,
        value,
        setFieldValue,
        error,
    } = props;

    const [answer, setAnswer] = React.useState<boolean>();

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

    const cnaQuestions = useMemo(() => {
        const sectorList = listToGroupList(
            cnaResponse?.project?.assessmentRegistryOptions?.cnaQuestions,
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
                (v, k) => ({
                    subSector: k,
                    questions: v,
                }),
            ),
        }));

        return finalList;
    }, [cnaResponse]);

    return (
        <div className={styles.cnaForm}>
            {cnaQuestions?.map((cna) => (
                <div className={styles.sectorWrapper}>
                    <div className={styles.sectorHeading}>
                        {cna.sector}
                    </div>
                    {cna.subSector.map((subSector) => (
                        <div className={styles.subSectorWrapper}>
                            <div className={styles.subSectorHeading}>
                                {subSector.subSector}
                            </div>
                            {subSector.questions.map((question) => (
                                <div className={styles.question}>
                                    <BooleanInput
                                        name="answer"
                                        type="segment"
                                        options={answerOptions}
                                        onChange={setAnswer}
                                        value={answer}
                                        spacing="compact"
                                    />
                                    <div>
                                        {question.question}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default CnaForm;
