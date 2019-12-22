import React from 'react';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';

import {
    AppState,
    QuestionnaireItem,
} from '#typings';
import {
    questionnaireListSelector,
} from '#redux';


import Questionnaire from './Questionnaire';
import styles from './styles.scss';

interface PropsFromAppState {
    questionnaireList: QuestionnaireItem[];
}

interface OwnProps {
    className?: string;
    title: string;
}

type Props = PropsFromAppState & OwnProps;

const mapStateToProps = (state: AppState) => ({
    questionnaireList: questionnaireListSelector(state),
});

const questionnaireKeySelector = (q: QuestionnaireItem) => q.id;

class QuestionnaireList extends React.PureComponent<Props> {
    getQuestionnaireRendererParams = (
        key: QuestionnaireItem['id'],
        questionnaire: QuestionnaireItem,
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

export default connect(mapStateToProps)(
    QuestionnaireList,
);
