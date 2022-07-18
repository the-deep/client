import React, { useMemo, useContext, useCallback } from 'react';
import {
    _cs,
    capitalize,
    listToMap,
    doesObjectHaveNoData,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import {
    TextInput,
    DateDualRangeInput,
    MultiSelectInput,
} from '@the-deep/deep-ui';
import { IoSearch } from 'react-icons/io5';
import {
    useFormObject,
    SetValueArg,
    isCallable,
} from '@togglecorp/toggle-form';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import ProjectMemberMultiSelectInput from '#components/selections/ProjectMemberMultiSelectInput';
import BooleanInput, { Option } from '#components/selections/BooleanInput';
import SourcesFilterContext from '#components/leadFilters/SourcesFilterContext';
import { EnumEntity } from '#types/common';

import FrameworkFilterItem from './FrameworkFilterItem';
import { FrameworkFilterType } from '#types/newAnalyticalFramework';

import { PartialEntriesFilterDataType } from '../schema';
import styles from './styles.css';

// FIXME: move this to the top
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

// FIXME: move this to the top
const hasCommentOptions: Option[] = [
    {
        key: 'true',
        value: 'Has comment',
    },
    {
        key: 'false',
        value: 'Does not have comment',
    },
];

const defaultValue: PartialEntriesFilterDataType = {
    filterableData: [],
};

type FilterableData = NonNullable<PartialEntriesFilterDataType['filterableData']>[number];

interface Props<K extends string> {
    name: K;
    value: PartialEntriesFilterDataType | undefined;
    onChange: (value: SetValueArg<PartialEntriesFilterDataType | undefined>, name: K) => void;
    projectId: string;
    optionsDisabled: boolean;
    allFiltersVisible: boolean;
    entryTypeOptions?: EnumEntity<string>[] | null;
    frameworkFilters?: FrameworkFilterType[] | null;
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

    const {
        entryCreatedByOptions,
        setEntryCreatedByOptions,
    } = useContext(SourcesFilterContext);

    const onFrameworkFilterChange = useCallback(
        (val: SetValueArg<FilterableData>, index: number | undefined) => {
            setFieldValue(
                (oldValue: FilterableData[] | undefined): FilterableData[] => {
                    const newVal = [...(oldValue ?? [])];

                    if (isNotDefined(index)) {
                        newVal.push(isCallable(val) ? val(undefined) : val);
                    } else {
                        newVal[index] = isCallable(val)
                            ? val(newVal[index])
                            : val;
                    }
                    // We are filtering out the values that have no information at all
                    return newVal.filter((filterable) => (
                        isDefined(filterable.value)
                        || isDefined(filterable.valueGte)
                        || isDefined(filterable.valueLte)
                        || (isDefined(filterable.valueList) && filterable.valueList.length > 0)
                    ));
                },
                'filterableData',
            );
        },
        [setFieldValue],
    );

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
                label="Entry Text"
            />
            <ProjectMemberMultiSelectInput
                variant="general"
                className={_cs(
                    styles.input,
                    (doesObjectHaveNoData(value?.createdBy) && !allFiltersVisible)
                    && styles.hidden,
                )}
                name="createdBy"
                projectId={projectId}
                value={value?.createdBy}
                onChange={setFieldValue}
                options={entryCreatedByOptions}
                onOptionsChange={setEntryCreatedByOptions}
                label="Created By"
                disabled={disabled}
            />
            <DateDualRangeInput
                variant="general"
                className={_cs(
                    styles.input,
                    doesObjectHaveNoData(value?.createdAtGte)
                    && doesObjectHaveNoData(value?.createdAtLte)
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
                label="Date Created"
            />
            <BooleanInput
                variant="general"
                className={_cs(
                    styles.input,
                    (doesObjectHaveNoData(value?.controlled) && !allFiltersVisible)
                    && styles.hidden,
                )}
                options={controlledStatusOptions}
                name="controlled"
                value={value?.controlled}
                onChange={setFieldValue}
                label="Controlled Status"
                disabled={disabled}
            />
            <BooleanInput
                variant="general"
                className={_cs(
                    styles.input,
                    (doesObjectHaveNoData(value?.hasComment) && !allFiltersVisible)
                    && styles.hidden,
                )}
                options={hasCommentOptions}
                name="hasComment"
                value={value?.hasComment}
                onChange={setFieldValue}
                label="Has Comment"
                disabled={disabled}
            />
            <MultiSelectInput
                variant="general"
                className={_cs(
                    styles.input,
                    (doesObjectHaveNoData(value?.entryTypes) && !allFiltersVisible)
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
            {frameworkFilters?.map((filter) => {
                const filterValue = filterValuesMap[filter.key];
                return (
                    <FrameworkFilterItem
                        key={filter.id}
                        variant="general"
                        name={filterValue?.index}
                        // FIXME: any reason to do this?
                        title={capitalize(filter.title.toLowerCase() ?? '')}
                        value={filterValue?.value}
                        filter={filter}
                        projectId={projectId}
                        onChange={onFrameworkFilterChange}
                        optionsDisabled={optionsDisabled}
                        allFiltersVisible={allFiltersVisible}
                        disabled={disabled}
                    />
                );
            })}
        </>
    );
}

export default EntryFilter;
