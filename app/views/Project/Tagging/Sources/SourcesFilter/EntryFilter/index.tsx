import React, { useMemo, useCallback, useState } from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';
import {
    DateDualRangeInput,
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
    hasNoData,
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import ProjectMemberMultiSelectInput, { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import BooleanInput, { Option } from '#components/selections/BooleanInput';
import {
    FrameworkFilterType,
} from '#types/newAnalyticalFramework';

import FrameworkFilterItem from './FrameworkFilterItem';
import { SourceFilterOptions } from '../types';

import { PartialEntriesFilterDataType } from '../schema';

import styles from './styles.css';

const filterKeySelector = (d: FrameworkFilterType) => d.key;

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
    options?: SourceFilterOptions;
    disabled?: boolean;
}

function EntryFilter<K extends string>(props: Props<K>) {
    const {
        name,
        value,
        onChange,
        options,
        projectId,
        disabled,
        allFiltersVisible,
        optionsDisabled,
    } = props;

    const setFieldValue = useFormObject(name, onChange, defaultValue);

    const [members, setMembers] = useState<ProjectMember[] | undefined | null>();
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

    const frameworkFilterRendererParams = useCallback(
        (key: string, data: FrameworkFilterType) => {
            const filterValue = filterValuesMap[key];
            return {
                name: filterValue?.index,
                title: data.title,
                value: filterValue?.value,
                filter: data,
                projectId,
                onChange: onFrameworkFilterChange,
                optionsDisabled,
                allFiltersVisible,
                disabled,
            };
        },
        [
            onFrameworkFilterChange,
            optionsDisabled,
            disabled,
            filterValuesMap,
            allFiltersVisible,
            projectId,
        ],
    );

    return (
        <>
            <ProjectMemberMultiSelectInput
                className={_cs(
                    styles.input,
                    (hasNoData(value?.createdBy) && !allFiltersVisible)
                    && styles.hidden,
                )}
                name="createdBy"
                projectId={projectId}
                value={value?.createdBy} // FIXME: fix type issue from server
                onChange={setFieldValue}
                options={members}
                onOptionsChange={setMembers}
                label="Entry created by"
                disabled={disabled}
            />
            <DateDualRangeInput
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
                label="Entry created at"
            />
            <SelectInput
                className={_cs(
                    styles.input,
                    (hasNoData(value?.commentStatus) && !allFiltersVisible)
                    && styles.hidden,
                )}
                name="commentStatus"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value?.commentStatus}
                onChange={setFieldValue}
                options={options?.commentStatusOptions?.enumValues}
                label="Entry comment status"
                disabled={disabled || optionsDisabled}
            />
            <BooleanInput
                className={_cs(
                    styles.input,
                    (hasNoData(value?.controlled) && !allFiltersVisible)
                    && styles.hidden,
                )}
                options={controlledStatusOptions}
                name="controlled"
                value={value?.controlled}
                onChange={setFieldValue}
                label="Entry controlled status"
                disabled={disabled}
            />
            <MultiSelectInput<string, 'entryTypes', { name: string, description?: string | null }, { containerClassName?: string, title?: string; }>
                // FIXME: ts couldn't properly infer type for this MultiSelectInput
                className={_cs(
                    styles.input,
                    (hasNoData(value?.entryTypes) && !allFiltersVisible)
                    && styles.hidden,
                )}
                name="entryTypes"
                value={value?.entryTypes}
                onChange={setFieldValue} // FIXME: fix type issue
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                options={options?.entryTypeOptions?.enumValues}
                disabled={disabled || optionsDisabled}
                label="Entry type"
            />
            <List
                data={options?.project?.analysisFramework?.filters ?? undefined}
                keySelector={filterKeySelector}
                renderer={FrameworkFilterItem}
                rendererClassName={styles.input}
                rendererParams={frameworkFilterRendererParams}
            />
        </>
    );
}

export default EntryFilter;
