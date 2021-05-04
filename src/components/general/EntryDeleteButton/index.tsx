import React from 'react';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import { useLazyRequest } from '#utils/request';
import _ts from '#ts';

interface EntryDeleteButtonProps {
    className?: string;
    entryId: number;
    onPendingChange?: (isPending: boolean) => void;
    onDeleteSuccess?: () => void;
    onDeleteFailure?: () => void;
    disabled?: boolean;
}

// TODO: implement this properly
function EntryDeleteButton(props: EntryDeleteButtonProps) {
    const {
        entryId,
        className,
        onDeleteSuccess,
        onDeleteFailure,
        onPendingChange,
        disabled,
    } = props;

    const {
        pending,
        trigger: deleteEntry,
    } = useLazyRequest<unknown>({
        url: `server://entries/${entryId}/`,
        method: 'DELETE',
        onSuccess: onDeleteSuccess,
        onFailure: onDeleteFailure,
    });

    React.useEffect(() => {
        if (onPendingChange) {
            onPendingChange(pending);
        }
    }, [pending, onPendingChange]);

    const handleEntryDelete = React.useCallback(() => {
        deleteEntry(null);
    }, [deleteEntry]);

    return (
        <DangerConfirmButton
            className={className}
            iconName="delete"
            onClick={handleEntryDelete}
            confirmationTitle={_ts('entries', 'deleteConfirmTitle')}
            confirmationMessage={_ts('entries', 'deleteConfirmMessage')}
            disabled={pending || disabled}
            pending={pending}
        />
    );
}

export default EntryDeleteButton;
