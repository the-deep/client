import React from 'react';
import { _cs } from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';

import EntryReviewModal from '#components/general/EntryReviewModal';

import _ts from '#ts';

import styles from './styles.scss';

const ModalButton = modalize(Button);

interface Props {
    className?: string;
    entryId: number;
}

function EntryReviewButton(props: Props) {
    const {
        className,
        entryId,
    } = props;

    return (
        <ModalButton
            className={_cs(styles.entryReviewButton, className)}
            modal={
                <EntryReviewModal
                    entryId={entryId}
                />
            }
            iconName="chat"
        />
    );
}

export default EntryReviewButton;
