import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import Question from '#qbc/Question';
import Checkbox from '#rsu/../v2/Input/Checkbox';
import ListView from '#rsu/../v2/View/ListView';

import {
    QuestionnaireQuestionElement,
    MiniFrameworkElement,
    BaseQuestionElement,
    BulkActionId,
} from '#typings';

import styles from './styles.scss';

const questionKeySelector = (q: BaseQuestionElement) => q.id;

interface Selection {
    [key: number]: boolean;
}

interface QuestionListProps {
    title: string;
    className?: string;
    questions?: QuestionnaireQuestionElement[];
    showLoadingOverlay?: boolean;
    onAdd?: () => void;
    onEdit?: (key: BaseQuestionElement['id']) => void;
    onDelete?: (key: BaseQuestionElement['id']) => void;
    onArchive?: (key: BaseQuestionElement['id']) => void;
    onUnarchive?: (key: BaseQuestionElement['id']) => void;
    onBulkDelete?: (questionIds: BulkActionId[]) => void;
    onBulkArchive?: (questionIds: BulkActionId[]) => void;
    onBulkUnArchive?: (questionIds: BulkActionId[]) => void;
    framework?: MiniFrameworkElement;
    archived: boolean;
}

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
        onBulkDelete,
        onBulkArchive,
        onBulkUnArchive,
        archived,
    } = props;

    const [selectedQuestions, setSelectedQuestions] = useState<Selection>({});
    const [expandedQuestions, setExpandedQuestions] = useState<Selection>({});

    const handleQuestionSelectChange = useCallback(
        (key: QuestionnaireQuestionElement['id'], value: boolean) => {
            setSelectedQuestions(selection => ({
                ...selection,
                [key]: value,
            }));
        },
        [],
    );

    const handleQuestionExpandChange = useCallback(
        (key: QuestionnaireQuestionElement['id'], value: boolean) => {
            setExpandedQuestions(selection => ({
                ...selection,
                [key]: value,
            }));
        },
        [],
    );

    const getQuestionRendererParams = useCallback(
        (key: QuestionnaireQuestionElement['id'], question: QuestionnaireQuestionElement) => ({
            data: question,
            onEditButtonClick: onEdit,
            onDelete,
            onArchive,
            onUnarchive,
            framework,
            showCheckbox: true,
            selected: !!selectedQuestions[key],
            onSelectChange: handleQuestionSelectChange,
            expanded: !!expandedQuestions[key],
            onExpandChange: handleQuestionExpandChange,
            className: styles.question,
        }),
        [
            framework, onEdit, onDelete, onArchive, onUnarchive,
            selectedQuestions, handleQuestionSelectChange,
            expandedQuestions, handleQuestionExpandChange,
        ],
    );

    const filteredQuestions = useMemo(
        () => {
            if (!questions) {
                return undefined;
            }
            return questions.filter(question => !!question.isArchived === archived);
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
                    onChange={handleSelectAllCheckboxClick}
                />
                <h2 className={styles.heading}>
                    {title}
                </h2>
                <div className={styles.actions}>
                    <Button
                        className={styles.button}
                        onClick={handleExpandAllButtonClick}
                        iconName={isAllExpanded ? 'contractContent' : 'expandContent'}
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
            <ListView
                className={styles.content}
                rendererParams={getQuestionRendererParams}
                renderer={Question}
                data={filteredQuestions}
                keySelector={questionKeySelector}
                pending={showLoadingOverlay}
            />
        </div>
    );
};

export default QuestionList;
