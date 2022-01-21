import React, { useCallback } from 'react';
import {
    IoClose,
    IoCheckmarkCircleSharp,
    IoEllipseOutline,
    IoBarChartSharp,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';

import {
    _cs,
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    Container,
    DropContainer,
    QuickActionButton,
    TextArea,
} from '@the-deep/deep-ui';
import {
    useFormArray,
    useFormObject,
    SetValueArg,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { useModalState } from '#hooks/stateManagement';
import NonFieldError from '#components/NonFieldError';
import { Attributes, Listeners } from '#components/SortableList';
import { reorder, genericMemo } from '#utils/common';

import {
    AnalyticalStatementType,
    PartialAnalyticalEntryType,
    PartialAnalyticalStatementType,
} from '../schema';
import AnalyticalEntryInput from './AnalyticalEntryInput';

import AnalyticalNGramsModal from './AnalyticalNGramsModal';
import styles from './styles.css';

export const ENTRIES_LIMIT = 50;

export interface DroppedValue {
    entryId: string;
    statementClientId?: string;
}

export interface AnalyticalStatementInputProps {
    className?: string;
    value: PartialAnalyticalStatementType;
    error: Error<AnalyticalStatementType> | undefined;
    onChange: (value: SetValueArg<PartialAnalyticalStatementType>, index: number) => void;
    onRemove: (index: number) => void;
    onEntryMove: (entryId: string, statementClientId: string) => void;
    onEntryDrop: (entryId: string) => void;
    index: number;
    isBeingDragged?: boolean;
    attributes?: Attributes;
    listeners?: Listeners;
    onSelectedNgramChange: (item: string | undefined) => void;
}

const defaultVal = (): AnalyticalStatementType => ({
    clientId: randomString(),
    analyticalEntries: [],
});

function AnalyticalStatementInput(props: AnalyticalStatementInputProps) {
    const {
        className,
        value,
        error: riskyError,
        onChange,
        onRemove,
        onEntryMove,
        onEntryDrop,
        index,
        attributes,
        listeners,
        onSelectedNgramChange,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultVal);

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.analyticalEntries);
    const [
        showAnalysisChart,,
        hideAnalysisChart,,
        toggleAnalysisChart,
    ] = useModalState(false);

    const {
        // setValue: onAnalyticalEntryChange,
        removeValue: onAnalyticalEntryRemove,
    } = useFormArray('analyticalEntries', onFieldChange);

    type AnalyticalEntry = typeof value.analyticalEntries;

    const handleAnalyticalEntryDrop = useCallback(
        (dropValue: DroppedValue, dropOverEntryClientId?: string) => {
            onFieldChange(
                (oldEntries: AnalyticalEntry) => {
                    // NOTE: Treat moved item as a new item by removing the old one and
                    // adding the new one again
                    const movedItem = value.analyticalEntries
                        ?.find((item) => item.entry === +dropValue.entryId);

                    // NOTE: Don't let users add more that certain items
                    if (
                        isNotDefined(movedItem)
                        && (value.analyticalEntries?.length ?? 0) >= ENTRIES_LIMIT
                    ) {
                        return oldEntries;
                    }

                    const newAnalyticalEntries = [...(oldEntries ?? [])];

                    const clientId = randomString();
                    let newAnalyticalEntry: PartialAnalyticalEntryType = {
                        clientId,
                        entry: +dropValue.entryId,
                        order: value.order ?? 1,
                    };

                    if (value.analyticalEntries && isDefined(movedItem)) {
                        newAnalyticalEntry = {
                            ...movedItem,
                            order: value.order ?? 1,
                        };
                        const movedItemOldIndex = value.analyticalEntries
                            .findIndex((item) => item.entry === +dropValue.entryId);
                        newAnalyticalEntries.splice(movedItemOldIndex, 1);
                    }

                    if (dropOverEntryClientId) {
                        const currentIndex = newAnalyticalEntries
                            .findIndex((v) => v.clientId === dropOverEntryClientId);
                        newAnalyticalEntries.splice(currentIndex, 0, newAnalyticalEntry);
                    } else {
                        newAnalyticalEntries.push(newAnalyticalEntry);
                    }

                    // NOTE: After the newly added entry's order is set and
                    // placed in the desired index, we can change the order of
                    // whole list in bulk
                    return reorder(newAnalyticalEntries);
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
            const typedVal = val as { entryId: string, statementClientId: string };
            handleAnalyticalEntryDrop(typedVal);
        },
        [handleAnalyticalEntryDrop],
    );

    const handleIncludeInReportChange = useCallback(() => {
        onFieldChange((oldVal?: boolean) => !oldVal, 'includeInReport' as const);
    }, [onFieldChange]);

    const handleStatementChange = useCallback((newStatementVal: string | undefined) => {
        onFieldChange(newStatementVal, 'statement');
    }, [onFieldChange]);

    return (
        <Container
            className={_cs(styles.analyticalStatementInput, className)}
            contentClassName={styles.dragContent}
            headerClassName={styles.header}
            headerDescription={(
                <div className={styles.headerDescription}>
                    <NonFieldError error={error} />
                    <TextArea
                        className={styles.statement}
                        // FIXME: use translation
                        placeholder="Enter analytical statement"
                        name="statement"
                        rows={4}
                        value={value.statement}
                        onChange={onFieldChange}
                        error={error?.statement}
                    />
                </div>
            )}
            headerIcons={(
                <>
                    <QuickActionButton
                        title="Include in report"
                        name="includeInReport"
                        onClick={handleIncludeInReportChange}
                        big
                    >
                        {(value.includeInReport
                            ? <IoCheckmarkCircleSharp />
                            : <IoEllipseOutline />
                        )}
                    </QuickActionButton>
                    <QuickActionButton
                        name="View n-grams analysis"
                        onClick={toggleAnalysisChart}
                        big
                    >
                        <IoBarChartSharp />
                    </QuickActionButton>
                </>
            )}
            // actionsContainerClassName={styles.actionsContainer}
            headerActions={(
                <>
                    <QuickActionButton
                        name={index}
                        onClick={onRemove}
                        // FIXME: use translation
                        title="Remove Analytical Statement"
                    >
                        <IoClose />
                    </QuickActionButton>
                    <QuickActionButton
                        name={index}
                        // FIXME: use translation
                        title="Drag"
                        {...attributes}
                        {...listeners}
                    >
                        <GrDrag />
                    </QuickActionButton>
                </>
            )}
        >
            <div className={styles.entryContainer}>
                {value.analyticalEntries?.map((analyticalEntry, myIndex) => (
                    <AnalyticalEntryInput
                        key={analyticalEntry.clientId}
                        index={myIndex}
                        statementClientId={value.clientId}
                        value={analyticalEntry}
                        // onChange={onAnalyticalEntryChange}
                        onRemove={onAnalyticalEntryRemove}
                        error={arrayError?.[analyticalEntry.clientId]}
                        onAnalyticalEntryDrop={handleAnalyticalEntryDrop}
                    />
                ))}
            </div>
            {showAnalysisChart && (
                <AnalyticalNGramsModal
                    onModalClose={hideAnalysisChart}
                    mainStatement={value.statement}
                    onStatementChange={handleStatementChange}
                    statementId={value.clientId}
                    analyticalEntries={value.analyticalEntries}
                    onNgramClick={onSelectedNgramChange}
                />
            )}
            <DropContainer
                className={styles.dropContainer}
                name="entry"
                draggedOverClassName={styles.draggedOver}
                onDrop={handleAnalyticalEntryAdd}
            />
        </Container>
    );
}

export default genericMemo(AnalyticalStatementInput);
