import React from 'react';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rsu/../v2/View/ListView';
import TreeInput from '#rsu/../v2/Input/TreeInput';

import {
    FrameworkQuestionElement,
    BaseQuestionElement,

    MiniFrameworkElement,
} from '#typings';

import {
    getFrameworkMatrices,
    getFilteredQuestions,

    treeItemKeySelector,
    treeItemLabelSelector,
    treeItemParentKeySelector,
} from '#entities/questionnaire';

import Question from '#qbc/Question';

import styles from './styles.scss';

const questionKeySelector = (q: BaseQuestionElement) => q.id;

interface Props {
    className?: string;
    framework?: MiniFrameworkElement;
    treeFilter: string[];
    onTreeInputChange: (value: string[]) => void;
    onCopy: (questionId: BaseQuestionElement['id']) => void;
    copyDisabled: boolean;
}

class AddFromFramework extends React.PureComponent<Props> {
    private getFrameworkMatrices = memoize(getFrameworkMatrices)

    private getFilteredQuestions = memoize(getFilteredQuestions)

    private getFrameworkQuestionRendererParams = (
        key: FrameworkQuestionElement['id'],
        question: FrameworkQuestionElement,
    ) => {
        const {
            framework,
            copyDisabled,
            onCopy,
        } = this.props;

        return {
            data: question,
            framework: framework as MiniFrameworkElement,
            className: styles.frameworkQuestion,
            onCopy,
            copyDisabled,
            expanded: false,
            readOnly: true,
        };
    }

    render() {
        const {
            framework,
            className,
            treeFilter,
            onTreeInputChange,
        } = this.props;

        if (!framework) {
            return null;
        }

        return (
            <div className={_cs(styles.content, className)}>
                <h3> Add from Framework </h3>
                <h4> Matrices </h4>
                <TreeInput
                    className={styles.matrixFilter}
                    keySelector={treeItemKeySelector}
                    parentKeySelector={treeItemParentKeySelector}
                    labelSelector={treeItemLabelSelector}
                    onChange={onTreeInputChange}
                    value={treeFilter}
                    options={this.getFrameworkMatrices(framework)}
                    defaultCollapseLevel={0}
                />
                <h4> Questions </h4>
                <ListView
                    className={styles.frameworkQuestionList}
                    rendererParams={this.getFrameworkQuestionRendererParams}
                    renderer={Question}
                    data={
                        this.getFilteredQuestions(
                            framework.questions,
                            treeFilter,
                        )
                    }
                    keySelector={questionKeySelector}
                    filtered={treeFilter.length > 0}
                />
            </div>
        );
    }
}

export default AddFromFramework;
