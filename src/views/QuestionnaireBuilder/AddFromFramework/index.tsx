import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';

import Button from '#rsu/../v2/Action/Button';
import ListView from '#rsu/../v2/View/ListView';
import TreeInput from '#rsu/../v2/Input/TreeInput';
import TextInput from '#rsci/TextInput';

import {
    FrameworkQuestionElement,
    BaseQuestionElement,

    MiniFrameworkElement,
} from '#typings';

import {
    getFrameworkMatrices,
    getFilteredQuestions,
    getQuestionAttributeTitle,

    treeItemKeySelector,
    treeItemLabelSelector,
    treeItemParentKeySelector,
} from '#entities/questionnaire';
import { getMatrix2dStructures } from '#utils/framework';

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

function AddFromFramework(props: Props) {
    const {
        framework,
        className,
        treeFilter,
        onTreeInputChange,
        onPaneClose,
        copyDisabled,
        onCopy,
    } = props;

    const [searchValue, setSearchValue] = useState('');

    const getFrameworkQuestionRendererParams = useCallback((
        key: FrameworkQuestionElement['id'],
        question: FrameworkQuestionElement,
    ) => ({
        data: question,
        framework: framework as MiniFrameworkElement,
        className: styles.frameworkQuestion,
        onCopy,
        copyDisabled,
        expanded: false,
        readOnly: true,
        searchValue,
    }), [framework, onCopy, copyDisabled, searchValue]);

    const {
        frameworkMatrices,
        frameworkOptions,
    } = useMemo(() => {
        if (!framework) {
            return {
                frameworkMatrices: undefined,
                frameworkOptions: undefined,
            };
        }
        return {
            frameworkMatrices: getFrameworkMatrices(framework, framework.questions),
            frameworkOptions: getMatrix2dStructures(framework),
        };
    }, [framework]);

    const flatQuestions = useMemo(() => {
        if (!framework || !framework.questions) {
            return [];
        }

        if (!frameworkOptions) {
            return framework.questions;
        }

        const {
            sectorList,
            subsectorList,
            dimensionList,
            subdimensionList,
        } = frameworkOptions;

        return framework.questions.map(question => ({
            ...question,
            attributeTitle: question.frameworkAttribute && getQuestionAttributeTitle(
                question.frameworkAttribute.type,
                question.frameworkAttribute.value,
                sectorList,
                subsectorList,
                dimensionList,
                subdimensionList,
            ),
        }));
    }, [frameworkOptions, framework]);

    const filteredQuestions = useMemo(() => (
        getFilteredQuestions(
            flatQuestions,
            treeFilter,
            searchValue,
        )
    ), [flatQuestions, treeFilter, searchValue]);

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
                    <TextInput
                        value={searchValue}
                        className={styles.searchInput}
                        onChange={setSearchValue}
                        placeholder="Type to search"
                        label="Search"
                        showHintAndError={false}
                    />
                    <h4> Matrices </h4>
                    <TreeInput
                        className={styles.matrixFilter}
                        keySelector={treeItemKeySelector}
                        parentKeySelector={treeItemParentKeySelector}
                        labelSelector={treeItemLabelSelector}
                        onChange={onTreeInputChange}
                        value={treeFilter}
                        options={frameworkMatrices}
                        defaultCollapseLevel={2}
                    />
                </div>
                <div className={styles.questionsContainer}>
                    <h4> Questions </h4>
                    <ListView
                        className={styles.frameworkQuestionList}
                        rendererParams={getFrameworkQuestionRendererParams}
                        renderer={Question}
                        data={filteredQuestions}
                        keySelector={questionKeySelector}
                        filtered={treeFilter.length > 0 || isTruthyString(searchValue)}
                    />
                </div>
            </div>
        </div>
    );
}

export default AddFromFramework;
