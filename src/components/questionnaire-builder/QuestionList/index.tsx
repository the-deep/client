import React, { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';
import Question from '#qbc/Question';
import ListView from '#rsu/../v2/View/ListView';

import {
    QuestionnaireQuestionElement,
    MiniFrameworkElement,
    BaseQuestionElement,
} from '#typings';

import styles from './styles.scss';

const questionKeySelector = (q: BaseQuestionElement) => q.id;

interface QuestionListProps {
    title: string;
    className?: string;
    questions?: QuestionnaireQuestionElement[];
    showLoadingOverlay?: boolean;
    onAddQuestionClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onArchive: () => void;
    onUnarchive: () => void;
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
        onAddQuestionClick, // this.handleAddQuestionButtonClick
        onEdit, // this.handleEditQuestionButtonClick,
        onDelete, // this.handleDeleteQuestion,
        onArchive, // this.handleArchiveQuestion,
        onUnarchive, // this.handleUnarchiveQuestion,
        archived,
    } = props;

    const getQuestionRendererParams = useCallback(
        (key: QuestionnaireQuestionElement['id'], question: QuestionnaireQuestionElement) => ({
            data: question,
            onEditButtonClick: onEdit,
            onDelete,
            onArchive,
            onUnarchive,
            framework,
            className: styles.question,
        }),
        [framework, onEdit, onDelete, onArchive, onUnarchive],
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

    return (
        <div className={_cs(styles.questionList, className)}>
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    {title}
                </h3>
                { !archived &&
                    <div className={styles.actions}>
                        <Button
                            onClick={onAddQuestionClick}
                            disabled={showLoadingOverlay}
                        >
                            {/* FIXME: use strings */}
                            Add question
                        </Button>
                    </div>
                }
            </header>
            <ListView
                className={styles.content}
                rendererParams={getQuestionRendererParams}
                renderer={Question}
                data={filteredQuestions}
                keySelector={questionKeySelector}
            />
        </div>
    );
};

export default QuestionList;
