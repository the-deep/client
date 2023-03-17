import React, { memo, useState, useMemo, useCallback, useContext } from 'react';
import {
    IoTrash,
    IoPeopleCircleOutline,
    IoPencilOutline,
    IoRepeat,
} from 'react-icons/io5';
import {
    DropContainer,
    DraggableContent,
    QuickActionButton,
    DateOutput,
    // useBooleanState,
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
    statementClientId: string | undefined;
    value: PartialAnalyticalEntryType;
    error: Error<AnalyticalEntryType> | undefined;
    // onChange: (value: PartialAnalyticalEntryType, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    onAnalyticalEntryDrop: (
        droppedValue: DroppedValue,
        dropOverEntryClientId: string | undefined,
    ) => void;
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

    const [
        entryCardFlipped,
        setEntryCardFlipped,
    ] = useState<boolean>(false);

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

    const authorName = entry?.lead.authors?.[0]?.shortName ?? '';
    const entryDate = entry?.createdAt;

    // const onFieldChange = useFormObject(index, value, onChange);
    const handleEntryCardFlip = useCallback(() => {
        setEntryCardFlipped((oldVal) => !oldVal);
    }, []);

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
                className={_cs(
                    styles.entry,
                    entryDraggedStatus && styles.isBeingDragged,
                )}
                name="entry"
                dropEffect="move"
                value={dragValue}
                onDragStart={setDragStart}
                onDragStop={setDragEnd}
                contentClassName={styles.content}
                headerIcons={(
                    <>
                        <IoPeopleCircleOutline />
                        {authorName}
                    </>
                )}
                heading={(
                    <DateOutput
                        value={entryDate}
                    />
                )}
                headingClassName={styles.heading}
                headingSectionClassName={styles.headingSection}
                headingContainerClassName={styles.headingContainer}
                headingSize="extraSmall"
                headerActions={(
                    <>
                        <QuickActionButton
                            name={undefined}
                            onClick={() => console.log('here')}
                            variant="transparent"
                        >
                            <IoPencilOutline />
                        </QuickActionButton>
                        <QuickActionButton
                            name={index}
                            onClick={onRemove}
                            title={_ts('pillarAnalysis', 'removeAnalyticalEntryButtonTitle')}
                            variant="transparent"
                        >
                            <IoTrash />
                        </QuickActionButton>
                        <QuickActionButton
                            name={undefined}
                            onClick={handleEntryCardFlip}
                            title="flip"
                            variant="transparent"
                        >
                            <IoRepeat />
                        </QuickActionButton>
                    </>
                )}
            >
                <NonFieldError error={error} />
                <NonFieldError error={error?.entry} />
                {entry && !entryCardFlipped && (
                    <ExcerptInput
                        className={styles.excerpt}
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
