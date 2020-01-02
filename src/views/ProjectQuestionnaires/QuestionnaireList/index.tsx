import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';

import {
    QuestionnaireElement,
} from '#typings';

import Questionnaire from './Questionnaire';
import styles from './styles.scss';

type ViewMode = 'active' | 'archived';

interface Props {
    className?: string;
    title: string;
    questionnaireList: QuestionnaireElement[];
}


const questionnaireKeySelector = (q: QuestionnaireElement) => q.id;

class QuestionnaireList extends React.PureComponent<Props> {
    private getQuestionnaireRendererParams = (
        key: QuestionnaireElement['id'],
        questionnaire: QuestionnaireElement,
    ) => ({
        questionnaireKey: key,
        data: questionnaire,
    })

    public render() {
        const {
            className,
            title,
            questionnaireList,
        } = this.props;

        return (
            <div className={_cs(className, styles.questionnaireList)}>
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        { title }
                    </h3>
                </header>
                <ListView
                    className={styles.content}
                    data={questionnaireList}
                    renderer={Questionnaire}
                    rendererParams={this.getQuestionnaireRendererParams}
                    keySelector={questionnaireKeySelector}
                />
            </div>
        );
    }
}

export default QuestionnaireList;
