import React, { useMemo, useCallback } from 'react';
import { BiBarChartSquare } from 'react-icons/bi';
import {
    IoClose,
    IoCheckmarkCircleSharp,
} from 'react-icons/io5';
import {
    _cs,
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    DraggableContent,
    DropContainer,
    QuickActionButton,
    TextArea,
} from '@the-deep/deep-ui';
import {
    useFormArray,
    useFormObject,
    StateArg,
    Error,
} from '@togglecorp/toggle-form';

import { useModalState } from '#hooks/stateManagement';
import {
    AnalyticalStatementType,
    PartialAnalyticalEntryType,
    PartialAnalyticalStatementType,
} from '../schema';
import AnalyticalEntryInput from './AnalyticalEntryInput';

import styles from './styles.scss';

const ENTRIES_LIMIT = 50;

export interface DroppedValue {
    entryId: number;
    statementClientId?: string;
}

interface AnalyticalStatementInputProps {
    className?: string;
    value: PartialAnalyticalStatementType;
    error: Error<AnalyticalStatementType> | undefined;
    onChange: (value: StateArg<PartialAnalyticalStatementType>, index: number) => void;
    onRemove: (index: number) => void;
    onEntryMove: (entryId: number, statementClientId: string) => void;
    onEntryDrop: (entryId: number) => void;
    index: number;
    onStatementDraggedStatusChange: (newStatus: boolean) => void;
    statementDraggedStatus: boolean;
    onAnalyticalStatementDrop: (droppedStatement: string, currentStatement: string) => void;
}

const defaultVal: AnalyticalStatementType = {
    clientId: '123',
    analyticalEntries: [],
};

