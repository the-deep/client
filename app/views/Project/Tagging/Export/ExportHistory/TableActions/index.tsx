import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { FiEdit2 } from 'react-icons/fi';
import {
    IoTrashBinOutline,
} from 'react-icons/io5';
import {
    Button,
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import {
    ProjectExportsQuery,
} from '#generated/types';

import styles from './styles.css';

type ExportItem = NonNullable<NonNullable<NonNullable<NonNullable<ProjectExportsQuery['project']>['exports']>>['results']>[number];

export interface Props {
    className?: string;
    onDeleteClick: (data: ExportItem) => void;
    onEditClick: (data: ExportItem) => void;
    onViewExportClick: (data: ExportItem) => void;
    viewDisabled: boolean;
    disabled?: boolean;

    data: ExportItem;
}

function TableActions(props: Props) {
    const {
        className,
        disabled,
        onDeleteClick,
        onEditClick,
        onViewExportClick,
        viewDisabled,
        data,
    } = props;

    const handleDeleteClick = useCallback(() => {
        onDeleteClick(data);
    }, [onDeleteClick, data]);

    const handleEditClick = useCallback(() => {
        onEditClick(data);
    }, [onEditClick, data]);

    return (
        <div className={_cs(styles.actions, className)}>
            <QuickActionButton
                name={undefined}
                title="Edit Export Title"
                onClick={handleEditClick}
                disabled={disabled}
            >
                <FiEdit2 />
            </QuickActionButton>
            <QuickActionConfirmButton
                name={undefined}
                title="Remove export"
                onConfirm={handleDeleteClick}
                message="Are you sure you want to remove this export?"
                showConfirmationInitially={false}
                disabled={disabled}
            >
                <IoTrashBinOutline />
            </QuickActionConfirmButton>
            <Button
                name={data}
                onClick={onViewExportClick}
                variant="secondary"
                disabled={disabled || viewDisabled}
            >
                View
            </Button>
        </div>
    );
}

export default TableActions;
