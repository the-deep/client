import React, { useCallback } from 'react';
import { GrDrag } from 'react-icons/gr';
import { BiBarChartSquare } from 'react-icons/bi';
import {
    IoClose,
    IoAdd,
    IoCheckmarkCircleSharp,
} from 'react-icons/io5';
import { _cs, randomString } from '@togglecorp/fujs';
import {
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
        () => {
            const uuid = randomString();
            const newAnalyticalEntry: PartialForm<AnalyticalEntryType> = {
                uuid,
                // FIXME: add order
                order: 0,
                entry: Math.ceil(Math.random() * 100),
            };
            onFieldChange(
                [...(value.analyticalEntries ?? []), newAnalyticalEntry],
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
                        <QuickActionButton>
                            <IoCheckmarkCircleSharp />
                        </QuickActionButton>
                        <QuickActionButton>
                            <BiBarChartSquare />
                        </QuickActionButton>
                    </div>
                    <QuickActionButton
                        className={styles.button}
                        name={index}
                        onClick={onRemove}
                        title="Remove Analytical Statement"
                    >
                        <IoClose />
                    </QuickActionButton>
                    <QuickActionButton
                        className={styles.button}
                    >
                        <GrDrag />
                    </QuickActionButton>
                </header>
                {error?.$internal && (
                    <p className={styles.error}>
                        {error?.$internal}
                    </p>
                )}
                <TextArea
                    className={styles.statement}
                    placeholder="Enter analytical statement"
                    name="statement"
                    rows={4}
                    value={value.statement}
                    onChange={onFieldChange}
                    error={error?.fields?.statement}
                />
            </div>
            <div className={styles.entryContainer}>
                <QuickActionButton
                    className={styles.entryAddButton}
                    name={undefined}
                    onClick={handleAnalyticalEntryAdd}
                    title="Simulate Entry Drop"
                >
                    <IoAdd />
                </QuickActionButton>
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
            </div>
        </div>
    );
}

export default AnalyticalStatementInput;
