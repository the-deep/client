import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoTrashOutline } from 'react-icons/io5';
import { FiEdit2 } from 'react-icons/fi';
import {
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props<T> {
    className?: string;
    itemKey: T;
    onEditClick: (key: T) => void;
    onDeleteClick: (key: T) => void;
    disabled?: boolean;
    editButtonTitle?: string;
    deleteButtonTitle?: string;
    deleteConfirmationMessage?: string;
}

function ActionCell<T>(props: Props<T>) {
    const {
        className,
        itemKey,
        onEditClick,
        onDeleteClick,
        disabled,
        editButtonTitle,
        deleteButtonTitle,
        deleteConfirmationMessage,
    } = props;

    const handleEditButtonClick = useCallback(() => {
        onEditClick(itemKey);
    }, [itemKey, onEditClick]);

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
                <IoTrashOutline />
            </QuickActionConfirmButton>
        </div>
    );
}

export default ActionCell;
