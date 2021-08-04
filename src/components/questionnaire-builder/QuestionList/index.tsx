import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
    listToMap,
    isTruthyString,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import Question from '#qbc/Question';
import Checkbox from '#rsu/../v2/Input/Checkbox';
import Icon from '#rscg/Icon';
import SortableListView from '#rscv/SortableListView';

import {
    MiniFrameworkElement,
    BaseQuestionElement,
    BulkActionId,
} from '#types';

import { getMatrix2dStructures } from '#utils/framework';
import { getQuestionAttributeTitle, getFilteredQuestions } from '#entities/questionnaire';

import styles from './styles.scss';

const questionKeySelector = (q: BaseQuestionElement) => q.id;

const renderDragHandle = () => (
    <Icon
        className={styles.dragHandle}
        name="hamburger"
    />
);

interface Selection {
    [key: number]: boolean;
}

export interface QuestionListProps<T extends BaseQuestionElement>{
    title: string;
    className?: string;
    questions?: T[];
    questionClassName?: string;
    showLoadingOverlay?: boolean;
    onOrderChange?: (questions: T[]) => void;
    onAdd?: () => void;
    onEdit?: (key: T['id']) => void;
    onAddButtonClick?: (key: T['id']) => void;
    onClone?: (question: T) => void;
    onCopyFromDrop?: (data: T, dropKey: T['id']) => void;
    onDelete?: (key: T['id']) => void;
    onArchive?: (key: T['id']) => void;
    onUnarchive?: (key: T['id']) => void;
    onBulkDelete?: (questionIds: BulkActionId[]) => void;
    onBulkArchive?: (questionIds: BulkActionId[]) => void;
    onBulkUnArchive?: (questionIds: BulkActionId[]) => void;
    framework?: MiniFrameworkElement;
    headerRightComponent?: React.ReactNode;
    archived: boolean;
    isFiltered?: boolean;
    searchValue?: string;
}

