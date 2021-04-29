import React, { useMemo, useCallback, useContext } from 'react';
import { IoClose } from 'react-icons/io5';
import {
    DropContainer,
    DraggableContent,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    PartialForm,
    Error,
} from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import EntryItem from '../../EntryItem';
import EntryContext from '../../context';
import { AnalyticalEntryType } from '../../schema';
import { DroppedValue } from '../';

import styles from './styles.scss';

interface AnalyticalEntryInputProps {
    statementUuid: string;
    value: PartialForm<AnalyticalEntryType>;
    error: Error<AnalyticalEntryType> | undefined;
    // onChange: (value: PartialForm<AnalyticalEntryType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    onAnalyticalEntryDrop: (droppedValue: DroppedValue, dropOverEntryUuid: string) => void;
}

function AnalyticalEntryInput(props: AnalyticalEntryInputProps) {
    const {
        value,
        error,
        // onChange,
        onRemove,
        index,
        statementUuid,
        onAnalyticalEntryDrop,
    } = props;

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
            const typedVal = val as { entryId: number, statementUuid: string };
            onAnalyticalEntryDrop(typedVal, value.uuid);
        },
        [value, onAnalyticalEntryDrop],
    );

    const dragValue = useMemo(() => ({
        entryId: value.entry,
        statementUuid,
    }), [value.entry, statementUuid]);

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
            // TODO: disable this when entries count is greater than certain count
        >
            <DraggableContent
                className={styles.entry}
                name="entry"
                dropEffect="move"
                value={dragValue}
                onDragStart={setDragStart}
                onDragStop={setDragEnd}
            >
                {error?.$internal && (
                    <p>
                        {error.$internal}
                    </p>
                )}
                <QuickActionButton
                    name={index}
                    onClick={onRemove}
                    title={_ts('pillarAnalysis', 'removeAnalyticalEntryButtonTitle')}
                >
                    <IoClose />
                </QuickActionButton>
                {entry && (
                    <EntryItem
                        excerpt={entry.excerpt}
                        image={entry.image}
                        tabularFieldData={entry.tabularFieldData}
                        type={entry.entryType}
                    />
                )}
            </DraggableContent>
        </DropContainer>
    );
}

export default AnalyticalEntryInput;
