import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoTrashBinOutline,
} from 'react-icons/io5';
import {
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';

import styles from './styles.scss';

export interface Props {
    className?: string;
    id: number;
    onDeleteClick: (key: number) => void;
    disabled?: boolean;
}

function TableActions(props: Props) {
    const {
        className,
        id,
        disabled,
        onDeleteClick,
    } = props;

    const handleDeleteClick = useCallback(() => {
        onDeleteClick(id);
    }, [onDeleteClick, id]);

    return (
        <div className={_cs(styles.actions, className)}>
            <QuickActionConfirmButton
                className={styles.button}
                name="deleteButton"
                title="Remove export"
                onConfirm={handleDeleteClick}
                message="Are you sure you want to remove this export?"
                showConfirmationInitially={false}
                disabled={disabled}
            >
                <IoTrashBinOutline />
            </QuickActionConfirmButton>
        </div>
    );
}


export default TableActions;
