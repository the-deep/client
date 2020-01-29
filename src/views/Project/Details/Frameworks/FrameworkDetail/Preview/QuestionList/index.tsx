import React from 'react';

import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';

import {
    QuestionElement,
    FrameworkElement,
} from '#typings';
import Question from '#qbc/Question';

import styles from './styles.scss';

interface Props {
    className?: string;
    framework: FrameworkElement;
    readOnly?: boolean;
    hideDetails?: boolean;
}

const questionKeySelector = (d: QuestionElement) => d.id;

class QuestionList extends React.PureComponent<Props> {
    private getQuestionRendererParams = (key: QuestionElement['id'], question: QuestionElement) => {
        const {
            framework,
            readOnly,
            hideDetails,
        } = this.props;

        return {
            data: question,
            framework,
            className: styles.question,
            readOnly,
            hideDetails,
        };
    }

    public render() {
        const {
            className,
            framework,
        } = this.props;

        return (
            <ListView
                className={_cs(styles.content, className)}
                data={framework.questions}
                keySelector={questionKeySelector}
                renderer={Question}
                rendererParams={this.getQuestionRendererParams}
            />
        );
    }
}

export default QuestionList;
