import React, { useContext, useMemo } from 'react';
import {
    capitalize,
    listToMap,
} from '@togglecorp/fujs';
import {
    useFormObject,
    useFormArray,
    SetValueArg,
} from '@togglecorp/toggle-form';

import {
    keySelector as projectMemberKeySelector,
    labelSelector as projectMemberLabelSelector,
} from '#components/selections/ProjectMemberMultiSelectInput';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';

import FrameworkFilterOutput from './FrameworkFilterOutput';
import DismissableBooleanOutput from '../DismissableBooleanOutput';
import DismissableDateRangeOutput from '../DismissableDateRangeOutput';
import DismissableListOutput from '../DismissableListOutput';
import DismissableTextOutput from '../DismissableTextOutput';

import SourcesFilterContext from '../../SourcesFilterContext';
import { PartialEntriesFilterDataType } from '../../SourcesFilter/schema';
import { SourceFilterOptions } from '../../SourcesFilter/types';

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
    frameworkFilters?: NonNullable<NonNullable<SourceFilterOptions['project']>['analysisFramework']>['filters'];
}

type FilterableData = NonNullable<PartialEntriesFilterDataType['filterableData']>[number];

function EntryFilterOutput<K extends string>(
    props: EntryFilterOutputProps<K>,
) {
    const {
        name,
        value,
        onChange,
        entryTypeOptions,
        frameworkFilters,
    } = props;

    const {
        entryCreatedByOptions,
    } = useContext(SourcesFilterContext);

    const setFieldValue = useFormObject(name, onChange, defaultValue);

    const {
        removeValue: onDismiss,
    } = useFormArray<'filterableData', FilterableData>('filterableData', setFieldValue);

    const frameworkFiltersMapping = useMemo(
        () => listToMap(
            frameworkFilters ?? [],
            (filter) => filter.key,
            (filter) => filter,
        ),
        [frameworkFilters],
    );

    return (
        <>
            <DismissableTextOutput
                label="Entry Text"
                name="search"
                value={value?.search}
                onDismiss={setFieldValue}
            />
            <DismissableListOutput
                label="Entry Created By"
                name="createdBy"
                onDismiss={setFieldValue}
                value={value?.createdBy}
                options={entryCreatedByOptions}
                labelSelector={projectMemberLabelSelector}
                keySelector={projectMemberKeySelector}
            />
            <DismissableDateRangeOutput
                fromName="createdAtGte"
                onDismissFromValue={setFieldValue}
                fromValue={value?.createdAtGte}
                toName="createdAtLte"
                onDismissToValue={setFieldValue}
                toValue={value?.createdAtLte}
                label="Entry Date Created"
            />
            <DismissableBooleanOutput
                label="Controlled Status"
                name="controlled"
                onDismiss={setFieldValue}
                trueLabel="Controlled"
                falseLabel="Not controlled"
                value={value?.controlled}
            />
            <DismissableBooleanOutput
                label="Has Comment"
                name="hasComment"
                onDismiss={setFieldValue}
                trueLabel="Has Comment"
                falseLabel="Does not have comment"
                value={value?.hasComment}
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
            {value?.filterableData?.map((frameworkFilterValue, filterIndex) => {
                const frameworkFilter = frameworkFiltersMapping[frameworkFilterValue.filterKey];
                if (!frameworkFilter) {
                    return null;
                }
                return (
                    <FrameworkFilterOutput
                        // FIXME: why are we capitalizing the framework filter title
                        label={capitalize(frameworkFilter.title?.toLowerCase() ?? '')}
                        key={frameworkFilterValue.filterKey}
                        index={filterIndex}
                        value={frameworkFilterValue}
                        onDismiss={onDismiss}
                        frameworkFilter={frameworkFilter}
                    />
                );
            })}
        </>
    );
}

export default EntryFilterOutput;
