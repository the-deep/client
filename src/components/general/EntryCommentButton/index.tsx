import React from 'react';
import { _cs } from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';

import EntryCommentModal from '#components/general/EntryCommentModal';
import styles from './styles.scss';

const ModalButton = modalize(Button);

export interface EntryCommentButtonProps {
    className?: string;
    commentCount: number;
    entryId: number;
    assignee: number;
    disabled?: boolean;
}

function EntryCommentButton(props: EntryCommentButtonProps) {
    const {
        commentCount,
        className,
        entryId,
        assignee,
        ...otherProps
    } = props;

    // TODO; implement this properly
    const handleCommentsCountChange = React.useCallback(() => {}, []);
    const defaultAssignees = React.useMemo(() => [assignee], [assignee]);

    return (
        <ModalButton
            className={_cs(styles.entryCommentButton, className)}
            modal={
                <EntryCommentModal
                    entryServerId={entryId}
                    onCommentsCountChange={handleCommentsCountChange}
                    defaultAssignees={defaultAssignees}
                />
            }
            iconName="chat"
            {...otherProps}
        >
            {commentCount !== 0 && commentCount}
        </ModalButton>
    );
}

export default EntryCommentButton;
