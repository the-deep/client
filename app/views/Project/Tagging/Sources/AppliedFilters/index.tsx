import React, { useMemo } from 'react';
import {
    EntriesAsList,
    useFormObject,
    SetValueArg,
} from '@togglecorp/toggle-form';
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

import { PartialFormType, PartialEntriesFilterDataType } from '../SourcesFilter/schema';
import useFilterOptions,
{
    organizationTypeKeySelector,
    organizationTypeLabelSelector,
} from '../SourcesFilter/useFilterOptions';
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

interface DismissableDateRangeOutputProps<K, N> {
    label?: React.ReactNode;
    fromName: K;
    toName: N;
    fromValue?: string;
    toValue?: string;
    onDismissFromValue: (value: undefined, name: K) => void;
    onDismissToValue: (value: undefined, name: N) => void;
}

function DismissableDateRangeOutput<K, N>(
    props: DismissableDateRangeOutputProps<K, N>,
) {
    const {
        label,
        fromName,
        toName,
        fromValue,
        toValue,
        onDismissFromValue,
        onDismissToValue,
    } = props;

    const handleDismiss = React.useCallback(() => {
        onDismissFromValue(undefined, fromName);
        onDismissToValue(undefined, toName);
    }, [onDismissFromValue, onDismissToValue, fromName, toName]);

    if (hasNoData(fromValue) || hasNoData(toValue)) {
        return null;
    }

    const content = `${fromValue} - ${toValue}`;

    return (
        <DismissableTag
            label={label}
            name={fromName}
            onDismiss={handleDismiss}
        >
            {content}
        </DismissableTag>
    );
}
interface DismissableSelectOutputProps<D, V extends string | number, N> {
    label: React.ReactNode;
    name: N;
    value?: V;
    onDismiss: (value: undefined, name: N) => void;
    keySelector: (value: D) => V;
    labelSelector: (value: D) => string;
    options: D[] | undefined | null;
}

function DismissableSelectOutput<D, V extends string | number, N>(
    props: DismissableSelectOutputProps< D, V, N >,
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
        return labelMap?.[value];
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

const defaultValue: PartialEntriesFilterDataType = {
    filterableData: [],
};

interface EnumOption {
    name: string;
    description?: string | null | undefined
}

interface EntryFilterOutputProps<K> {
    name: K;
    value: PartialEntriesFilterDataType | undefined;
    onChange: (value: SetValueArg<PartialEntriesFilterDataType | undefined>, name: K) => void;
    entryTypeOptions?: EnumOption[] | null | undefined;
}

function EntryFilterOutput<K extends string>(
    props: EntryFilterOutputProps<K>,
) {
    const {
        name,
        value,
        onChange,
        entryTypeOptions,
    } = props;

    const setFieldValue = useFormObject(name, onChange, defaultValue);

    return (
        <>
            <DismissableDateRangeOutput
                fromName="createdAtGte"
                onDismissFromValue={setFieldValue}
                fromValue={value?.createdAtGte}
                toName="createdAtLte"
                onDismissToValue={setFieldValue}
                toValue={value?.createdAtLte}
                label="Entry Created At"
            />
            <DismissableBooleanOutput
                label="Entry Controlled Status"
                name="controlled"
                onDismiss={setFieldValue}
                value={value?.controlled}
            />
            <DismissableListOutput
                label="Entry Type"
                name="entryTypes"
                onDismiss={setFieldValue}
                value={value?.entryTypes}
                options={entryTypeOptions}
                labelSelector={enumLabelSelector}
                keySelector={enumKeySelector}
            />
        </>
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
        organizationTypeOptions,
        confidentialityOptions,
        entryTypeOptions,
        // hasEntryOptions,
        // hasAssessmentOptions,
        // frameworkFilters,
    } = useFilterOptions(projectId);

    return (
        <div className={styles.appliedFilters}>
            <DismissableListOutput
                label="Status"
                name="statuses"
                onDismiss={onChange}
                value={value.statuses}
                options={statusOptions}
                labelSelector={enumLabelSelector}
                keySelector={enumKeySelector}
            />
            <DismissableDateRangeOutput
                fromName="publishedOnGte"
                onDismissFromValue={onChange}
                fromValue={value.publishedOnGte}
                toName="publishedOnLte"
                onDismissToValue={onChange}
                toValue={value.publishedOnLte}
                label="Published On"
            />
            <DismissableDateRangeOutput
                fromName="createdAtGte"
                onDismissFromValue={onChange}
                fromValue={value.createdAtGte}
                toName="createdAtLte"
                onDismissToValue={onChange}
                toValue={value.createdAtLte}
                label="Source Created At"
            />
            <DismissableBooleanOutput
                label="Entries"
                name="hasEntries"
                onDismiss={onChange}
                trueLabel="Entries exist"
                falseLabel="Entries don't exist"
                value={value.hasEntries}
            />
            <DismissableBooleanOutput
                label="Assessment"
                name="hasAssessment"
                onDismiss={onChange}
                trueLabel="Has assessment"
                falseLabel="Has no assessment"
                value={value.hasAssessment}
            />
            <DismissableListOutput
                label="Priority"
                name="priorities"
                onDismiss={onChange}
                value={value.priorities}
                options={priorityOptions}
                labelSelector={enumLabelSelector}
                keySelector={enumKeySelector}
            />
            <DismissableListOutput
                label="Authoring Organization Type"
                name="authoringOrganizationTypes"
                onDismiss={onChange}
                options={organizationTypeOptions}
                keySelector={organizationTypeKeySelector}
                labelSelector={organizationTypeLabelSelector}
                value={value.authoringOrganizationTypes}
            />
            <DismissableSelectOutput
                label="Confidentiality"
                name="confidentiality"
                onDismiss={onChange}
                options={confidentialityOptions}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.confidentiality}
            />
            <EntryFilterOutput
                name="entriesFilterData"
                value={value.entriesFilterData}
                onChange={onChange}
                entryTypeOptions={entryTypeOptions}
            />
        </div>
    );
}

export default AppliedFilters;
