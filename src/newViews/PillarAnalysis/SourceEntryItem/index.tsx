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
import styles from './styles.scss';

const REDUNDANT = 0;
const TOO_OLD = 1;
const ANECDOTAL = 2;
const OUTLIER = 3;

interface Props extends EntryItemProps {
    className?: string;
    entryId: number;
    disabled?: boolean;
    pillarId: number;
    onEntryDiscard: () => void;
}

function SourceEntryItem(props: Props) {
    const {
        className,
        entryId,
        disabled,
        pillarId,
        onEntryDiscard,
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

    const handleRedundantClick = useCallback(() => {
        trigger({
            entry: entryId,
            tag: REDUNDANT,
        });
    }, [trigger, entryId]);

    const handleTooOldClick = useCallback(() => {
        trigger({
            entry: entryId,
            tag: TOO_OLD,
        });
    }, [trigger, entryId]);

    const handleOutlierClick = useCallback(() => {
        trigger({
            entry: entryId,
            tag: OUTLIER,
        });
    }, [trigger, entryId]);

    const handleAnecdotalClick = useCallback(() => {
        trigger({
            entry: entryId,
            tag: ANECDOTAL,
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
                        <Button
                            className={styles.popupButton}
                            variant="action"
                            name="anecdotal"
                            onClick={handleAnecdotalClick}
                            disabled={pending}
                            // FIXME: Use strings
                        >
                            Anecdotal
                        </Button>
                        <Button
                            className={styles.popupButton}
                            variant="action"
                            name="redundant"
                            disabled={pending}
                            onClick={handleRedundantClick}
                            // FIXME: Use strings
                        >
                            Redundant
                        </Button>
                        <Button
                            className={styles.popupButton}
                            variant="action"
                            name="tooOld"
                            disabled={pending}
                            onClick={handleTooOldClick}
                            // FIXME: Use strings
                        >
                            Too old
                        </Button>
                        <Button
                            variant="action"
                            className={styles.popupButton}
                            name="outlier"
                            onClick={handleOutlierClick}
                            disabled={pending}
                            // FIXME: Use strings
                        >
                            Outlier
                        </Button>
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
