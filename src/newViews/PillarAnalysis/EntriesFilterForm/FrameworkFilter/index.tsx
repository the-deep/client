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
import {
    EntriesAsList,
} from '@togglecorp/toggle-form';

import GeoMultiSelectInput from '#newComponents/input/GeoMultiSelectInput';
import {
    FilterFields,
    FilterOption,
    GeoOption,
} from '#types';
import _ts from '#ts';

import { FaramValues } from '../../';

import styles from './styles.scss';

const filterKeySelector = (d: FilterOption) => d.key;
const filterLabelSelector = (d: FilterOption) => d.label;

interface Props {
    title: string;
    filterKey: string;
    filter: FilterFields['properties'];
    className?: string;
    value: FaramValues;
    projectId: number;
    onChange: (...entries: EntriesAsList<FaramValues>) => void;
}

function FrameworkFilter(props: Props) {
    const {
        title,
        filterKey,
        filter,
        className,
        value,
        projectId,
        onChange: setFieldValue,
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
                    name={filterKey}
                    value={value?.[filterKey] as (string[] | undefined)}
                    onChange={setFieldValue}
                    className={_cs(styles.frameworkFilter, className)}
                    label={title}
                    projectId={projectId}
                    options={geoOptions}
                    onOptionsChange={setGeoOptions}
                    placeholder={_ts('entries', 'multiselectPlaceholder')}
                />
            );
        }
        case 'multiselect':
        case 'multiselect-range':
            return (
                <MultiSelectInput
                    name={filterKey}
                    value={value?.[filterKey] as (string[] | undefined)}
                    onChange={setFieldValue}
                    label={title}
                    options={filter.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    placeholder={_ts('entries', 'multiselectPlaceholder')}
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        case 'date':
            return (
                <DateRangeInput
                    name={filterKey}
                    label={title}
                    value={value?.[filterKey] as (
                        { startDate: string; endDate: string } | undefined)
                    }
                    onChange={setFieldValue}
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        case 'time':
            return (
                <TimeRangeInput
                    name={filterKey}
                    label={title}
                    value={value?.[filterKey] as (
                        { startTime: string; endTime: string } | undefined)
                    }
                    onChange={setFieldValue}
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        case 'text':
            return (
                <TextInput
                    name={filterKey}
                    value={value?.[filterKey] as (string | undefined)}
                    onChange={setFieldValue}
                    label={title}
                    placeholder={_ts('entries', 'textSearchPlaceholder')}
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        default:
            return <div />;
    }
}

export default FrameworkFilter;
