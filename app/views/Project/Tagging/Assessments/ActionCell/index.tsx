import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoTrashBinOutline } from 'react-icons/io5';
import { FiEdit2 } from 'react-icons/fi';
import {
    QuickActionLink,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    itemKey: string;
    leadId?: string;
    className?: string;
    disabled?: boolean;
}

function ActionCell(props: Props) {
    const {
        className,
        itemKey,
        disabled,
    } = props;

    const handleDeleteUserGroupClick = useCallback(() => {
        console.warn('here', itemKey);
    }, [itemKey]);

    return (
        <div className={_cs(styles.actionCell, className)}>
            <QuickActionLink
                className={styles.button}
                // TODO: Link this to actual assessment edit page
                to="#"
                disabled={disabled}
                title="Edit"
            >
                <FiEdit2 />
            </QuickActionLink>
            <QuickActionConfirmButton
                className={styles.button}
                name="deleteButton"
                title="Delete"
                onConfirm={handleDeleteUserGroupClick}
                message="Are you sure you want to delete this assessment?"
                showConfirmationInitially={false}
                disabled={disabled}
            >
                <IoTrashBinOutline />
            </QuickActionConfirmButton>
        </div>
    );
}

export default ActionCell;
