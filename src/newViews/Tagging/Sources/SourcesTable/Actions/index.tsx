import React, { useCallback } from 'react';
import {
    IoAdd,
    IoEllipsisVerticalSharp,
} from 'react-icons/io5';
import { _cs, reverseRoute } from '@togglecorp/fujs';
import { MdModeEdit } from 'react-icons/md';
import {
    QuickActionButton,
    ButtonLikeLink,
    QuickActionDropdownMenu,
    DropdownMenuItem,
    useConfirmation,
} from '@the-deep/deep-ui';

import { pathNames } from '#constants';

import styles from './styles.scss';

export interface Props<T extends number> {
    className?: string;
    id: T;
    onEditClick: (key: T) => void;
    onDeleteClick: (key: T) => void;
    disabled?: boolean;
    isAssessmentLead?: boolean;
    projectId: number;
}

function Actions<T extends number>(props: Props<T>) {
    const {
        className,
        id,
        onEditClick,
        disabled,
        isAssessmentLead,
        onDeleteClick,
        projectId,
    } = props;

    const handleDeleteConfirm = useCallback(() => {
        onDeleteClick(id);
    }, [onDeleteClick, id]);

    const [
        modal,
        onDeleteLeadClick,
    ] = useConfirmation({
        showConfirmationInitially: false,
        onConfirm: handleDeleteConfirm,
        message: 'Are you sure you want to delete this lead?',
    });

    return (
        <div className={_cs(styles.actions, className)}>
            <QuickActionButton
                className={styles.button}
                name={id}
                onClick={onEditClick}
                disabled={disabled}
                title="edit"
            >
                <MdModeEdit />
            </QuickActionButton>
            <ButtonLikeLink
                className={styles.button}
                variant="primary"
                title="tag"
                disabled={disabled}
                to={reverseRoute(pathNames.taggingFlow, { projectId, leadId: id })}
                icons={<IoAdd />}
            >
                Tag
            </ButtonLikeLink>
            <QuickActionDropdownMenu
                label={(
                    <IoEllipsisVerticalSharp />
                )}
                variant="secondary"
            >
                <DropdownMenuItem
                    name="delete"
                    onClick={onDeleteLeadClick}
                >
                    Delete
                </DropdownMenuItem>
            </QuickActionDropdownMenu>
            {isAssessmentLead && (
                <ButtonLikeLink
                    className={styles.button}
                    variant="secondary"
                    title="assessment"
                    disabled={disabled}
                    to="#"
                    icons={<IoAdd />}
                >
                    Assessment
                </ButtonLikeLink>
            )}
            {modal}
        </div>
    );
}


export default Actions;
