import React, { memo, useMemo, useCallback, useContext } from 'react';
import { IoClose } from 'react-icons/io5';
import {
    DropContainer,
    DraggableContent,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';
import NonFieldError from '#components/NonFieldError';
import ExcerptInput from '#components/entry/ExcerptInput';

import EntryContext from '../../context';
import { AnalyticalEntryType, PartialAnalyticalEntryType } from '../../schema';
import { DroppedValue } from '../index';

import styles from './styles.css';

interface AnalyticalEntryInputProps {
    statementClientId: string;
    value: PartialAnalyticalEntryType;
    error: Error<AnalyticalEntryType> | undefined;
    // onChange: (value: PartialAnalyticalEntryType, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    onAnalyticalEntryDrop: (droppedValue: DroppedValue, dropOverEntryClientId: string) => void;
    dropDisabled?: boolean;
}

function AnalyticalEntryInput(props: AnalyticalEntryInputProps) {
    const {
        value,
        error: riskyError,
        // onChange,
        onRemove,
        index,
        statementClientId,
        onAnalyticalEntryDrop,
        dropDisabled,
    } = props;

    const error = getErrorObject(riskyError);

    const [
        entryDraggedStatus,
        setDragStart,
        setDragEnd,
    ] = useModalState(false);

    const handleAnalyticalEntryAdd = useCallback(
        (val: Record<string, unknown> | undefined) => {
            if (!val) {
                return;
            }
            const typedVal = val as { entryId: string, statementClientId: string };
            onAnalyticalEntryDrop(typedVal, value.clientId);
        },
        [value, onAnalyticalEntryDrop],
    );

    const dragValue = useMemo(() => ({
        entryId: value.entry,
        statementClientId,
    }), [value.entry, statementClientId]);

    const { entries } = useContext(EntryContext);
    const entry = value.entry ? entries[value.entry] : undefined;

    // const onFieldChange = useFormObject(index, value, onChange);

    return (
        <DropContainer
            className={_cs(
                styles.dropContainer,
                entryDraggedStatus && styles.hide,
            )}
            name="entry"
            // NOTE: Disabled drop on the same entry which is being dragged
            onDrop={!entryDraggedStatus ? handleAnalyticalEntryAdd : undefined}
            dropOverlayContainerClassName={styles.overlay}
            draggedOverClassName={styles.draggedOver}
            contentClassName={styles.content}
            disabled={dropDisabled}
            // TODO: disable this when entries count is greater than certain count
        >
            <DraggableContent
                className={styles.entry}
                name="entry"
                dropEffect="move"
                value={dragValue}
                onDragStart={setDragStart}
                onDragStop={setDragEnd}
                contentClassName={styles.content}
                headerActions={(
                    <QuickActionButton
                        name={index}
                        onClick={onRemove}
                        title={_ts('pillarAnalysis', 'removeAnalyticalEntryButtonTitle')}
                    >
                        <IoClose />
                    </QuickActionButton>
                )}
            >
                <NonFieldError error={error} />
                <NonFieldError error={error?.entry} />
                {entry && (
                    <ExcerptInput
                        value={entry.excerpt}
                        image={entry.image}
                        entryType={entry.entryType}
                        readOnly
                        imageRaw={undefined}
                        leadImageUrl={undefined}
                    />
                )}
            </DraggableContent>
        </DropContainer>
    );
}

export default memo(AnalyticalEntryInput);