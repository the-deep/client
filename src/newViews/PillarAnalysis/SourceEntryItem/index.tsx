import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    compareDate,
} from '@togglecorp/fujs';
import { IoTrash } from 'react-icons/io5';
import {
    Tag,
    DraggableContent,
    QuickActionDropdownMenu,
    DropdownMenuItem,
} from '@the-deep/deep-ui';

import { useLazyRequest } from '#utils/request';
import { genericMemo } from '#utils/safeCommon';
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
    createdAt?: string;
    pillarModifiedDate?: string;
}

function SourceEntryItem(props: Props) {
    const {
        className,
        entryId,
        createdAt,
        pillarModifiedDate,
        disabled,
        pillarId,
        onEntryDiscard,
        discardedTags,
        type,
        ...otherProps
    } = props;

    const value = useMemo(() => ({ entryId }), [entryId]);

    const {
        trigger,
    } = useLazyRequest<unknown, { entry: number; tag: number }>({
        url: `server://analysis-pillar/${pillarId}/discarded-entries/`,
        method: 'POST',
        body: ctx => ctx,
        failureHeader: _ts('pillarAnalysis', 'pillarAnalysisTitle'),
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

    const isNewEntry = compareDate(createdAt, pillarModifiedDate) > 0;

    return (
        <DraggableContent
            className={_cs(
                className,
                styles.entryItem,
                disabled && styles.disabled,
                isNewEntry && styles.newEntry,
            )}
            name="entry"
            value={value}
            contentClassName={_cs(
                styles.children,
                type === 'image' && styles.image,
            )}
            footerIcons={isNewEntry && (
                <Tag
                    variant="complement1"
                >
                    {_ts('pillarAnalysis', 'newEntryTagLabel')}
                </Tag>
            )}
            footerActions={(
                <QuickActionDropdownMenu
                    label={(<IoTrash />)}
                >
                    {discardedTags && discardedTags.map(tag => (
                        <DropdownMenuItem
                            key={tag.key}
                            name={tag.value}
                            onClick={() => handleDiscardClick(tag.key)}
                        >
                            {tag.value}
                        </DropdownMenuItem>
                    ))}
                </QuickActionDropdownMenu>
            )}
        >
            <EntryItem
                type={type}
                {...otherProps}
            />
        </DraggableContent>
    );
}

export default genericMemo(SourceEntryItem);
