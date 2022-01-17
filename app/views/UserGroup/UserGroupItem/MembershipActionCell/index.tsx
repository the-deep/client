import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoTrashBinOutline } from 'react-icons/io5';
import { FiEdit2 } from 'react-icons/fi';
import {
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    className?: string;
    membershipId: string;
    groupKey: string;
    member: string;
    memberRole: 'admin' | 'normal';
    onAddClick?: (key: number) => void;
    onEditClick: (
        user: { id: string; member: string; role: 'admin' | 'normal' },
        group: string,
    ) => void;
    onDeleteClick: (key: string) => void;
    disabled?: boolean;
}

function ActionCell(props: Props) {
    const {
        className,
        membershipId,
        groupKey,
        member,
        onEditClick,
        onDeleteClick,
        disabled,
        memberRole,
    } = props;

    const handleEditButtonClick = useCallback(() => {
        onEditClick({
            id: membershipId,
            member,
            role: memberRole,
        }, groupKey);
    }, [membershipId, onEditClick, groupKey, member, memberRole]);

    const handleDeleteUserGroupClick = useCallback(() => {
        onDeleteClick(membershipId);
    }, [membershipId, onDeleteClick]);

    return (
        <div className={_cs(styles.actionCell, className)}>
            <QuickActionButton
                className={styles.button}
                name="editButton"
                onClick={handleEditButtonClick}
                disabled={disabled}
                title="Edit user"
            >
                <FiEdit2 />
            </QuickActionButton>
            <QuickActionConfirmButton
                className={styles.button}
                name="deleteButton"
                title="Remove user"
                onConfirm={handleDeleteUserGroupClick}
                message="Are you sure you want to remove this member from this user group?"
                showConfirmationInitially={false}
                disabled={disabled}
            >
                <IoTrashBinOutline />
            </QuickActionConfirmButton>
        </div>
    );
}

export default ActionCell;
