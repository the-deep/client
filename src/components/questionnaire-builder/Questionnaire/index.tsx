import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Cloak from '#components/general/Cloak';
import DropdownMenu from '#rsca/DropdownMenu';
import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import AccentButton from '#rsca/Button/AccentButton';
import FormattedDate from '#rscv/FormattedDate';
import QuestionnaireModal from '#qbc/QuestionnaireModal';
import DropdownButton from '#components/general/DropdownButton';
import QuestionnairePreviewModal from '#qbc/QuestionnairePreviewModal';
import { generateDurationLabel } from '#entities/questionnaire';

import { pathNames } from '#constants';
import { MiniQuestionnaireElement, Permissions } from '#types';

import MetaOutput from '../MetaOutput';

import styles from './styles.scss';

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
    onClone: (questionnaireKey: MiniQuestionnaireElement['id']) => void;
    onEdit: (questionnaire: MiniQuestionnaireElement) => void;
    onXLSFormExport: (id: number) => void;
}

const isReadOnly = ({ setupPermissions }: Permissions) => !setupPermissions.modify;

const Questionnaire = (props: Props) => {
    const {
        className,
        archived,
        disabled,
        data,
        onEdit,
        onArchive,
        onUnarchive,
        onDelete,
        onClone,
        onXLSFormExport,
        questionnaireKey,
    } = props;

    const {
        id,
        title,
        createdAt,
        project,
        crisisTypesDetail,
        requiredDuration,
        enumeratorSkillDisplay,
        dataCollectionTechniquesDisplay,
        activeQuestionsCount,
    } = data;

    const [showPreviewModal, setPreviewModal] = useState(false);

    const handleArchive = useCallback(
        () => {
            onArchive(questionnaireKey);
        },
        [onArchive, questionnaireKey],
    );

    const handleUnarchive = useCallback(
        () => {
            onUnarchive(questionnaireKey);
        },
        [onUnarchive, questionnaireKey],
    );

    const handleDelete = useCallback(
        () => {
            onDelete(questionnaireKey);
        },
        [onDelete, questionnaireKey],
    );

    const handleCloneClick = useCallback(
        () => {
            onClone(questionnaireKey);
        },
        [onClone, questionnaireKey],
    );

    const handleXLSFormExport = useCallback(
        () => {
            onXLSFormExport(questionnaireKey);
        },
        [onXLSFormExport, questionnaireKey],
    );

    const handlePreviewModalShow = useCallback(
        () => {
            setPreviewModal(true);
        },
        [setPreviewModal],
    );

    const handlePreviewModalClose = useCallback(
        () => {
            setPreviewModal(false);
        },
        [setPreviewModal],
    );

    return (
        <div className={_cs(styles.questionnaire, className)}>
            <header className={styles.header}>
                <div className={styles.left}>
                    <h3>
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
                    <Cloak
                        hide={isReadOnly}
                        render={!archived ? (
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
                                    // disabled={disabled}
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
                        ) : (
                            <AccentButton
                                transparent
                                onClick={handleUnarchive}
                                disabled={disabled}
                            >
                                {/* FIXME: use strings */}
                                Unarchive
                            </AccentButton>
                        )}
                    />
                    <DropdownMenu
                        dropdownIcon="menuDots"
                        closeOnClick
                    >
                        <Cloak
                            hide={isReadOnly}
                            render={(
                                <>
                                    {!archived && (
                                        <>
                                            <DropdownButton
                                                disabled={disabled}
                                                // FIXME: use strings
                                                title="Archive"
                                                onClick={handleArchive}
                                            />
                                            <DropdownButton
                                                onClick={handleCloneClick}
                                                disabled={disabled}
                                                // FIXME: use strings
                                                title="Clone"
                                            />
                                        </>
                                    )}
                                    <DropdownButton
                                        disabled={disabled}
                                        // FIXME: use strings
                                        title="Delete"
                                        onClick={handleDelete}
                                    />
                                </>
                            )}
                        />
                        <DropdownButton
                            onClick={handlePreviewModalShow}
                            disabled={disabled}
                            // FIXME: use strings
                            title="Preview"
                        />
                        <DropdownButton
                            // FIXME: use strings
                            disabled={disabled}
                            title="Export to XLSForm"
                            onClick={handleXLSFormExport}
                        />
                        {/*
                        <DropdownButton
                            // FIXME: use strings
                            disabled={disabled}
                            title="Export to KoBo"
                            onClick={handleKoboToolboxExport}
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
                        */}
                    </DropdownMenu>
                </div>
            </header>
            <div className={styles.content}>
                <MetaOutput
                    // FIXME: use strings
                    label="Crisis type"
                    value={crisisTypesDetail ? crisisTypesDetail.map(d => d.title).join(', ') : undefined}
                />
                <MetaOutput
                    // FIXME: use strings
                    label="Data collection technique"
                    value={dataCollectionTechniquesDisplay && dataCollectionTechniquesDisplay.join(', ')}
                />
                <MetaOutput
                    // FIXME: use strings
                    label="Enumerator skill"
                    value={enumeratorSkillDisplay}
                />
                <MetaOutput
                    // FIXME: use strings
                    label="Required duration"
                    value={generateDurationLabel(requiredDuration)}
                />
            </div>
            {showPreviewModal && (
                <QuestionnairePreviewModal
                    title={title}
                    questionnaireId={questionnaireKey}
                    closeModal={handlePreviewModalClose}
                />
            )}
        </div>
    );
};

export default Questionnaire;
