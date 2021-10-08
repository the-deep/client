import React, { useCallback, useState } from 'react';
import {
    _cs,
    isNotDefined,
    encodeDate,
} from '@togglecorp/fujs';
import {
    SelectInput,
    MultiSelectInput,
    TextInput,
    DateRangeInput,
    TimeRangeInput,
    Checkbox,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    FrameworkFilterType,
    KeyLabelEntity,
    KeyLabel,
} from '../../types';
import {
    hasNoData,
    convertDateToIsoDateTime,
} from '#utils/common';
import GeoMultiSelectInput, { GeoArea } from '#components/GeoMultiSelectInput';
import NumberButStringInput from '#components/NumberButStringInput';
import { PartialEntriesFilterDataType } from '../../schema';
import styles from './styles.css';

const filterKeySelector = (d: KeyLabel) => d.key;

// FIXME remove clientId as key when clientId is removed from widget option properties
const filterClientIdSelector = (d: KeyLabelEntity) => d.clientId;
const filterLabelSelector = (d: KeyLabelEntity | KeyLabel) => d.label;

type PartialFrameworkFilterValue = NonNullable<PartialEntriesFilterDataType['filterableData']>[number];

interface Props<K extends number> {
    name: K;
    title: string;
    filter: FrameworkFilterType;
    // FIXME: the filter's value should depend on the filter type as well
    value: PartialFrameworkFilterValue | undefined;
    onChange: (value: SetValueArg<PartialFrameworkFilterValue>, name: K) => void;
    projectId: string;
    allFiltersVisible: boolean;
    className?: string;
    optionsDisabled?: boolean;
    disabled?: boolean;
}

