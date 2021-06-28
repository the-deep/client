import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoTrash, IoAdd } from 'react-icons/io5';
import { MdModeEdit } from 'react-icons/md';
import {
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';

import styles from './styles.scss';

export interface Props<T> {
    className?: string;
    itemKey: T;
    groupKey?: T;
    member?: T;
    onAddClick?: (key: T) => void;
    onEditClick: (key: T, group?: T, member?: T) => void;
    onDeleteClick: (key: T) => void;
    disabled?: boolean;
    addButtonTitle?: string;
    editButtonTitle?: string;
    deleteButtonTitle?: string;
    deleteConfirmationMessage?: string;
}

function ActionCell<T>(props: Props<T>) {
    const {
        className,
        itemKey,
        groupKey,
        member,
        onAddClick,
        onEditClick,
        onDeleteClick,
        disabled,
        addButtonTitle,
        editButtonTitle,
        deleteButtonTitle,
        deleteConfirmationMessage,
    } = props;

    const handleAddButtonClick = useCallback(() => {
        if (onAddClick) {
            onAddClick(itemKey);
        }
    }, [itemKey, onAddClick]);

    const handleEditButtonClick = useCallback(() => {
        onEditClick(itemKey, groupKey, member);
    }, [itemKey, onEditClick, groupKey, member]);

    const handleDeleteUserGroupClick = useCallback(() => {
        onDeleteClick(itemKey);
    }, [itemKey, onDeleteClick]);

    return (
        <div className={_cs(styles.actionCell, className)}>
            {onAddClick &&
                <QuickActionButton
                    className={styles.button}
                    name="addButton"
                    onClick={handleAddButtonClick}
                    disabled={disabled}
                    title={addButtonTitle}
                >
                    <IoAdd />
                </QuickActionButton>
            }
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
