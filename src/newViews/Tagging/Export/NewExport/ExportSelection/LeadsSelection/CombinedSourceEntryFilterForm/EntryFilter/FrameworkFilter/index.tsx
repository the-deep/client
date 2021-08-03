import React, { useState } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    MultiSelectInput,
    TextInput,
    DateRangeInput,
    TimeRangeInput,
} from '@the-deep/deep-ui';
import { EntriesAsList } from '@togglecorp/toggle-form';

import GeoMultiSelectInput from '#newComponents/input/GeoMultiSelectInput';

import {
    FilterFields,
    FilterOption,
    GeoOption,
} from '#typings';

import { EntryFilterType } from '../../../../types';

import styles from './styles.scss';

const filterKeySelector = (d: FilterOption) => d.key;
const filterLabelSelector = (d: FilterOption) => d.label;

interface Props<K extends string> {
    name: K;
    title: string;
    filter: FilterFields['properties'];
    className?: string;
    value: EntryFilterType | undefined;
    projectId: number;
    onChange: (...entries: EntriesAsList<EntryFilterType>) => void;
}

function FrameworkFilter<K extends string>(props: Props<K>) {
    const {
        title,
        name,
        filter,
        className,
        value,
        projectId,
        onChange,
    } = props;

    const [
        geoOptions,
        setGeoOptions,
    ] = useState<GeoOption[] | undefined | null>(undefined);

    if (!filter?.type) {
        return <div />;
    }

    switch (filter.type) {
        case 'geo': {
            return (
                <GeoMultiSelectInput
                    name={name}
                    value={value?.[name] as (string[] | undefined)}
                    onChange={onChange}
                    className={_cs(styles.frameworkFilter, className)}
                    label={title}
                    projectId={projectId}
                    options={geoOptions}
                    onOptionsChange={setGeoOptions}
                    placeholder="Any"
                />
            );
        }
        case 'multiselect':
        case 'multiselect-range':
            return (
                <MultiSelectInput
                    name={name}
                    value={value?.[name] as (string[] | undefined)}
                    onChange={onChange}
                    label={title}
                    options={filter.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    placeholder="Any"
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        case 'date':
            return (
                <DateRangeInput
                    name={name}
                    label={title}
                    value={value?.[name] as (
                        { startDate: string; endDate: string } | undefined)
                    }
                    onChange={onChange}
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        case 'time':
            return (
                <TimeRangeInput
                    name={name}
                    label={title}
                    value={value?.[name] as (
                        { startTime: string; endTime: string } | undefined)
                    }
                    onChange={onChange}
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        case 'text':
            return (
                <TextInput
                    name={name}
                    value={value?.[name] as (string | undefined)}
                    onChange={onChange}
                    label={title}
                    placeholder="Search text widget"
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        default:
            return <div />;
    }
}

export default FrameworkFilter;
