import React from 'react';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import _ts from '#ts';

import styles from './styles.scss';

interface EntryDeleteButtonProps {
    className?: string;
    entryId: number;
}

// TODO: implement this properly
function EntryDeleteButton(props: EntryDeleteButtonProps) {
    const {
        className,
    } = props;

    const handleEntryDelete = React.useCallback(() => {}, []);

    return (
        <DangerConfirmButton
            className={className}
            iconName="delete"
            onClick={handleEntryDelete}
            confirmationTitle={_ts('entries', 'deleteConfirmTitle')}
            confirmationMessage={_ts('entries', 'deleteConfirmMessage')}
            // disabled={pending}
        />
    );
}

export default EntryDeleteButton;
