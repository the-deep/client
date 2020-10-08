import React from 'react';

import Button from '#rsca/Button';

import EditEntryFormModal from '#components/general/EditEntryFormModal';

import { EntryFields } from '#typings/entry';
import { FrameworkFields } from '#typings/framework';
import _ts from '#ts';

import styles from './styles.scss';

interface EntryEditButtonProps {
    className?: string;
    entry: EntryFields;
    framework: FrameworkFields;
    disabled?: boolean;
}

function EntryEditButton(props: EntryEditButtonProps) {
    const {
        entry,
        className,
        framework,
        disabled,
    } = props;

    const [showModal, setShowModal] = React.useState(false);

    const handleEntryEdit = React.useCallback(() => {
        setShowModal(true);
    }, [setShowModal]);

    const handleEditEntryModalClose = React.useCallback(() => {
        setShowModal(false);
    }, [setShowModal]);

    return (
        <>
            <Button
                className={className}
                iconName="edit"
                onClick={handleEntryEdit}
                disabled={disabled}
            />
            {showModal && (
                <EditEntryFormModal
                    framework={framework}
                    entry={entry}
                    onClose={handleEditEntryModalClose}
                />
            )}
        </>
    );
}

export default EntryEditButton;
