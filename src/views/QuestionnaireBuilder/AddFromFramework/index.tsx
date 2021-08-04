import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
    listToMap,
    isTruthyString,
} from '@togglecorp/fujs';

import Button from '#rsu/../v2/Action/Button';
import ListView from '#rsu/../v2/View/ListView';
import TreeInput from '#rsu/../v2/Input/TreeInput';
import SearchInput from '#rsci/SearchInput';
import DropdownMenu from '#rsca/DropdownMenu';
import Badge from '#components/viewer/Badge';

import {
    FrameworkQuestionElement,
    BaseQuestionElement,
    MiniFrameworkElement,
} from '#types';

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

const EmptyComponent = () => null;

const questionKeySelector = (q: FrameworkQuestionElement) => q.id;

const treeFilterValueKeySelector = (q: { key: string }) => q.key;

interface MatricesMap {
    [key: string]: string;
}

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
        frameworkMatricesMap,
    } = useMemo(() => {
        if (!framework) {
            return {
                frameworkMatrices: undefined,
                frameworkOptions: undefined,
                frameworkMatricesMap: undefined,
            };
        }
        const matrices = getFrameworkMatrices(framework, framework.questions);
        const matricesMap: MatricesMap = listToMap(matrices, d => d.key, d => d.title);
        return {
            frameworkMatrices: matrices,
            frameworkMatricesMap: matricesMap,
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

    const treeFilterValues = useMemo(() => {
        if (!frameworkMatricesMap) {
            return [];
        }

        return (
            treeFilter.map(v => ({
                key: v,
                value: frameworkMatricesMap[v],
            }))
        );
    }, [frameworkMatricesMap, treeFilter]);

    const getBadgesRendererParams = useCallback((
        key: string,
        data: { key: string; value: string },
    ) => ({
        className: styles.badge,
        title: data.value,
    }), []);

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
                    <div className={styles.filters}>
                        <SearchInput
                            value={searchValue}
                            className={styles.searchInput}
                            onChange={setSearchValue}
                            placeholder="Search questions"
                            showLabel={false}
                            showHintAndError={false}
                        />
                        <DropdownMenu
                            className={styles.matricesSelection}
                            title="Matrix Filters"
                        >
                            <TreeInput
                                className={styles.matrixFilter}
                                keySelector={treeItemKeySelector}
                                parentKeySelector={treeItemParentKeySelector}
                                labelSelector={treeItemLabelSelector}
                                onChange={onTreeInputChange}
                                value={treeFilter}
                                options={frameworkMatrices}
                                defaultCollapseLevel={2}
                                showLabel={false}
                                showHintAndError={false}
                            />
                        </DropdownMenu>
                    </div>
                    {treeFilterValues.length > 0 && (
                        <h5 className={styles.appliedFiltersLabel}>
                            Matrix filters applied:
                        </h5>
                    )}
                    <ListView
                        className={styles.appliedFilters}
                        rendererParams={getBadgesRendererParams}
                        renderer={Badge}
                        data={treeFilterValues}
                        keySelector={treeFilterValueKeySelector}
                        emptyComponent={EmptyComponent}
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
