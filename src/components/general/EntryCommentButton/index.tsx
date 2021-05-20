import React from 'react';
import { _cs } from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';

import EntryCommentModal from '#components/general/EntryCommentModal';

import styles from './styles.scss';

const ModalButton = modalize(Button);

interface Props {
    className?: string;
    entryId: number;
}

function EntryCommentButton(props: Props) {
    const {
        className,
        entryId,
    } = props;

    return (
        <ModalButton
            className={_cs(styles.entryReviewButton, className)}
            modal={
                <EntryCommentModal
                    entryId={entryId}
                />
            }
            iconName="chat"
        />
    );
}

export default EntryCommentButton;
