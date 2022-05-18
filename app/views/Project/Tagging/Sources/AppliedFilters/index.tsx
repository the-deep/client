import React, { useMemo } from 'react';
import { EntriesAsList } from '@togglecorp/toggle-form';
import {
    Tag,
    TagProps,
    Button,
} from '@the-deep/deep-ui';
import { IoClose } from 'react-icons/io5';
import {
    _cs,
    listToMap,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    enumKeySelector,
    enumLabelSelector,
    hasNoData,
} from '#utils/common';

import { PartialFormType } from '../SourcesFilter/schema';
import useFilterOptions from '../SourcesFilter/useFilterOptions';
import styles from './styles.css';

interface DismissableTagProps<T> extends TagProps {
    label?: React.ReactNode;
    name: T,
    onDismiss: (value: undefined, name: T) => void;
}

function DismissableTag<T>(props: DismissableTagProps<T>) {
    const {
        name,
        label,
        className,
        onDismiss,
        actions,
        ...otherProps
    } = props;

    const handleDismiss = React.useCallback(() => {
        onDismiss(undefined, name);
    }, [name, onDismiss]);

    return (
        <div className={_cs(styles.dismissableTag, className)}>
            <div className={styles.label}>
                {label}
            </div>
            <Tag
                {...otherProps}
                className={styles.tag}
                actions={(
                    <>
                        {actions}
                        <Button
                            name={name}
                            onClick={handleDismiss}
                            variant="action"
                        >
                            <IoClose />
                        </Button>
                    </>
                )}
            />
        </div>
    );
}

interface DismissableBooleanOutputProps<T> {
    label?: React.ReactNode;
    trueLabel: string;
    falseLabel: string;
    value?: boolean;
    name: T;
    onDismiss: (value: undefined, name: T) => void;
}
function DismissableBooleanOutput<T>(props: DismissableBooleanOutputProps<T>) {
    const {
        label,
        trueLabel,
        falseLabel,
        value,
        name,
        onDismiss,
    } = props;

    if (value === true) {
        return (
            <DismissableTag
                label={label}
                name={name}
                onDismiss={onDismiss}
            >
                {trueLabel}
            </DismissableTag>
        );
    }

    if (value === false) {
        return (
            <DismissableTag
                label={label}
                name={name}
                onDismiss={onDismiss}
            >
                {falseLabel}
            </DismissableTag>
        );
    }

    return null;
}

interface DismissableListOutputProps<D, V extends string | number, N> {
    label?: React.ReactNode;
    value: V[] | undefined;
    name: N;
    onDismiss: (value: undefined, name: N) => void;
    keySelector: (value: D) => V;
    labelSelector: (value: D) => string;
    options: D[] | undefined | null;
}
function DismissableListOutput<D, V extends string | number, N>(
    props: DismissableListOutputProps<D, V, N>,
) {
    const {
        name,
        value,
        onDismiss,
        label,
        labelSelector,
        keySelector,
        options,
    } = props;

    const labelMap = useMemo(() => (
        listToMap(options, keySelector, labelSelector)
    ), [options, keySelector, labelSelector]);

    const content = useMemo(() => {
        if (isNotDefined(value)) {
            return undefined;
        }

        return value?.map((val) => labelMap?.[val])?.join(', ');
    }, [value, labelMap]);

    if (hasNoData(value)) {
        return null;
    }

    return (
        <DismissableTag
            label={label}
            name={name}
            onDismiss={onDismiss}
        >
            {content}
        </DismissableTag>
    );
}

interface Props {
    value: PartialFormType;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
    projectId: string;
}

function AppliedFilters(props: Props) {
    const {
        value,
        onChange,
        projectId,
    } = props;

    const {
        statusOptions,
        priorityOptions,
        // confidentialityOptions,
        // organizationTypeOptions,
        // hasEntryOptions,
        // hasAssessmentOptions,
        // entryTypeOptions,
        // frameworkFilters,
    } = useFilterOptions(projectId);

    return (
        <div className={styles.appliedFilters}>
            <DismissableBooleanOutput
                label="Entries"
                name="hasEntries"
                onDismiss={onChange}
                trueLabel="Entries exist"
                falseLabel="Entries don't exist"
                value={value?.hasEntries}
            />
            <DismissableBooleanOutput
                label="Assessment"
                name="hasAssessment"
                onDismiss={onChange}
                trueLabel="Has assessment"
                falseLabel="Has no assessment"
                value={value?.hasAssessment}
            />
            <DismissableListOutput
                label="Status"
                name="statuses"
                onDismiss={onChange}
                value={value?.statuses}
                options={statusOptions}
                labelSelector={enumLabelSelector}
                keySelector={enumKeySelector}
            />
            <DismissableListOutput
                label="Priority"
                name="priorities"
                onDismiss={onChange}
                value={value?.priorities}
                options={priorityOptions}
                labelSelector={enumLabelSelector}
                keySelector={enumKeySelector}
            />
        </div>
    );
}

export default AppliedFilters;
