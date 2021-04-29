import React from 'react';
import { _cs } from '@togglecorp/fujs';

import SearchInput from '#rsci/SearchInput';
import DateFilter from '#rsci/DateFilter';
import TimeFilter from '#rsci/TimeFilter';
import RangeFilter from '#rsci/RangeFilter';
import MultiSelectInput from '#rsci/MultiSelectInput';

import _ts from '#ts';

import {
    FilterFields,
    ProjectDetails,
    GeoOptions,
} from '#typings';

import GeoFilter from './GeoFilter';

import styles from './styles.scss';

interface Props {
    title: string;
    filterKey: string;
    filter: FilterFields['properties'];
    geoOptions?: GeoOptions;
    regions?: ProjectDetails['regions'];
    className?: string;
}

function FrameworkFilter(props: Props) {
    const {
        title,
        filterKey,
        filter,
        geoOptions,
        regions,
        className,
    } = props;

    if (!filter || !filter.type) {
        return null;
    }

    switch (filter.type) {
        case 'geo': {
            return (
                <GeoFilter
                    className={className}
                    faramElementName={filterKey}
                    label={title}
                    geoOptions={geoOptions}
                    regions={regions}
                />
            );
        }
        case 'multiselect':
            return (
                <MultiSelectInput
                    faramElementName={filterKey}
                    label={title}
                    options={filter.options}
                    placeholder={_ts('entries', 'multiselectPlaceholder')}
                    showHintAndError={false}
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        case 'multiselect-range':
            return (
                <RangeFilter
                    faramElementName={filterKey}
                    label={title}
                    options={filter.options}
                    showHintAndError={false}
                    placeholder={_ts('entries', 'multiselectRangePlaceholder')}
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
                <SearchInput
                    faramElementName={filterKey}
                    label={title}
                    showHintAndError={false}
                    placeholder={_ts('entries', 'textSearchPlaceholder')}
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        default:
            return null;
    }
}

export default FrameworkFilter;
