import React, { useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import {
    DropContainer,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    PartialForm,
    Error,
} from '@togglecorp/toggle-form';
import { randomString } from '@togglecorp/fujs';

import { AnalyticalEntryType } from '../../schema';

import styles from './styles.scss';

const ENTRIES_LIMIT = 50;

interface AnalyticalEntryInputProps {
    analyticalEntries?: PartialForm<AnalyticalEntryType>[];
    value: PartialForm<AnalyticalEntryType>;
    error: Error<AnalyticalEntryType> | undefined;
    // onChange: (value: PartialForm<AnalyticalEntryType>, index: number) => void;
    onRemove: (index: number) => void;
    onFieldChange: (list: PartialForm<AnalyticalEntryType>[], fieldName: 'analyticalEntries') => void;
    index: number;
}

function AnalyticalEntryInput(props: AnalyticalEntryInputProps) {
    const {
        value,
        error,
        // onChange,
        onRemove,
        index,
        analyticalEntries,
        onFieldChange,
    } = props;

    const handleAnalyticalEntryAdd = useCallback(
        (val: Record<string, unknown> | undefined) => {
            if (!val) {
                return;
            }
            const typedVal = val as { entryId: number };

            // NOTE: Don't add what is already added
            if (analyticalEntries?.find(item => item.entry === typedVal.entryId)) {
                return;
            }
            // NOTE: Don't let users add more that certain entries
            if ((analyticalEntries?.length ?? 0) >= ENTRIES_LIMIT) {
                return;
            }

            const uuid = randomString();
            const newAnalyticalEntry: PartialForm<AnalyticalEntryType> = {
                uuid,
                entry: typedVal.entryId,
                order: value.order ?? 0,
            };
            const currentIndex = analyticalEntries?.findIndex(v => v.uuid === value.uuid);
            const newAnalyticalEntries = [...(analyticalEntries ?? [])];
            newAnalyticalEntries.splice(currentIndex, 0, newAnalyticalEntry);
            const orderedEntries = newAnalyticalEntries.map((v, i) => ({ ...v, order: i }));
            onFieldChange(
                orderedEntries,
                'analyticalEntries' as const,
            );
        },
        [onFieldChange, analyticalEntries, value],
    );

    // const onFieldChange = useFormObject(index, value, onChange);

    return (
        <DropContainer
            className={styles.dropContainer}
            name="entry"
            onDrop={handleAnalyticalEntryAdd}
            dropOverlayContainerClassName={styles.overlay}
            draggedOverClassName={styles.draggedOver}
            contentClassName={styles.content}
            // TODO: disable this when entries count is greater than certain count
        >
            <div className={styles.entry}>
                {error?.$internal && (
                    <p>
                        {error.$internal}
                    </p>
                )}
                <h4>
                    {value.entry}
                </h4>
                <QuickActionButton
                    name={index}
                    onClick={onRemove}
                    // FIXME: use translation
                    title="Remove Analytical Entry"
                >
                    <IoClose />
                </QuickActionButton>
            </div>
        </DropContainer>
    );
}

export default AnalyticalEntryInput;