function FrameworkFilterItem<K extends number>(props: Props<K>) {
    const {
        name,
        title,
        value,
        filter,
        projectId,
        className,
        onChange,
        allFiltersVisible,
        optionsDisabled,
        disabled,
    } = props;

    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);

    const defaultOptionVal = useCallback(
        (): PartialFrameworkFilterValue => ({
            filterKey: filter.key,
        }),
        [filter],
    );
    const onFieldChange = useFormObject(name, onChange, defaultOptionVal);

    // FIXME: move this logic to it's own component
    const handleDateRangeChange = useCallback(
        (dateRangeValue: { startDate: string, endDate: string } | undefined) => {
            if (isNotDefined(dateRangeValue)) {
                onChange({ filterKey: filter.key }, name);
            } else {
                onChange(
                    (oldVal) => ({
                        ...oldVal,
                        filterKey: filter.key,
                        valueGte: convertDateToIsoDateTime(dateRangeValue.startDate),
                        valueLte: convertDateToIsoDateTime(dateRangeValue.endDate),
                    }),
                    name,
                );
            }
        },
        [name, onChange, filter.key],
    );

    const handleTimeRangeChange = useCallback(
        (timeRangeValue: { startTime: string, endTime: string } | undefined) => {
            if (isNotDefined(timeRangeValue)) {
                onChange({ filterKey: filter.key }, name);
            } else {
                onChange(
                    (oldVal) => ({
                        ...oldVal,
                        filterKey: filter.key,
                        valueGte: timeRangeValue.startTime,
                        valueLte: timeRangeValue.endTime,
                    }),
                    name,
                );
            }
        },
        [name, onChange, filter.key],
    );

    const handleSingleSelect = useCallback((val: string | undefined) => {
        onChange({ filterKey: filter.key, valueList: val ? [val] : [], value: val }, name);
    }, [onChange, filter.key, name]);

    switch (filter.widgetType) {
        case 'DATE': {
            return (
                <DateRangeInput
                    className={_cs(
                        className,
                        styles.input,
                        hasNoData(value?.valueGte)
                        && hasNoData(value?.valueLte)
                        && !allFiltersVisible
                        && styles.hidden,
                    )}
                    name={name}
                    onChange={handleDateRangeChange}
                    value={value?.valueGte && value?.valueLte ? {
                        startDate: encodeDate(new Date(value?.valueGte)),
                        endDate: encodeDate(new Date(value?.valueLte)),
                    } : undefined}
                    label={title}
                    disabled={disabled}
                />
            );
        }
        case 'DATE_RANGE': {
            // NOTE: not using DateRangeDualInput here because it will trigger
            // two onChange calls consecutively
            // A new filter data is added on the first call.
            // Before the index is updated, the second onChange is called which
            // will again dd another filter data
            return (
                <DateRangeInput
                    className={_cs(
                        className,
                        styles.input,
                        hasNoData(value?.valueGte)
                            && hasNoData(value?.valueLte)
                            && !allFiltersVisible
                            && styles.hidden,
                    )}
                    name={name}
                    onChange={handleDateRangeChange}
                    value={value?.valueGte && value?.valueLte ? {
                        startDate: encodeDate(new Date(value?.valueGte)),
                        endDate: encodeDate(new Date(value?.valueLte)),
                    } : undefined}
                    label={title}
                    disabled={disabled}
                />
            );
        }
        case 'TIME': {
            return (
                <TimeRangeInput
                    className={_cs(
                        className,
                        styles.input,
                        hasNoData(value?.valueGte)
                        && hasNoData(value?.valueLte)
                        && !allFiltersVisible
                        && styles.hidden,
                    )}
                    name={name}
                    onChange={handleTimeRangeChange}
                    value={value?.valueGte && value?.valueLte ? {
                        startTime: value?.valueGte,
                        endTime: value?.valueLte,
                    } : undefined}
                    label={title}
                    disabled={disabled}
                />
            );
        }
        case 'TIME_RANGE': {
            return (
                <TimeRangeInput
                    className={_cs(
                        className,
                        styles.input,
                        hasNoData(value?.valueGte)
                        && hasNoData(value?.valueLte)
                        && !allFiltersVisible
                        && styles.hidden,
                    )}
                    name={name}
                    onChange={handleTimeRangeChange}
                    value={value?.valueGte && value?.valueLte ? {
                        startTime: value?.valueGte,
                        endTime: value?.valueLte,
                    } : undefined}
                    label={title}
                    disabled={disabled}
                />
            );
        }
        case 'NUMBER': {
            return (
                <>
                    <NumberButStringInput
                        className={_cs(
                            className,
                            styles.input,
                            (hasNoData(value?.value) && !allFiltersVisible)
                            && styles.hidden,
                        )}
                        name="valueGte"
                        label={`${title} (Greater than)`}
                        value={value?.valueGte}
                        onChange={onFieldChange}
                        disabled={disabled}
                    />
                    <NumberButStringInput
                        className={_cs(
                            className,
                            styles.input,
                            (hasNoData(value?.value) && !allFiltersVisible)
                            && styles.hidden,
                        )}
                        name="valueLte"
                        label={`${title} (Less than)`}
                        value={value?.valueLte}
                        onChange={onFieldChange}
                        disabled={disabled}
                    />
                </>
            );
        }
        case 'SCALE': {
            return (
                <MultiSelectInput
                    className={_cs(
                        className,
                        styles.input,
                        (hasNoData(value?.valueList) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="valueList"
                    value={value?.valueList}
                    onChange={onFieldChange}
                    label={title}
                    options={filter.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'GEO': {
            return (
                <GeoMultiSelectInput
                    name="valueList"
                    className={_cs(
                        className,
                        styles.input,
                        (hasNoData(value?.valueList) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    value={value?.valueList}
                    onChange={onFieldChange}
                    label={title}
                    projectId={projectId}
                    options={geoAreaOptions}
                    onOptionsChange={setGeoAreaOptions}
                    disabled={disabled}
                    placeholder={title}
                    actions={(
                        <Checkbox
                            name="includeSubRegions"
                            disabled={disabled}
                            onChange={onFieldChange}
                            value={value?.includeSubRegions}
                            label="Include sub regions"
                        />
                    )}
                />
            );
        }
        case 'SELECT': {
            return (
                <SelectInput
                    className={_cs(
                        className,
                        styles.input,
                        (hasNoData(value?.value) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="valueList"
                    value={value?.value}
                    label={title}
                    onChange={handleSingleSelect}
                    options={filter.properties?.options}
                    keySelector={filterClientIdSelector}
                    labelSelector={filterLabelSelector}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'MULTISELECT': {
            return (
                <MultiSelectInput
                    className={_cs(
                        className,
                        styles.input,
                        (hasNoData(value?.valueList) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="valueList"
                    value={value?.valueList}
                    onChange={onFieldChange}
                    label={title}
                    options={filter.properties?.options}
                    keySelector={filterClientIdSelector}
                    labelSelector={filterLabelSelector}
                    placeholder={title}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'ORGANIGRAM': {
            return (
                <MultiSelectInput
                    className={_cs(
                        className,
                        styles.input,
                        (hasNoData(value?.valueList) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="valueList"
                    value={value?.valueList}
                    onChange={onFieldChange}
                    label={title}
                    options={filter.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    placeholder={title}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'MATRIX1D': {
            return (
                <MultiSelectInput
                    className={_cs(
                        className,
                        styles.input,
                        (hasNoData(value?.valueList) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="valueList"
                    value={value?.valueList}
                    onChange={onFieldChange}
                    label={title}
                    options={filter.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    placeholder={title}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'MATRIX2D': {
            return (
                <MultiSelectInput
                    className={_cs(
                        className,
                        styles.input,
                        (hasNoData(value?.valueList) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="valueList"
                    value={value?.valueList}
                    onChange={onFieldChange}
                    label={title}
                    options={filter.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    placeholder={title}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'TEXT':
            return (
                <TextInput
                    className={_cs(
                        className,
                        styles.input,
                        (hasNoData(value?.value) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="value"
                    value={value?.value}
                    onChange={onFieldChange}
                    label={title}
                    placeholder={title}
                    disabled={disabled}
                />
            );
        // case 'CONDITIONAL':
        default:
            return null;
    }
}

export default FrameworkFilterItem;
