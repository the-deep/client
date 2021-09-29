import React, { useMemo, useCallback, useState } from 'react';
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
import {
    hasNoData,
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import ProjectMemberMultiSelectInput, { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import BooleanInput, { Option } from '#components/selections/BooleanInput';

import FrameworkFilterItem from './FrameworkFilterItem';
import { PartialEntriesFilterDataType } from '..';
import styles from './styles.css';

const filterKeySelector = (d: AnalysisFrameworkFilterType) => d.key;

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
        <div className={_cs(className, styles.entryFilter)}>
            <ProjectMemberMultiSelectInput
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
                label="Entry created by"
                placeholder="Entry created by"
                disabled={disabled}
            />
            <DateRangeInput
                className={_cs(
                    styles.input,
                    (hasNoData(value?.createdAt) && !allFiltersVisible)
                    && styles.hidden,
                )}
                name="createdAt"
                label="Entry created at"
                value={value?.createdAt}
                onChange={setFieldValue}
                disabled={disabled}
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
                placeholder="Entry comment status"
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
                placeholder="Entry controlled status"
                disabled={disabled}
            />
            <MultiSelectInput
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
