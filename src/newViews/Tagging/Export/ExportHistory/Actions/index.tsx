import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoCopyOutline,
    IoTrashOutline,
} from 'react-icons/io5';
import {
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';

import styles from './styles.scss';

export interface Props<T extends number> {
    className?: string;
    id: T;
    onCloneClick: (key: T) => void;
    onDeleteClick: (key: T) => void;
    disabled?: boolean;
}

function Actions<T extends number>(props: Props<T>) {
    const {
        className,
        id,
        disabled,
        onCloneClick,
        onDeleteClick,
    } = props;

    const handleDeleteClick = useCallback(() => {
        onDeleteClick(id);
    }, [onDeleteClick, id]);

    return (
        <div className={_cs(styles.actions, className)}>
            <QuickActionButton
                className={styles.button}
                name={id}
                onClick={onCloneClick}
                disabled={disabled}
                title="Copy export"
            >
                <IoCopyOutline />
            </QuickActionButton>
            <QuickActionConfirmButton
                className={styles.button}
                name="deleteButton"
                title="Remove export"
                onConfirm={handleDeleteClick}
                message="Are you sure you want to remove this export?"
                showConfirmationInitially={false}
                disabled={disabled}
            >
                <IoTrashOutline />
            </QuickActionConfirmButton>
        </div>
    );
}


export default Actions;
