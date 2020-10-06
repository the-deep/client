import React from 'react';

import Button from '#rsca/Button';

import EditEntryForm from '#components/general/EditEntryForm';

import { EntryFields } from '#typings/entry';
import { FrameworkFields } from '#typings/framework';
import _ts from '#ts';

import styles from './styles.scss';

interface EntryEditButtonProps {
    className?: string;
    entry: EntryFields;
    framework: FrameworkFields;
}

function EntryEditButton(props: EntryEditButtonProps) {
    const {
        entry,
        className,
        framework,
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
            />
            {showModal && (
                <EditEntryForm
                    framework={framework}
                    entry={entry}
                    onClose={handleEditEntryModalClose}
                />
            )}
        </>
    );
}

export default EntryEditButton;
