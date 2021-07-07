import React from 'react';
import {
    _cs,
    mapToList,
} from '@togglecorp/fujs';
import {
    MultiSelectInput,
    TextInput,
} from '@the-deep/deep-ui';

import DateFilter from '#rsci/DateFilter';
import TimeFilter from '#rsci/TimeFilter';
import {
    EntriesAsList,
} from '@togglecorp/toggle-form';

import _ts from '#ts';

import {
    FilterFields,
    FilterOption,
    GeoOptions,
} from '#typings';
import GeoMultiSelectInput from '#newComponents/input/GeoMultiSelectInput';
import { FaramValues } from '../../';

import styles from './styles.scss';

const filterKeySelector = (d: FilterOption) => d.key;
const filterLabelSelector = (d: FilterOption) => d.label;

const emptyGeoOptions: GeoOptions = {};

interface Props {
    title: string;
    filterKey: string;
    filter: FilterFields['properties'];
    geoOptions?: GeoOptions;
    className?: string;
    value: FaramValues;
    onValueChange: (...entries: EntriesAsList<FaramValues>) => void;
}

function FrameworkFilter(props: Props) {
    const {
        title,
        filterKey,
        filter,
        geoOptions = emptyGeoOptions,
        className,
        value,
        onValueChange,
    } = props;

    if (!filter?.type) {
        return <div />;
    }

    switch (filter.type) {
        case 'geo': {
            const options = mapToList(geoOptions, d => d).flat();
            return (
                <GeoMultiSelectInput
                    name={filterKey}
                    value={value?.[filterKey] as (string[] | undefined)}
                    onChange={onValueChange}
                    className={_cs(styles.frameworkFilter, className)}
                    label={title}
                    options={options}
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
                    onChange={onValueChange}
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
                <DateFilter
                    faramElementName={filterKey}
                    label={title}
                    showHintAndError={false}
                    placeholder={_ts('entries', 'datePlaceholder')}
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        case 'time':
            return (
                <TimeFilter
                    faramElementName={filterKey}
                    label={title}
                    showHintAndError={false}
                    placeholder={_ts('entries', 'timePlaceholder')}
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        case 'text':
            return (
                <TextInput
                    name={filterKey}
                    value={value?.[filterKey] as (string | undefined)}
                    onChange={onValueChange}
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
