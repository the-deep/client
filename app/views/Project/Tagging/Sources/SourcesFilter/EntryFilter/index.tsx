import React, { useMemo, useState } from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';
import {
    TextInput,
    DateDualRangeInput,
    MultiSelectInput,
} from '@the-deep/deep-ui';
import { IoSearch } from 'react-icons/io5';
import {
    useFormArray,
    useFormObject,
    SetValueArg,
} from '@togglecorp/toggle-form';
import {
    hasNoData,
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import ProjectMemberMultiSelectInput, { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import BooleanInput, { Option } from '#components/selections/BooleanInput';

import FrameworkFilterItem from './FrameworkFilterItem';
import { SourceFilterOptions } from '../types';

import { PartialEntriesFilterDataType } from '../schema';

import styles from './styles.css';

const controlledStatusOptions: Option[] = [
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
    allFiltersVisible: boolean;
    entryTypeOptions?: NonNullable<SourceFilterOptions['entryTypeOptions']>['enumValues'];
    frameworkFilters?: NonNullable<NonNullable<SourceFilterOptions['project']>['analysisFramework']>['filters'];
    disabled?: boolean;
}

function EntryFilter<K extends string>(props: Props<K>) {
    const {
        name,
        value,
        onChange,
        projectId,
        disabled,
        allFiltersVisible,
        optionsDisabled,
        entryTypeOptions,
        frameworkFilters,
    } = props;

    const setFieldValue = useFormObject(name, onChange, defaultValue);

    const [members, setMembers] = useState<ProjectMember[] | undefined | null>();

    type FilterableData = NonNullable<PartialEntriesFilterDataType['filterableData']>[number];

    const {
        setValue: onFrameworkFilterChange,
    } = useFormArray<'filterableData', FilterableData>('filterableData', setFieldValue);

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

    return (
        <>
            <TextInput
                variant="general"
                className={styles.input}
                icons={<IoSearch />}
                name="search"
                onChange={setFieldValue}
                value={value?.search}
                disabled={disabled}
                label="Excerpt Search"
            />
            <ProjectMemberMultiSelectInput
                variant="general"
                className={_cs(
                    styles.input,
                    (hasNoData(value?.createdBy) && !allFiltersVisible)
                    && styles.hidden,
                )}
                name="createdBy"
                projectId={projectId}
                value={value?.createdBy}
                onChange={setFieldValue}
                options={members}
                onOptionsChange={setMembers}
                label="Entry Created By"
                disabled={disabled}
            />
            <DateDualRangeInput
                variant="general"
                className={_cs(
                    styles.input,
                    hasNoData(value?.createdAtGte)
                        && hasNoData(value?.createdAtLte)
                        && !allFiltersVisible
                        && styles.hidden,
                )}
                fromName="createdAtGte"
                fromOnChange={setFieldValue}
                fromValue={value?.createdAtGte}
                toName="createdAtLte"
                toOnChange={setFieldValue}
                toValue={value?.createdAtLte}
                disabled={disabled}
                label="Entry Created At"
            />
            <BooleanInput
                variant="general"
                className={_cs(
                    styles.input,
                    (hasNoData(value?.controlled) && !allFiltersVisible)
                    && styles.hidden,
                )}
                options={controlledStatusOptions}
                name="controlled"
                value={value?.controlled}
                onChange={setFieldValue}
                label="Entry Controlled Status"
                disabled={disabled}
            />
            <MultiSelectInput
                variant="general"
                className={_cs(
                    styles.input,
                    (hasNoData(value?.entryTypes) && !allFiltersVisible)
                    && styles.hidden,
                )}
                name="entryTypes"
                value={value?.entryTypes}
                onChange={setFieldValue}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                options={entryTypeOptions}
                disabled={disabled || optionsDisabled}
                label="Entry Type"
            />
            {
                frameworkFilters?.map((filter) => {
                    const filterValue = filterValuesMap[filter.key];
                    return (
                        <FrameworkFilterItem
                            variant="general"
                            key={filter.id}
                            name={filterValue?.index}
                            title={filter.title}
                            value={filterValue?.value}
                            filter={filter}
                            projectId={projectId}
                            onChange={onFrameworkFilterChange}
                            optionsDisabled={optionsDisabled}
                            allFiltersVisible={allFiltersVisible}
                            disabled={disabled}
                        />
                    );
                })
            }
        </>
    );
}

export default EntryFilter;