function QuestionList<T extends BaseQuestionElement>(props: QuestionListProps<T>) {
    const {
        className,
        title,
        showLoadingOverlay,
        questions,
        framework,
        onAdd, // this.handleAddQuestionButtonClick
        onEdit, // this.handleEditQuestionButtonClick,
        onDelete, // this.handleDeleteQuestion,
        onArchive, // this.handleArchiveQuestion,
        onUnarchive, // this.handleUnarchiveQuestion,
        onClone,
        onCopyFromDrop,
        onAddButtonClick,
        onBulkDelete,
        onBulkArchive,
        onBulkUnArchive,
        onOrderChange,
        archived,
        isFiltered,
        questionClassName,
        searchValue,
        headerRightComponent,
    } = props;

    const [selectedQuestions, setSelectedQuestions] = useState<Selection>({});
    const [expandedQuestions, setExpandedQuestions] = useState<Selection>({});

    const handleQuestionSelectChange = useCallback(
        (key: T['id'], value: boolean) => {
            setSelectedQuestions(selection => ({
                ...selection,
                [key]: value,
            }));
        },
        [],
    );

    const handleQuestionExpandChange = useCallback(
        (key: T['id'], value: boolean) => {
            setExpandedQuestions(selection => ({
                ...selection,
                [key]: value,
            }));
        },
        [],
    );

    const getQuestionRendererParams = useCallback(
        (key: T['id'], question: T) => ({
            data: question,
            onEditButtonClick: onEdit,
            onClone,
            onCopyFromDrop,
            onAddButtonClick,
            onDelete,
            onArchive,
            onUnarchive,
            framework,
            showCheckbox: true,
            selected: !!selectedQuestions[key],
            onSelectChange: handleQuestionSelectChange,
            expanded: !!expandedQuestions[key],
            onExpandChange: handleQuestionExpandChange,
            className: _cs(styles.question, questionClassName),
            disabled: showLoadingOverlay,
            searchValue,
        }),
        [
            framework, onEdit, onDelete, onCopyFromDrop,
            onClone, onArchive, onUnarchive, onAddButtonClick, showLoadingOverlay,
            selectedQuestions, handleQuestionSelectChange, questionClassName,
            expandedQuestions, handleQuestionExpandChange, searchValue,
        ],
    );

    const frameworkOptions = useMemo(() => (
        getMatrix2dStructures(framework)
    ), [framework]);

    const flatQuestions = useMemo(() => {
        if (!questions) {
            return [];
        }
        const {
            sectorList,
            subsectorList,
            dimensionList,
            subdimensionList,
        } = frameworkOptions;

        return questions.map(question => ({
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
    }, [frameworkOptions, questions]);

    const filteredQuestions = useMemo(
        () => getFilteredQuestions(
            flatQuestions,
            undefined,
            searchValue,
            archived,
        ),
        [archived, flatQuestions, searchValue],
    );

    // FIXME: only used in onChange, should move it there
    const percolateQuestions = useMemo(
        () => {
            if (!questions) {
                return [];
            }
            return questions.filter(question => !!question.isArchived !== archived);
        },
        [archived, questions],
    );

    const handleSelectAllCheckboxClick = useCallback(
        (value: boolean) => {
            if (!value) {
                setSelectedQuestions({});
            } else {
                const newValues = listToMap(filteredQuestions, q => q.id, () => true);
                setSelectedQuestions(newValues);
            }
        },
        [filteredQuestions],
    );

    const isAllExpanded = filteredQuestions
        && filteredQuestions.every(q => expandedQuestions[q.id]);

    const handleExpandAllButtonClick = useCallback(
        () => {
            if (isAllExpanded) {
                setExpandedQuestions({});
            } else {
                const newValues = listToMap(filteredQuestions, q => q.id, () => true);
                setExpandedQuestions(newValues);
            }
        },
        [filteredQuestions, isAllExpanded],
    );

    const handleBulkDelete = useCallback(
        () => {
            const questionIds = filteredQuestions
                ? filteredQuestions
                    .filter(q => selectedQuestions[q.id])
                    .map(q => ({ id: q.id }))
                : [];

            if (onBulkDelete) {
                onBulkDelete(questionIds);
            }
        },
        [filteredQuestions, selectedQuestions, onBulkDelete],
    );

    const handleBulkArchive = useCallback(
        () => {
            const questionIds = filteredQuestions
                ? filteredQuestions
                    .filter(q => selectedQuestions[q.id])
                    .map(q => ({ id: q.id }))
                : [];

            if (onBulkArchive) {
                onBulkArchive(questionIds);
            }
        },
        [filteredQuestions, selectedQuestions, onBulkArchive],
    );

    const handleBulkUnArchive = useCallback(
        () => {
            const questionIds = filteredQuestions
                ? filteredQuestions
                    .filter(q => selectedQuestions[q.id])
                    .map(q => ({ id: q.id }))
                : [];

            if (onBulkUnArchive) {
                onBulkUnArchive(questionIds);
            }
        },
        [filteredQuestions, selectedQuestions, onBulkUnArchive],
    );

    const handleOrderChange = useCallback(
        (orderedQuestions: T[]) => {
            if (onOrderChange) {
                onOrderChange([
                    ...orderedQuestions,
                    ...percolateQuestions,
                ]);
            }
        },
        [onOrderChange, percolateQuestions],
    );

    const isAllSelected = filteredQuestions
        && filteredQuestions.every(q => selectedQuestions[q.id]);

    const isSomeSelected = filteredQuestions
        && filteredQuestions.some(q => selectedQuestions[q.id]);

    const disableSort = !onOrderChange || isTruthyString(searchValue);

    return (
        <div className={_cs(styles.questionList, className)}>
            <div className={styles.headerContainer}>
                <header className={styles.header}>
                    <Checkbox
                        className={styles.checkbox}
                        value={isAllSelected && filteredQuestions && filteredQuestions.length > 0}
                        indeterminate={isSomeSelected}
                        checkIconClassName={styles.checkIcon}
                        onChange={handleSelectAllCheckboxClick}
                        disabled={showLoadingOverlay}
                    />
                    <h2 className={styles.heading}>
                        {title}
                    </h2>
                    <div className={styles.actions}>
                        {headerRightComponent}
                        <Button
                            className={styles.button}
                            onClick={handleExpandAllButtonClick}
                            iconName={isAllExpanded ? 'contractContent' : 'expandContent'}
                            disabled={showLoadingOverlay}
                        />
                        { (!isSomeSelected && onAdd) &&
                            <Button
                                iconName="add"
                                className={styles.button}
                                onClick={onAdd}
                                disabled={showLoadingOverlay}
                            >
                                {/* FIXME: use strings */}
                                Add
                            </Button>
                        }
                        { (isSomeSelected && onBulkArchive) && (
                            <Button
                                iconName="archive"
                                onClick={handleBulkArchive}
                                className={styles.button}
                                disabled={showLoadingOverlay}
                            >
                                Send to Parking Lot
                            </Button>
                        )}
                        { (isSomeSelected && onBulkDelete) && (
                            <Button
                                iconName="delete"
                                onClick={handleBulkDelete}
                                className={styles.button}
                                disabled={showLoadingOverlay}
                            >
                                Delete
                            </Button>
                        )}
                        { (isSomeSelected && onBulkUnArchive) && (
                            <Button
                                onClick={handleBulkUnArchive}
                                iconName="unarchive"
                                className={styles.button}
                                disabled={showLoadingOverlay}
                            >
                                Recover from Parking Lot
                            </Button>
                        )}
                    </div>
                </header>
            </div>
            <SortableListView
                className={styles.content}
                rendererParams={getQuestionRendererParams}
                renderer={Question}
                data={filteredQuestions}
                keySelector={questionKeySelector}
                pending={showLoadingOverlay}
                isFiltered={isFiltered}
                onChange={handleOrderChange}
                dragHandleModifier={renderDragHandle}
                itemClassName={styles.questionContainer}
                disabled={disableSort}
                showDragHandle={!disableSort}
            />
        </div>
    );
}

export default QuestionList;
