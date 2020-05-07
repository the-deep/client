import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
    isDefined,
    listToMap,
    caseInsensitiveSubmatch,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import Question from '#qbc/Question';
import Checkbox from '#rsu/../v2/Input/Checkbox';
import Icon from '#rscg/Icon';
import SortableListView from '#rscv/SortableListView';

import {
    QuestionnaireQuestionElement,
    MiniFrameworkElement,
    BaseQuestionElement,
    BulkActionId,
} from '#typings';

import { getMatrix2dStructures } from '#utils/framework';
import { getQuestionAttributeTitle } from '#entities/questionnaire';

import styles from './styles.scss';

const questionKeySelector = (q: BaseQuestionElement) => q.id;

interface Selection {
    [key: number]: boolean;
}

interface QuestionListProps {
    title: string;
    className?: string;
    questions?: BaseQuestionElement[];
    questionClassName?: string;
    showLoadingOverlay?: boolean;
    onOrderChange?: (questions: QuestionnaireQuestionElement[]) => void;
    onAdd?: () => void;
    onEdit?: (key: BaseQuestionElement['id']) => void;
    onAddButtonClick?: (key: BaseQuestionElement['id']) => void;
    onClone?: (key: BaseQuestionElement['id']) => void;
    onCopyFromDrop?: (key: BaseQuestionElement['id'], order: number) => void;
    onDelete?: (key: BaseQuestionElement['id']) => void;
    onArchive?: (key: BaseQuestionElement['id']) => void;
    onUnarchive?: (key: BaseQuestionElement['id']) => void;
    onBulkDelete?: (questionIds: BulkActionId[]) => void;
    onBulkArchive?: (questionIds: BulkActionId[]) => void;
    onBulkUnArchive?: (questionIds: BulkActionId[]) => void;
    framework?: MiniFrameworkElement;
    archived: boolean;
    filtered?: boolean;
    searchValue?: string;
}

const renderDragHandle = () => (
    <Icon
        className={styles.dragHandle}
        name="hamburger"
    />
);

const QuestionList = (props: QuestionListProps) => {
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
        filtered,
        questionClassName,
        searchValue,
    } = props;

    const [selectedQuestions, setSelectedQuestions] = useState<Selection>({});
    const [expandedQuestions, setExpandedQuestions] = useState<Selection>({});

    const handleQuestionSelectChange = useCallback(
        (key: BaseQuestionElement['id'], value: boolean) => {
            setSelectedQuestions(selection => ({
                ...selection,
                [key]: value,
            }));
        },
        [],
    );

    const handleQuestionExpandChange = useCallback(
        (key: BaseQuestionElement['id'], value: boolean) => {
            setExpandedQuestions(selection => ({
                ...selection,
                [key]: value,
            }));
        },
        [],
    );

    const getQuestionRendererParams = useCallback(
        (key: BaseQuestionElement['id'], question: BaseQuestionElement) => ({
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
        () => {
            if (!flatQuestions) {
                return [];
            }
            return flatQuestions.filter((question) => {
                const searchFilter = caseInsensitiveSubmatch(question.title, searchValue)
                || caseInsensitiveSubmatch(question.dataCollectionTechniqueDisplay, searchValue)
                || caseInsensitiveSubmatch(question.enumeratorSkillDisplay, searchValue)
                || caseInsensitiveSubmatch(question.respondentInstruction, searchValue)
                || caseInsensitiveSubmatch(question.attributeTitle, searchValue)
                || caseInsensitiveSubmatch(
                    question.crisisTypeDetail && question.crisisTypeDetail.title,
                    searchValue,
                )
                || caseInsensitiveSubmatch(question.enumeratorInstruction, searchValue);

                return !!question.isArchived === archived && searchFilter;
            });
        },
        [archived, flatQuestions, searchValue],
    );

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
        (orderedQuestions: QuestionnaireQuestionElement[]) => {
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

    return (
        <div className={_cs(styles.questionList, className)}>
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
            <SortableListView
                className={styles.content}
                rendererParams={getQuestionRendererParams}
                renderer={Question}
                data={filteredQuestions}
                keySelector={questionKeySelector}
                pending={showLoadingOverlay}
                filtered={filtered}
                onChange={handleOrderChange}
                dragHandleModifier={renderDragHandle}
                itemClassName={styles.questionContainer}
                disabled={!onOrderChange}
                showDragHandle={isDefined(onOrderChange)}
            />
        </div>
    );
};

export default QuestionList;
