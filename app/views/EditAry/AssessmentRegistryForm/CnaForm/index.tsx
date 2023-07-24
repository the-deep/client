import React from 'react';
import { gql, useQuery } from '@apollo/client';
import BooleanInput from '#components/selections/BooleanInput';

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
    } = props;

    const [answer, setAnswer] = React.useState<boolean>();

    const {
        data: cnaResponse,
    } = useQuery(
        CNA_QUESTIONS,
        {
            variables: {
                projectId,
            },
        },
    );

    console.log('CNA', cnaResponse);

    return (
        <div className={styles.cnaForm}>
            <div className={styles.sectorWrapper}>
                <div className={styles.sectorHeading}>
                    Sector
                </div>
                <div className={styles.subSectorWrapper}>
                    <div className={styles.subSectorHeading}>
                        Sub Sector
                    </div>
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
                            This is the text output for test cna question
                        </div>
                    </div>
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
                            This is the text output for test cna question 2
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.sectorWrapper}>
                <div className={styles.sectorHeading}>
                    Sector 2
                </div>
                <div className={styles.subSectorWrapper}>
                    <div className={styles.subSectorHeading}>
                        Sub Sector 2
                    </div>
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
                            This is the text output for sub sector 2 test cna question
                        </div>
                    </div>
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
                            This is the text output for sub sector 2 test cna question 2
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CnaForm;
