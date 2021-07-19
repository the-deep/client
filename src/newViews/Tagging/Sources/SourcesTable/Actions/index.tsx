import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoAdd,
    IoEllipsisVerticalSharp,
} from 'react-icons/io5';
import { MdModeEdit } from 'react-icons/md';
import {
    QuickActionButton,
    ButtonLikeLink,
    DropdownMenu,
    DropdownMenuItem,
    useConfirmation,
} from '@the-deep/deep-ui';

import styles from './styles.scss';

export interface Props<T extends number> {
    className?: string;
    id: T;
    onEditClick: (key: T) => void;
    onDeleteClick: (key: T) => void;
    disabled?: boolean;
    isAssessmentLead?: boolean;
}

function Actions<T extends number>(props: Props<T>) {
    const {
        className,
        id,
        onEditClick,
        disabled,
        isAssessmentLead,
        onDeleteClick,
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
                to="#"
                icons={<IoAdd />}
            >
                Tag
            </ButtonLikeLink>
            <DropdownMenu
                label={(
                    <IoEllipsisVerticalSharp />
                )}
                variant="secondary"
                hideDropdownIcon
            >
                <DropdownMenuItem
                    name="delete"
                    onClick={onDeleteLeadClick}
                >
                    Delete
                </DropdownMenuItem>
            </DropdownMenu>
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
