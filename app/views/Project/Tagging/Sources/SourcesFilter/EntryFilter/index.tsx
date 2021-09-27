import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';
import {
    DateRangeInput,
    MultiSelectInput,
    SelectInput,
    List,
} from '@the-deep/deep-ui';
import {
    useFormArray,
    useFormObject,
    SetValueArg,
} from '@togglecorp/toggle-form';
import {
    SourceFilterOptionsQuery,
    AnalysisFrameworkFilterType,
} from '#generated/types';
import { enumKeySelector, enumLabelSelector } from '#utils/common';

import FrameworkFilterItem from './FrameworkFilterItem';
import { PartialEntriesFilterDataType } from '..';
import styles from './styles.css';

const userKeySelector = (
    d: NonNullable<SourceFilterOptionsQuery['project']>['members'][number],
) => d.id;
const userLabelSelector = (
    d: NonNullable<SourceFilterOptionsQuery['project']>['members'][number],
) => d.displayName ?? `${d.firstName} ${d.lastName}`;
const filterKeySelector = (d: AnalysisFrameworkFilterType) => d.key;

interface ControlStatusOption {
    key: 'true' | 'false';
    value: string;
}
const optionLabelSelector = (d: ControlStatusOption) => d.value;
const optionKeySelector = (d: ControlStatusOption) => d.key;

const controlledStatusOptions: ControlStatusOption[] = [
    {
        key: 'true',
        value: 'Controlled',
    },
    {
        key: 'false',
        value: 'Not controlled',
    },
];

const defaultValue: PartialEntriesFilterDataType = {
    filterableData: [],
};

interface Props<K extends string> {
    name: K;
    value: PartialEntriesFilterDataType | undefined;
    onChange: (value: SetValueArg<PartialEntriesFilterDataType | undefined>, name: K) => void;
    projectId: string;
    optionsDisabled: boolean;
    options?: SourceFilterOptionsQuery;
    disabled?: boolean;
    className?: string;
}

function EntryFilter<K extends string>(props: Props<K>) {
    const {
        name,
        value,
        onChange,
        options,
        projectId,
        disabled,
        className,
        optionsDisabled,
    } = props;

    const setFieldValue = useFormObject(name, onChange, defaultValue);
    const {
        setValue: onFrameworkFilterChange,
    } = useFormArray('filterableData', setFieldValue);

    const filterValuesMap = useMemo(() => (
        listToMap(
            value?.filterableData ?? [],
            (d) => d.filterKey,
            (d, _, i) => ({
                index: i,
                value: d,
            }),
        )
    ), [value?.filterableData]);

    const framewonrkFilterRendererParams = useCallback(
        (key: string, data: AnalysisFrameworkFilterType) => {
            const filterValue = filterValuesMap[key];
            return {
                name: filterValue?.index,
                title: data.title,
                value: filterValue?.value,
                filter: data,
                projectId,
                onChange: onFrameworkFilterChange,
                optionsDisabled,
                disabled,
            };
        },
        [
            onFrameworkFilterChange,
            optionsDisabled,
            disabled,
            filterValuesMap,
            projectId,
        ],
    );

    return (
        <div className={_cs(className, styles.entryFilter)}>
            <MultiSelectInput
                className={styles.input}
                name="createdBy"
                value={value?.createdBy}
                onChange={setFieldValue} // FIXME: fix type issue
                keySelector={userKeySelector}
                labelSelector={userLabelSelector}
                options={options?.project?.members}
                label="Entry created by"
                placeholder="Entry created by"
                disabled={disabled || optionsDisabled}
            />
            <DateRangeInput
                className={styles.input}
                name="createdAt"
                label="Entry created at"
                value={value?.createdAt}
                onChange={setFieldValue}
                disabled={disabled}
            />
            <SelectInput
                className={styles.input}
                name="commentStatus"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value?.commentStatus}
                onChange={setFieldValue}
                options={options?.commentStatusOptions?.enumValues}
                label="Entry comment status"
                placeholder="Entry comment status"
                disabled={disabled || optionsDisabled}
            />
            <SelectInput
                className={styles.input}
                name="controlled"
                value={value?.controlled}
                onChange={setFieldValue}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={controlledStatusOptions}
                label="Entry controlled status"
                placeholder="Entry controlled status"
                disabled={disabled}
            />
            <MultiSelectInput
                className={styles.input}
                name="entryTypes"
                value={value?.entryTypes}
                onChange={setFieldValue} // FIXME: fix type issue
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                options={options?.entryTypeOptions?.enumValues}
                disabled={disabled || optionsDisabled}
                label="Entry type"
                placeholder="Entry type"
            />
            <List
                data={options?.project?.analysisFramework?.filters ?? undefined}
                keySelector={filterKeySelector}
                renderer={FrameworkFilterItem}
                rendererClassName={styles.input}
                rendererParams={framewonrkFilterRendererParams}
            />
        </div>
    );
}

export default EntryFilter;
