import React, { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoTrash } from 'react-icons/io5';

import {
    DraggableContent,
    Button,
    Popup,
    QuickActionButton,
} from '@the-deep/deep-ui';

import { useModalState } from '#hooks/stateManagement';
import { useLazyRequest } from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import _ts from '#ts';

import EntryItem, { Props as EntryItemProps } from '../EntryItem';
import { DiscardedTags } from '../index';
import styles from './styles.scss';

interface Props extends EntryItemProps {
    className?: string;
    entryId: number;
    disabled?: boolean;
    pillarId: number;
    onEntryDiscard: () => void;
    discardedTags?: DiscardedTags[];
}

function SourceEntryItem(props: Props) {
    const {
        className,
        entryId,
        disabled,
        pillarId,
        onEntryDiscard,
        discardedTags,
        ...otherProps
    } = props;

    const value = useMemo(() => ({ entryId }), [entryId]);
    const [popupShown,,,, togglePopupShown] = useModalState(false);

    const {
        pending,
        trigger,
    } = useLazyRequest<unknown, { entry: number; tag: number }>({
        url: `server://analysis-pillar/${pillarId}/discarded-entries/`,
        method: 'POST',
        body: ctx => ctx,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('pillarAnalysis', 'pillarAnalysisTitle'))({ error: errorBody });
        },
        onSuccess: () => {
            if (onEntryDiscard) {
                onEntryDiscard();
            }
        },
    });

    const handleDiscardClick = useCallback((tagKey: number) => {
        trigger({
            entry: entryId,
            tag: tagKey,
        });
    }, [trigger, entryId]);

    return (
        <DraggableContent
            className={_cs(className, styles.entryItem, disabled && styles.disabled)}
            name="entry"
            value={value}
            contentClassName={styles.children}
            footerActions={(
                <QuickActionButton
                    name="popup"
                    onClick={togglePopupShown}
                >
                    <IoTrash />
                    <Popup
                        show={popupShown}
                        freeWidth
                        contentClassName={styles.popupContainer}
                    >
                        {discardedTags && discardedTags.map(tag => (
                            <Button
                                key={tag.key}
                                className={styles.popupButton}
                                variant="action"
                                name={tag.value}
                                onClick={() => handleDiscardClick(tag.key)}
                                disabled={pending}
                            >
                                {tag.value}
                            </Button>
                        ))}
                    </Popup>
                </QuickActionButton>
            )}
        >
            <EntryItem
                {...otherProps}
            />
        </DraggableContent>
    );
}

export default SourceEntryItem;
