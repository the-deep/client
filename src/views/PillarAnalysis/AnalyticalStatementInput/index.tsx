import React, { useCallback } from 'react';
import { GrDrag } from 'react-icons/gr';
import { BiBarChartSquare } from 'react-icons/bi';
import {
    IoClose,
    IoCheckmarkCircleSharp,
} from 'react-icons/io5';
import { _cs, randomString } from '@togglecorp/fujs';
import {
    QuickActionButton,
    TextArea,
    DropContainer,
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

// This is an aribitrary number
const ENTRIES_LIMIT = 50;

interface AnalyticalStatementInputProps {
   className?: string;
   value: PartialForm<AnalyticalStatementType>;
   error: Error<AnalyticalStatementType> | undefined;
   onChange: (value: PartialForm<AnalyticalStatementType>, index: number) => void;
   onRemove: (index: number) => void;
   index: number;
}

function AnalyticalStatementInput(props: AnalyticalStatementInputProps) {
    const {
        className,
        value,
        error,
        onChange,
        onRemove,
        index,
    } = props;

    const onFieldChange = useFormObject(index, value, onChange);

    const {
        // onValueChange: onAnalyticalEntryChange,
        onValueRemove: onAnalyticalEntryRemove,
    } = useFormArray('analyticalEntries', value.analyticalEntries ?? [], onFieldChange);

    const handleAnalyticalEntryAdd = useCallback(
        (val: Record<string, unknown> | undefined) => {
            if (!val) {
                return;
            }
            const typedVal = val as { entryId: number };

            // NOTE: Don't add what is already added
            if (value.analyticalEntries?.find(item => item.entry === typedVal.entryId)) {
                return;
            }
            // NOTE: Don't let users add more that certain entries
            if ((value.analyticalEntries?.length ?? 0) >= ENTRIES_LIMIT) {
                return;
            }

            const uuid = randomString();
            const newAnalyticalEntry: PartialForm<AnalyticalEntryType> = {
                uuid,
                entry: typedVal.entryId,
                // FIXME: add order
                order: 0,
            };
            onFieldChange(
                [newAnalyticalEntry, ...(value.analyticalEntries ?? [])],
                'analyticalEntries' as const,
            );
        },
        [onFieldChange, value.analyticalEntries],
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
            <DropContainer
                className={styles.entryContainer}
                name="entry"
                onDrop={handleAnalyticalEntryAdd}
                // TODO: disable this when entries count is greater than certain count
            >
                {value.analyticalEntries?.map((analyticalEntry, myIndex) => (
                    <AnalyticalEntryInput
                        key={analyticalEntry.uuid}
                        index={myIndex}
                        value={analyticalEntry}
                        // onChange={onAnalyticalEntryChange}
                        onRemove={onAnalyticalEntryRemove}
                        // eslint-disable-next-line max-len
                        error={error?.fields?.analyticalEntries?.members?.[analyticalEntry.uuid]}
                    />
                ))}
            </DropContainer>
        </div>
    );
}

export default AnalyticalStatementInput;
