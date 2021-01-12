import React from 'react';

import SearchInput from '#rsci/SearchInput';
import DateFilter from '#rsci/DateFilter';
import TimeFilter from '#rsci/TimeFilter';
import RangeFilter from '#rsci/RangeFilter';
import MultiSelectInput from '#rsci/MultiSelectInput';

import _ts from '#ts';

import {
    FilterFields,
} from '#typings';

import GeoFilter from './GeoFilter';

import styles from './styles.scss';

interface Props {
    title: string;
    filterKey: string;
    filter: FilterFields['properties'];
    geoOptions: unknown;
    regions: unknown[];
}

function FrameworkFilter(props: Props) {
    const {
        title,
        filterKey,
        filter,
        geoOptions,
        regions,
    } = props;

    if (!filter || !filter.type) {
        return null;
    }

    switch (filter.type) {
        case 'geo': {
            return (
                <GeoFilter
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
                    className={styles.frameworkFilter}
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
                    className={styles.frameworkFilter}
                />
            );
        case 'date':
            return (
                <DateFilter
                    faramElementName={filterKey}
                    label={title}
                    showHintAndError={false}
                    placeholder={_ts('entries', 'datePlaceholder')}
                    className={styles.frameworkFilter}
                />
            );
        case 'time':
            return (
                <TimeFilter
                    faramElementName={filterKey}
                    label={title}
                    showHintAndError={false}
                    placeholder={_ts('entries', 'timePlaceholder')}
                    className={styles.frameworkFilter}
                />
            );
        case 'text':
            return (
                <SearchInput
                    faramElementName={filterKey}
                    label={title}
                    showHintAndError={false}
                    placeholder={_ts('entries', 'textSearchPlaceholder')}
                    className={styles.frameworkFilter}
                />
            );
        default:
            return null;
    }
}

export default FrameworkFilter;
