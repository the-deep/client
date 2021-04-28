import React, { useCallback } from 'react';
import { GrDrag } from 'react-icons/gr';
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
    DropContainer,
    QuickActionButton,
    TextArea,
} from '@the-deep/deep-ui';
import {
    PartialForm,
    useFormArray,
    useFormObject,
    Error,
} from '@togglecorp/toggle-form';

import { AnalyticalStatementType, AnalyticalEntryType } from '../schema';
import AnalyticalEntryInput from './AnalyticalEntryInput';

import styles from './styles.scss';

const ENTRIES_LIMIT = 50;

interface AnalyticalStatementInputProps {
    className?: string;
    value: PartialForm<AnalyticalStatementType>;
    error: Error<AnalyticalStatementType> | undefined;
    onChange: (value: PartialForm<AnalyticalStatementType>, index: number) => void;
    onRemove: (index: number) => void;
    onEntryMove: (entryId: number, statementUuid: string) => void;
    index: number;
}

export interface DroppedValue {
    entryId: number;
    statementUuid?: string;
}

const defaultVal: AnalyticalStatementType = {
    uuid: '123',
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
        index,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultVal);

    const {
        // onValueChange: onAnalyticalEntryChange,
        onValueRemove: onAnalyticalEntryRemove,
    } = useFormArray('analyticalEntries', onFieldChange);

    type AnalyticalEntry = typeof value.analyticalEntries;

    const handleAnalyticalEntryDrop = useCallback(
        (dropValue: DroppedValue, dropOverEntryUuid?: string) => {
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

                    const uuid = randomString();
                    let newAnalyticalEntry: PartialForm<AnalyticalEntryType> = {
                        uuid,
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

                    if (dropOverEntryUuid) {
                        const currentIndex = newAnalyticalEntries
                            .findIndex(v => v.uuid === dropOverEntryUuid);
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
            if (isDefined(dropValue.statementUuid) && (dropValue.statementUuid !== value.uuid)) {
                // NOTE: Remove entry from old statement if it was moved from
                // one statement to another statement
                onEntryMove(dropValue.entryId, dropValue.statementUuid);
            }
        },
        [onFieldChange, value.analyticalEntries, value.order, onEntryMove, value.uuid],
    );

    const handleAnalyticalEntryAdd = useCallback(
        (val: Record<string, unknown> | undefined) => {
            if (!val) {
                return;
            }
            const typedVal = val as { entryId: number, statementUuid: string };
            handleAnalyticalEntryDrop(typedVal);
        },
        [handleAnalyticalEntryDrop],
    );

    return (
        <div className={_cs(styles.analyticalStatement, className)}>
            <div className={styles.upperContent}>
                <header className={styles.upperContentHeader}>
                    <div className={styles.leftHeaderContainer}>
                        <QuickActionButton name={undefined}>
                            <IoCheckmarkCircleSharp />
                        </QuickActionButton>
                        <QuickActionButton name={undefined}>
                            <BiBarChartSquare />
                        </QuickActionButton>
                    </div>
                    <QuickActionButton
                        className={styles.button}
                        name={index}
                        onClick={onRemove}
                        // FIXME: use translation
                        title="Remove Analytical Statement"
                    >
                        <IoClose />
                    </QuickActionButton>
                    <QuickActionButton
                        className={styles.button}
                        name={undefined}
                    >
                        <GrDrag />
                    </QuickActionButton>
                </header>
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
                            key={analyticalEntry.uuid}
                            index={myIndex}
                            statementUuid={value.uuid}
                            value={analyticalEntry}
                            // onChange={onAnalyticalEntryChange}
                            onRemove={onAnalyticalEntryRemove}
                            // eslint-disable-next-line max-len
                            error={error?.fields?.analyticalEntries?.members?.[analyticalEntry.uuid]}
                            onAnalyticalEntryDrop={handleAnalyticalEntryDrop}
                        />
                    ))}
                </div>
                <DropContainer
                    className={styles.dropContainer}
                    name="entry"
                    draggedOverClassName={styles.draggedOver}
                    onDrop={handleAnalyticalEntryAdd}
                    // TODO: disable this when entries count is greater than certain count
                />
            </div>
        </div>
    );
}

export default AnalyticalStatementInput;
