import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoTrash } from 'react-icons/io5';
import { MdModeEdit } from 'react-icons/md';
import {
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';

import styles from './styles.scss';

export interface Props {
    className?: string;
    itemKey: number;
    groupKey: number;
    member: number;
    memberRole: 'admin' | 'normal';
    onAddClick?: (key: number) => void;
    onEditClick: (
        user: { id: number; member: number; role: 'admin' | 'normal' },
        group: number,
    ) => void;
    onDeleteClick: (key: number) => void;
    disabled?: boolean;
    editButtonTitle?: string;
    deleteButtonTitle?: string;
    deleteConfirmationMessage?: string;
}

function ActionCell(props: Props) {
    const {
        className,
        itemKey,
        groupKey,
        member,
        onEditClick,
        onDeleteClick,
        disabled,
        editButtonTitle,
        deleteButtonTitle,
        deleteConfirmationMessage,
        memberRole,
    } = props;

    const handleEditButtonClick = useCallback(() => {
        onEditClick({
            id: itemKey,
            member,
            role: memberRole,
        }, groupKey);
    }, [itemKey, onEditClick, groupKey, member, memberRole]);

    const handleDeleteUserGroupClick = useCallback(() => {
        onDeleteClick(itemKey);
    }, [itemKey, onDeleteClick]);

    return (
        <div className={_cs(styles.actionCell, className)}>
            <QuickActionButton
                className={styles.button}
                name="editButton"
                onClick={handleEditButtonClick}
                disabled={disabled}
                title={editButtonTitle}
            >
                <MdModeEdit />
            </QuickActionButton>
            <QuickActionConfirmButton
                className={styles.button}
                name="deleteButton"
                title={deleteButtonTitle}
                onConfirm={handleDeleteUserGroupClick}
                message={deleteConfirmationMessage}
                showConfirmationInitially={false}
                disabled={disabled}
            >
                <IoTrash />
            </QuickActionConfirmButton>
        </div>
    );
}

export default ActionCell;
