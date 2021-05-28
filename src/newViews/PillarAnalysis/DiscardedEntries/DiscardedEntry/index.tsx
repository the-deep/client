import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoTrash } from 'react-icons/io5';

import {
    Container,
    PendingMessage,
    Tag,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';

import { useLazyRequest } from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import _ts from '#ts';

import EntryItem, { Props as EntryItemProps } from '../../EntryItem';
import styles from './styles.scss';

interface Props extends EntryItemProps {
    className?: string;
    entryId: number;
    pillarId: number;
    tagDisplay: string;
    onEntryUndiscard: () => void;
}

function DiscardedEntry(props: Props) {
    const {
        className,
        entryId,
        pillarId,
        onEntryUndiscard,
        tagDisplay,
        ...otherProps
    } = props;

    const {
        pending,
        trigger,
    } = useLazyRequest<unknown>({
        url: `server://analysis-pillar/${pillarId}/discarded-entries/${entryId}/`,
        method: 'DELETE',
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('pillarAnalysis', 'pillarAnalysisTitle'))({ error: errorBody });
        },
        onSuccess: () => {
            if (onEntryUndiscard) {
                onEntryUndiscard();
            }
        },
    });

    const handleUndiscardClick = useCallback(() => {
        trigger(null);
    }, [trigger]);

    return (
        <Container
            className={_cs(className, styles.entryItem)}
            contentClassName={styles.children}
            footerIcons={(
                <Tag>
                    {tagDisplay}
                </Tag>
            )}
            footerActions={(
                <QuickActionConfirmButton
                    name="undiscard"
                    disabled={pending}
                    onConfirm={handleUndiscardClick}
                    message={_ts('pillarAnalysis', 'confirmUndiscardEntryMessage')}
                    showConfirmationInitially={false}
                >
                    <IoTrash />
                </QuickActionConfirmButton>
            )}
        >
            {pending && (<PendingMessage />)}
            <EntryItem
                {...otherProps}
            />
        </Container>
    );
}

export default DiscardedEntry;
