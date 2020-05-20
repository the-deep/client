import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';

import Button from '#rsu/../v2/Action/Button';
import ListView from '#rsu/../v2/View/ListView';
import TreeInput from '#rsu/../v2/Input/TreeInput';
import SearchInput from '#rsci/SearchInput';

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

const questionKeySelector = (q: FrameworkQuestionElement) => q.id;

interface Props {
    className?: string;
    framework?: MiniFrameworkElement;
    treeFilter: string[];
    onTreeInputChange: (value: string[]) => void;
    onPaneClose: () => void;
    // FIXME: idk why FrameworkQuestionElement doesn't work here
    onCopy: (question: BaseQuestionElement) => void;
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
        framework,
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
                    Questions from Framework
                </h2>
                <Button
                    iconName="close"
                    onClick={onPaneClose}
                    transparent
                    title="Close"
                />
            </header>
            <div className={styles.content}>
                <div className={styles.selectionContainer}>
                    <SearchInput
                        value={searchValue}
                        className={styles.searchInput}
                        onChange={setSearchValue}
                        placeholder="Search questions"
                        showLabel={false}
                        showHintAndError={false}
                    />
                    <TreeInput
                        label="Matrices"
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
    );
}

export default AddFromFramework;
