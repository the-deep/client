import React from 'react';
import {
    _cs,
    mapToList,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';
import {
    MultiSelectInput as NewMultiSelectInput,
    TextInput as NewTextInput,
} from '@the-deep/deep-ui';

import DateFilter from '#rsci/DateFilter';
import TimeFilter from '#rsci/TimeFilter';

import _ts from '#ts';

import {
    FilterFields,
    FilterOption,
    GeoOptions,
} from '#typings';
import NewGeoMultiSelectInput from '#components/input/GeoMultiSelectInput';

import styles from './styles.scss';

const MultiSelectInput = FaramInputElement(NewMultiSelectInput);
const TextInput = FaramInputElement(NewTextInput);
const GeoMultiSelectInput = FaramInputElement(NewGeoMultiSelectInput);

const filterKeySelector = (d: FilterOption) => d.key;
const filterLabelSelector = (d: FilterOption) => d.label;

interface Props {
    title: string;
    filterKey: string;
    filter: FilterFields['properties'];
    geoOptions?: GeoOptions;
    className?: string;
}

function FrameworkFilter(props: Props) {
    const {
        title,
        filterKey,
        filter,
        geoOptions = {},
        className,
    } = props;

    if (!filter || !filter.type) {
        return null;
    }

    switch (filter.type) {
        case 'geo': {
            const options = mapToList(geoOptions, d => d).flat();
            return (
                <GeoMultiSelectInput
                    name={filterKey}
                    className={_cs(styles.frameworkFilter, className)}
                    faramElementName={filterKey}
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
                    faramElementName={filterKey}
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
                    faramElementName={filterKey}
                    label={title}
                    placeholder={_ts('entries', 'textSearchPlaceholder')}
                    className={_cs(styles.frameworkFilter, className)}
                />
            );
        default:
            return null;
    }
}

export default FrameworkFilter;
