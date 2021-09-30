import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoTrashBinOutline, IoAdd } from 'react-icons/io5';
import { FiEdit2 } from 'react-icons/fi';
import {
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    className?: string;
    itemKey: number;
    member?: number;
    onAddClick?: (key: number) => void;
    onEditClick: (group: number) => void;
    onDeleteClick: (key: number) => void;
    disabled?: boolean;
    addButtonTitle?: string;
    editButtonTitle?: string;
    deleteButtonTitle?: string;
    deleteConfirmationMessage?: string;
}

function UserGroupActionCell(props: Props) {
    const {
        className,
        itemKey,
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
        onEditClick(itemKey);
    }, [itemKey, onEditClick]);

    const handleDeleteUserGroupClick = useCallback(() => {
        onDeleteClick(itemKey);
    }, [itemKey, onDeleteClick]);

    return (
        <div className={_cs(styles.actionCell, className)}>
            {onAddClick && (
                <QuickActionButton
                    className={styles.button}
                    name="addButton"
                    onClick={handleAddButtonClick}
                    disabled={disabled}
                    title={addButtonTitle}
                >
                    <IoAdd />
                </QuickActionButton>
            )}
            <QuickActionButton
                className={styles.button}
                name="editButton"
                onClick={handleEditButtonClick}
                disabled={disabled}
                title={editButtonTitle}
            >
                <FiEdit2 />
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
                <IoTrashBinOutline />
            </QuickActionConfirmButton>
        </div>
    );
}

export default UserGroupActionCell;
