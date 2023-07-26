import React from 'react';
import {
    Error,
    SetValueArg,
    getErrorObject,
    useFormObject,
} from '@togglecorp/toggle-form';
import BooleanInput from '#components/selections/BooleanInput';
import { CnaType } from '../../formSchema';

import styles from './styles.css';

interface BooleanOption {
    key: 'true' | 'false';
    value: string;
}

const answerOptions: BooleanOption[] = [
    { key: 'true', value: 'Yes' },
    { key: 'false', value: 'No' },
];

interface Props {
    questionId: string;
    question: string;
    value: CnaType | undefined;
    name: number | undefined;
    onChange: (value: SetValueArg<CnaType>, name: number | undefined) => void;
    error: Error<CnaType>
}

function AnswerQuestionInput(props: Props) {
    const {
        question,
        value,
        name,
        onChange,
        error: riskyError,
        questionId,
    } = props;

    const onAnswerChange = useFormObject(name, onChange, { question: questionId });
    const error = getErrorObject(riskyError);
    return (
        <div className={styles.question}>
            <BooleanInput
                name="answer"
                type="segment"
                options={answerOptions}
                onChange={onAnswerChange}
                value={value?.answer}
                spacing="compact"
                error={error?.answer}
            />
            <div>
                {question}
            </div>
        </div>
    );
}

export default AnswerQuestionInput;
