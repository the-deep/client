import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';
import {
    List,
    DateRangeInput,
    MultiSelectInput,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    useFormObject,
    SetValueArg,
} from '@togglecorp/toggle-form';

import { useRequest } from '#utils/request';

import {
    EntryOptions,
    KeyValueElement,
    WidgetElement,
    FilterFields,
} from '#typings';

import { EntryFilterType } from '../../../types';
import FrameworkFilter from './FrameworkFilter';
import styles from './styles.scss';

const filterKeySelector = (d: FilterFields) => d.key;
const optionLabelSelector = (d: KeyValueElement) => d.value;
const optionKeySelector = (d: KeyValueElement) => d.key;

const verificationStatusOptions: KeyValueElement[] = [
    {
        key: 'true',
        value: 'Verified',
    },
    {
        key: 'false',
        value: 'Unverified',
    },
];

const entryTypeOptions: KeyValueElement[] = [
    {
        key: 'excerpt',
        value: 'Excerpt',
    },
    {
        key: 'image',
        value: 'Image',
    },
    {
        key: 'dataSeries',
        value: 'Quantitative',
    },
];

const commentStatusOptions: KeyValueElement[] = [
    {
        key: 'resolved',
        value: 'Resolved',
    },
    {
        key: 'unresolved',
        value: 'Active',
    },
];

export type EntryFilterValueType = EntryFilterType | undefined;

interface Props<K extends string> {
    name: K;
    value: EntryFilterValueType | undefined;
    onChange: (value: SetValueArg<EntryFilterValueType> | undefined, name: K) => void;
    projectId: number;
    filters?: FilterFields[];
    widgets?: WidgetElement<unknown>[];
    className?: string;
}

const defaultValue: NonNullable<EntryFilterValueType> = {};

function EntryFilter<K extends string>(props: Props<K>) {
    const {
        name,
        value,
        onChange,
        projectId,
        widgets,
        filters,
        className,
    } = props;

    const entryOptionsQueryParams = useMemo(() => ({
        project: projectId,
    }), [projectId]);

    const {
        pending: entryOptionsPending,
        response: entryOptions,
    } = useRequest<EntryOptions>({
        url: 'server://entry-options/',
        query: entryOptionsQueryParams,
        method: 'GET',
        failureHeader: 'Entry Options',
    });

    const setFieldValue = useFormObject(name, onChange, defaultValue);

    const filteredFrameworkFilters = useMemo(() => {
        const widgetsMap = listToMap(widgets, d => d.key, d => d.widgetId);
        const filtersWithId = filters?.map(f => ({
            ...f,
            widgetId: widgetsMap[f.widgetKey],
        }));
        return filtersWithId ?? [];
    }, [widgets, filters]);

    const frameworkFilterRendererParams = useCallback((key, data) => ({
        name: key,
        title: data.title,
        filter: data.properties,
        projectId,
        value,
        onChange: setFieldValue,
    }), [value, setFieldValue, projectId]);

    return (
        <div className={_cs(className, styles.entryFilter)}>
            <MultiSelectInput
                className={styles.input}
                name="created_by"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                value={value?.created_by as (string[] | undefined)}
                onChange={setFieldValue}
                options={entryOptions?.createdBy}
                label="Created by"
                placeholder="Created by"
                disabled={entryOptionsPending}
            />
            <DateRangeInput
                name="created_at"
                className={styles.input}
                label="Created at"
                value={value?.created_at as (
                    { startDate: string; endDate: string } | undefined)
                }
                onChange={setFieldValue}
            />
            <MultiSelectInput
                className={styles.input}
                name="comment_assignee"
                value={value?.comment_assignee as (string[] | undefined)}
                onChange={setFieldValue}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryOptions?.createdBy}
                label="Comment Assigned To"
                placeholder="Comment Assigned To"
                disabled={entryOptionsPending}
            />
            <MultiSelectInput
                className={styles.input}
                name="comment_created_by"
                value={value?.comment_created_by as (string[] | undefined)}
                onChange={setFieldValue}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryOptions?.createdBy}
                label="Comment created by"
                placeholder="Comment created by"
                disabled={entryOptionsPending}
            />
            <SelectInput
                className={styles.input}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                value={value?.comment_status as (string | undefined)}
                onChange={setFieldValue}
                name="comment_status"
                options={commentStatusOptions}
                label="Comment status"
                placeholder="Comment status"
            />
            <SelectInput
                className={styles.input}
                name="verified"
                value={value?.verified as (string | undefined)}
                onChange={setFieldValue}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={verificationStatusOptions}
                label="Verification status"
                placeholder="Verification status"
            />
            <MultiSelectInput
                className={styles.input}
                name="entry_type"
                value={value?.entry_type as (string[] | undefined)}
                onChange={setFieldValue}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryTypeOptions}
                label="Entry type"
                placeholder="Entry type"
            />
            { filteredFrameworkFilters.length > 0 && (
                <List
                    data={filteredFrameworkFilters}
                    keySelector={filterKeySelector}
                    renderer={FrameworkFilter}
                    rendererClassName={styles.input}
                    rendererParams={frameworkFilterRendererParams}
                />
            )}
        </div>
    );
}

export default EntryFilter;
