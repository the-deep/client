import React from 'react';

import Button from '#rsca/Button';

import styles from './styles.scss';

interface EntryEditButtonProps {
    className?: string;
    entryId: number;
}

// TODO: implement this properly
function EntryEditButton(props: EntryEditButtonProps) {
    const {
        className,
    } = props;

    const handleEntryEdit = React.useCallback(() => {}, []);

    return (
        <Button
            className={className}
            iconName="edit"
            onClick={handleEntryEdit}
        />
    );
}

export default EntryEditButton;
