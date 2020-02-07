import React from 'react';
import { Link } from 'react-router-dom';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import DropdownMenu from '#rsca/DropdownMenu';
import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import AccentButton from '#rsca/Button/AccentButton';
import FormattedDate from '#rscv/FormattedDate';
import QuestionnaireModal from '#qbc/QuestionnaireModal';

import { pathNames } from '#constants';
import { MiniQuestionnaireElement } from '#typings';

import MetaOutput from '../MetaOutput';

import styles from './styles.scss';

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

const ModalButton = modalize(Button);

interface Props {
    className?: string;
    questionnaireKey: MiniQuestionnaireElement['id'];
    data: MiniQuestionnaireElement;
    archived?: boolean;
    disabled?: boolean;
    onArchive: (id: number) => void;
    onUnarchive: (id: number) => void;
    onDelete: (id: number) => void;
    onEdit: (questionnaire: MiniQuestionnaireElement) => void;
    onXLSFormExport: (id: number) => void;
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

    private handleXLSFormExport = () => {
        const {
            onXLSFormExport,
            questionnaireKey,
        } = this.props;

        onXLSFormExport(questionnaireKey);
    }

    public render() {
        const {
            className,
            archived,
            disabled,
            data,
            onEdit,
        } = this.props;

        const {
            id,
            title,
            createdAt,
            project,
            crisisTypeDetail,
            requiredDuration,
            enumeratorSkillDisplay,
            dataCollectionTechniqueDisplay,
            activeQuestionsCount,
        } = data;

        return (
            <div className={_cs(styles.questionnaire, className)}>
                <header className={styles.header}>
                    <div className={styles.left}>
                        <h3 className={styles.heading}>
                            { title }
                        </h3>
                        <div className={styles.info}>
                            <div className={styles.questions}>
                                <div className={styles.value}>
                                    {activeQuestionsCount}
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
                            <>
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
                                    Edit Questions
                                </Link>
                                <ModalButton
                                    transparent
                                    disabled={disabled}
                                    modal={(
                                        <QuestionnaireModal
                                            value={data}
                                            projectId={project}
                                            onRequestSuccess={onEdit}
                                        />
                                    )}
                                >
                                    {/* FIXME: use strings */}
                                    Edit details
                                </ModalButton>
                            </>
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
                            dropdownIcon="menuDots"
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
                                // FIXME: use strings
                                title="Export to XLSForm"
                                onClick={this.handleXLSFormExport}
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
                        value={dataCollectionTechniqueDisplay}
                    />
                    <MetaOutput
                        // FIXME: use strings
                        label="Enumerator skill"
                        value={enumeratorSkillDisplay}
                    />
                    <MetaOutput
                        // FIXME: use strings
                        label="Required duration"
                        value={`${requiredDuration} min`}
                    />
                </div>
            </div>
        );
    }
}

export default Questionnaire;