function AnalyticalStatementInput(props: AnalyticalStatementInputProps) {
    const {
        className,
        value,
        error,
        onChange,
        onRemove,
        onEntryMove,
        onEntryDrop,
        index,
        onStatementDraggedStatusChange,
        statementDraggedStatus,
        onAnalyticalStatementDrop,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultVal);

    const [
        currentStatementDraggedStatus,
        setDragStart,
        setDragEnd,
    ] = useModalState(false);

    const {
        // onValueChange: onAnalyticalEntryChange,
        onValueRemove: onAnalyticalEntryRemove,
    } = useFormArray('analyticalEntries', onFieldChange);

    type AnalyticalEntry = typeof value.analyticalEntries;

    const handleAnalyticalEntryDrop = useCallback(
        (dropValue: DroppedValue, dropOverEntryClientId?: string) => {
            onFieldChange(
                (oldEntries: AnalyticalEntry) => {
                    // NOTE: Treat moved item as a new item by removing the old one and
                    // adding the new one again
                    const movedItem = value.analyticalEntries
                        ?.find(item => item.entry === dropValue.entryId);

                    // NOTE: Don't let users add more that certain entries
                    if (
                        isNotDefined(movedItem)
                        && (value?.analyticalEntries?.length ?? 0) >= ENTRIES_LIMIT
                    ) {
                        return oldEntries;
                    }

                    const newAnalyticalEntries = [...(oldEntries ?? [])];

                    const clientId = randomString();
                    let newAnalyticalEntry: PartialAnalyticalEntryType = {
                        clientId,
                        entry: dropValue.entryId,
                        order: value.order ?? 0,
                    };

                    if (value.analyticalEntries && isDefined(movedItem)) {
                        newAnalyticalEntry = {
                            ...movedItem,
                            order: value.order ?? 0,
                        };
                        const movedItemOldIndex = value.analyticalEntries
                            .findIndex(item => item.entry === dropValue.entryId);
                        newAnalyticalEntries.splice(movedItemOldIndex, 1);
                    }

                    if (dropOverEntryClientId) {
                        const currentIndex = newAnalyticalEntries
                            .findIndex(v => v.clientId === dropOverEntryClientId);
                        newAnalyticalEntries.splice(currentIndex, 0, newAnalyticalEntry);
                    } else {
                        newAnalyticalEntries.push(newAnalyticalEntry);
                    }

                    // NOTE: After the newly added entry's order is set and
                    // placed in the desired index, we can change the order of
                    // whole list in bulk
                    return newAnalyticalEntries.map((v, i) => ({ ...v, order: i }));
                },
                'analyticalEntries' as const,
            );
            if (
                isDefined(dropValue.statementClientId)
                && (dropValue.statementClientId !== value.clientId)
            ) {
                // NOTE: Remove entry from old statement if it was moved from
                // one statement to another statement
                onEntryMove(dropValue.entryId, dropValue.statementClientId);
            }
            onEntryDrop(dropValue.entryId);
        },
        [
            onEntryDrop, onFieldChange, onEntryMove,
            value.analyticalEntries, value.order, value.clientId,
        ],
    );

    const handleAnalyticalEntryAdd = useCallback(
        (val: Record<string, unknown> | undefined) => {
            if (!val) {
                return;
            }
            const typedVal = val as { entryId: number, statementClientId: string };
            handleAnalyticalEntryDrop(typedVal);
        },
        [handleAnalyticalEntryDrop],
    );

    const dragValue = useMemo(() => ({
        statementClientId: value.clientId,
    }), [value.clientId]);

    const handleAnalyticalStatementDrop = useCallback(
        (val: Record<string, unknown> | undefined) => {
            if (!val) {
                return;
            }
            const typedVal = val as { statementClientId: string };
            onAnalyticalStatementDrop(typedVal.statementClientId, value.clientId);
        },
        [value.clientId, onAnalyticalStatementDrop],
    );

    const handleStatementDragStart = useCallback(() => {
        setDragStart();
        onStatementDraggedStatusChange(true);
    }, [setDragStart, onStatementDraggedStatusChange]);

    const handleStatementDragEnd = useCallback(() => {
        setDragEnd();
        onStatementDraggedStatusChange(false);
    }, [setDragEnd, onStatementDraggedStatusChange]);

    return (
        <DropContainer
            className={_cs(
                styles.dropContainer,
                currentStatementDraggedStatus && styles.hide,
            )}
            name="statement"
            // NOTE: Disabled drop on the same entry which is being dragged
            onDrop={!currentStatementDraggedStatus ? handleAnalyticalStatementDrop : undefined}
            dropOverlayContainerClassName={styles.overlay}
            draggedOverClassName={styles.draggedOver}
            contentClassName={styles.content}
            disabled={!statementDraggedStatus}
            // TODO: disable this when entries count is greater than certain count
        >
            <DraggableContent
                name="statement"
                dropEffect="move"
                value={dragValue}
                onDragStart={handleStatementDragStart}
                onDragStop={handleStatementDragEnd}
                className={styles.dragStatement}
                contentClassName={styles.dragContent}
                headerClassName={styles.header}
                headerIcons={(
                    <>
                        <QuickActionButton
                            className={styles.button}
                            name={undefined}
                            disabled
                        >
                            <IoCheckmarkCircleSharp />
                        </QuickActionButton>
                        <QuickActionButton
                            className={styles.button}
                            name={undefined}
                            disabled
                        >
                            <BiBarChartSquare />
                        </QuickActionButton>
                    </>
                )}
                // actionsContainerClassName={styles.actionsContainer}
                headerActions={(
                    <QuickActionButton
                        className={styles.button}
                        name={index}
                        onClick={onRemove}
                        // FIXME: use translation
                        title="Remove Analytical Statement"
                    >
                        <IoClose />
                    </QuickActionButton>
                )}
            >
                <div className={_cs(styles.analyticalStatement, className)}>
                    <div className={styles.upperContent}>
                        {error?.$internal && (
                            <p className={styles.error}>
                                {error.$internal}
                            </p>
                        )}
                        <TextArea
                            className={styles.statement}
                            // FIXME: use translation
                            placeholder="Enter analytical statement"
                            name="statement"
                            rows={4}
                            value={value.statement}
                            onChange={onFieldChange}
                            error={error?.fields?.statement}
                        />
                    </div>
                    <div className={styles.bottomContainer}>
                        <div className={styles.entryContainer}>
                            {value.analyticalEntries?.map((analyticalEntry, myIndex) => (
                                <AnalyticalEntryInput
                                    key={analyticalEntry.clientId}
                                    index={myIndex}
                                    statementClientId={value.clientId}
                                    value={analyticalEntry}
                                    // onChange={onAnalyticalEntryChange}
                                    onRemove={onAnalyticalEntryRemove}
                                    // eslint-disable-next-line max-len
                                    error={error?.fields?.analyticalEntries?.members?.[analyticalEntry.clientId]}
                                    onAnalyticalEntryDrop={handleAnalyticalEntryDrop}
                                    dropDisabled={statementDraggedStatus}
                                />
                            ))}
                        </div>
                        <DropContainer
                            className={styles.dropContainer}
                            name="entry"
                            draggedOverClassName={styles.draggedOver}
                            onDrop={handleAnalyticalEntryAdd}
                            disabled={statementDraggedStatus}
                            // TODO: disable this when entries count is greater than certain count
                        />
                    </div>
                </div>
            </DraggableContent>
        </DropContainer>
    );
}

export default AnalyticalStatementInput;
