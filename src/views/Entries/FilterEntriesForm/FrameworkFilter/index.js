import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import SearchInput from '#rsci/SearchInput';
import DateFilter from '#rsci/DateFilter';
import TimeFilter from '#rsci/TimeFilter';
import RangeFilter from '#rsci/RangeFilter';
import MultiSelectInput from '#rsci/MultiSelectInput';

import _ts from '#ts';

import GeoFilter from '../GeoFilter';

import styles from './styles.scss';

const emptyList = [];

function FrameworkFilter(props) {
    const {
        title,
        filterKey,
        filter,
        handleFilterChange,
        value,
        disabled,
        regions,
        geoOptions,
    } = props;

    const onChange = useCallback((values) => {
        handleFilterChange(filterKey, values);
    }, [filterKey, handleFilterChange]);

    if (!filter || !filter.type) {
        return null;
    }

    const propsForFilter = {
        key: filterKey,
        className: styles.entriesFilter,
        label: title,
        onChange,
        value,
        disabled,
    };

    switch (filter.type) {
        case 'geo': {
            return (
                <GeoFilter
                    {...propsForFilter}
                    value={propsForFilter.value}
                    disabled={propsForFilter.disabled}
                    geoOptions={geoOptions}
                    regions={regions}
                />
            );
        }
        case 'multiselect':
            return (
                <MultiSelectInput
                    {...propsForFilter}
                    value={propsForFilter.value ?? emptyList}
                    options={filter.options ?? emptyList}
                    showHintAndError={false}
                    placeholder={_ts('entries', 'multiselectPlaceholder')}
                />
            );
        case 'multiselect-range':
            return (
                <RangeFilter
                    {...propsForFilter}
                    options={filter.options}
                    showHintAndError={false}
                    placeholder={_ts('entries', 'multiselectRangePlaceholder')}
                />
            );
        case 'date':
            return (
                <DateFilter
                    {...propsForFilter}
                    showHintAndError={false}
                    placeholder={_ts('entries', 'datePlaceholder')}
                />
            );
        case 'time':
            return (
                <TimeFilter
                    {...propsForFilter}
                    showHintAndError={false}
                    placeholder={_ts('entries', 'timePlaceholder')}
                />
            );
        case 'text':
            return (
                <SearchInput
                    {...propsForFilter}
                    showHintAndError={false}
                    placeholder={_ts('entries', 'textSearchPlaceholder')}
                />
            );
        default:
            return null;
    }
}

FrameworkFilter.propTypes = {
    title: PropTypes.string,
    filterKey: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    filter: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    geoOptions: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    regions: PropTypes.array,
    handleFilterChange: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.array,
        PropTypes.object,
    ]),
    disabled: PropTypes.bool,
};

FrameworkFilter.defaultProps = {
    title: undefined,
    filter: undefined,
    value: undefined,
    disabled: false,
    geoOptions: {},
    regions: [],
};

export default FrameworkFilter;
