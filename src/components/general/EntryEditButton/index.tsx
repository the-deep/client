import React from 'react';

import Button from '#rsca/Button';

import EditEntryFormModal from '#components/general/EditEntryFormModal';

import { Entry } from '#typings/entry';
import { FrameworkFields } from '#typings/framework';

interface EntryEditButtonProps {
    className?: string;
    entry: Entry;
    framework: FrameworkFields;
    disabled?: boolean;
    onEditSuccess: (newEntry: Entry) => void;
}

function EntryEditButton(props: EntryEditButtonProps) {
    const {
        entry,
        className,
        framework,
        disabled,
        onEditSuccess,
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
                    onEditSuccess={onEditSuccess}
                />
            )}
        </>
    );
}

export default EntryEditButton;
