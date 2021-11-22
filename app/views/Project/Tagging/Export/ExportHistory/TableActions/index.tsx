import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoTrashBinOutline,
} from 'react-icons/io5';
import {
    Button,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    className?: string;
    id: string;
    onDeleteClick: (key: string) => void;
    onViewExportClick: (key: string) => void;
    disabled?: boolean;
}

function TableActions(props: Props) {
    const {
        className,
        id,
        disabled,
        onDeleteClick,
        onViewExportClick,
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
            <Button
                name="viewExport"
                onClick={onViewExportClick}
                variant="secondary"
                disabled={disabled}
            >
                View
            </Button>
        </div>
    );
}

export default TableActions;
