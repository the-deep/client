import React from 'react';
import { Link } from 'react-router-dom';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import DropdownMenu from '#rsca/DropdownMenu';
import Button from '#rsca/Button';
import AccentButton from '#rsca/Button/AccentButton';
import FormattedDate from '#rscv/FormattedDate';

import { pathNames } from '#constants';
import { QuestionnaireItem } from '#typings';

import styles from './styles.scss';

interface MetaOutputProps {
    label: string;
    value: string | number | undefined;
}

const MetaOutput = ({
    label,
    value,
}: MetaOutputProps) => {
    if (!value) {
        return null;
    }

    return (
        <div
            className={styles.metaOutput}
            title={label}
        >
            <div
                className={styles.name}
            >
                { value }
            </div>
        </div>
    );
};

interface DropdownButtonProps {
    className?: string;
    title: string;
    disabled?: boolean;
    onClick?: () => void;
}

const DropdownButton = ({
    className,
    title,
    ...otherProps
}: DropdownButtonProps) => (
    <Button
        className={_cs(className, styles.dropdownButton)}
        transparent
        {...otherProps}
    >
        { title }
    </Button>
);

interface Props {
    className?: string;
    questionnaireKey: QuestionnaireItem['id'];
    data: QuestionnaireItem;
    archived?: boolean;
    disabled?: boolean;
    onArchive: (id: number) => void;
    onUnarchive: (id: number) => void;
    onDelete: (id: number) => void;
}

class Questionnaire extends React.PureComponent<Props> {
    private handleArchive = () => {
        const {
            onArchive,
            questionnaireKey,
        } = this.props;

        onArchive(questionnaireKey);
    }

    private handleUnarchive = () => {
        const {
            onUnarchive,
            questionnaireKey,
        } = this.props;

        onUnarchive(questionnaireKey);
    }

    private handleDelete = () => {
        const {
            onDelete,
            questionnaireKey,
        } = this.props;

        onDelete(questionnaireKey);
    }

    public render() {
        const {
            className,
            archived,
            disabled,
            data: {
                id,
                title,
                questions,
                createdAt,
                project,
                crisisTypeDetail,
                dataCollectionTechniqueDetail,
                requiredDuration,
                enumeratorSkillDetail,
            },
        } = this.props;

        return (
            <div className={_cs(styles.questionnaire, className)}>
                <header className={styles.header}>
                    <div className={styles.left}>
                        <h4 className={styles.heading}>
                            { title }
                        </h4>
                        <div className={styles.info}>
                            <div className={styles.questions}>
                                <div className={styles.value}>
                                    { questions.length }
                                </div>
                                <div className={styles.label}>
                                    {/* FIXME: use strings */}
                                    questions
                                </div>
                            </div>
                            <div>—</div>
                            <div className={styles.created}>
                                <div className={styles.label}>
                                    {/* FIXME: use strings */}
                                    created
                                </div>
                                <div className={styles.value}>
                                    <FormattedDate
                                        value={createdAt}
                                        mode="dd-MM-yyyy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.right}>
                        {!archived && (
                            <Link
                                className={styles.editQuestionnaireLink}
                                to={reverseRoute(
                                    pathNames.questionnaireBuilder,
                                    {
                                        questionnaireId: id,
                                        projectId: project,
                                    },
                                )}
                                disabled={disabled}
                            >
                                {/* FIXME: use strings */}
                                Edit
                            </Link>
                        )}
                        {archived && (
                            <AccentButton
                                transparent
                                onClick={this.handleUnarchive}
                                disabled={disabled}
                            >
                                {/* FIXME: use strings */}
                                Unarchive
                            </AccentButton>
                        )}
                        <DropdownMenu
                            iconName="moreVertical"
                            hideDropdownIcon
                        >
                            {!archived && (
                                <DropdownButton
                                    disabled={disabled}
                                    // FIXME: use strings
                                    title="Archive"
                                    onClick={this.handleArchive}
                                />
                            )}
                            {!archived && (
                                <DropdownButton
                                    disabled
                                    // FIXME: use strings
                                    title="Copy"
                                />
                            )}
                            <DropdownButton
                                disabled={disabled}
                                // FIXME: use strings
                                title="Delete"
                                onClick={this.handleDelete}
                            />
                            <DropdownButton
                                disabled
                                // FIXME: use strings
                                title="Export to KoBo"
                            />
                            <DropdownButton
                                disabled
                                // FIXME: use strings
                                title="Export to ODK"
                            />
                            <DropdownButton
                                disabled
                                // FIXME: use strings
                                title="Export data collection plan"
                            />
                        </DropdownMenu>
                    </div>
                </header>
                <div className={styles.content}>
                    <MetaOutput
                        // FIXME: use strings
                        label="Crisis type"
                        value={crisisTypeDetail ? crisisTypeDetail.title : undefined}
                    />
                    <MetaOutput
                        // FIXME: use strings
                        label="Data collection technique"
                        value={
                            dataCollectionTechniqueDetail
                                ? dataCollectionTechniqueDetail.value
                                : undefined
                        }
                    />
                    <MetaOutput
                        // FIXME: use strings
                        label="Required duration"
                        value={
                            requiredDuration
                                ? `${requiredDuration} min`
                                : undefined
                        }
                    />
                    <MetaOutput
                        // FIXME: use strings
                        label="Enumerator skill"
                        value={
                            enumeratorSkillDetail
                                ? enumeratorSkillDetail.value
                                : undefined
                        }
                    />
                </div>
            </div>
        );
    }
}

export default Questionnaire;
