import React from 'react';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsu/../v2/Action/Button';
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
    onPaneClose: () => void;
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
            onPaneClose,
        } = this.props;

        if (!framework) {
            return null;
        }

        return (
            <div className={_cs(styles.addFromFramework, className)}>
                <header className={styles.header}>
                    <h2 className={styles.heading}>
                        Add from Framework
                    </h2>
                    <Button
                        iconName="close"
                        onClick={onPaneClose}
                    >
                        Close
                    </Button>
                </header>
                <div className={styles.content}>
                    <div className={styles.selectionContainer}>
                        <h4> Matrices </h4>
                        <TreeInput
                            className={styles.matrixFilter}
                            keySelector={treeItemKeySelector}
                            parentKeySelector={treeItemParentKeySelector}
                            labelSelector={treeItemLabelSelector}
                            onChange={onTreeInputChange}
                            value={treeFilter}
                            options={this.getFrameworkMatrices(framework, framework.questions)}
                            defaultCollapseLevel={2}
                        />
                    </div>
                    <div className={styles.questionsContainer}>
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
                </div>
            </div>
        );
    }
}

export default AddFromFramework;
