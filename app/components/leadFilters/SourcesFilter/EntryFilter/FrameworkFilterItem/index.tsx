import React, { useCallback, useContext } from 'react';
import {
    _cs,
    doesObjectHaveNoData,
    isNotDefined,
    encodeDate,
} from '@togglecorp/fujs';
import {
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
    convertDateToIsoDateTime,
} from '#utils/common';
import GeoMultiSelectInput from '#components/GeoMultiSelectInput';
import NumberButStringInput from '#components/NumberButStringInput';
import SourcesFilterContext from '#components/leadFilters/SourcesFilterContext';
import {
    FrameworkFilterType,
    KeyLabel,
} from '#types/newAnalyticalFramework';

import { PartialEntriesFilterDataType } from '../../schema';
import SubRegionCheckmark from './SubRegionCheckmark';
import styles from './styles.css';

const filterKeySelector = (d: KeyLabel) => d.key;
const filterLabelSelector = (d: KeyLabel) => d.label;

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
    variant?: 'form' | 'general';
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
        variant,
    } = props;

    const {
        geoAreaOptions,
        setGeoAreaOptions,
    } = useContext(SourcesFilterContext);

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
                        valueLte: convertDateToIsoDateTime(
                            dateRangeValue.endDate,
                            { endOfDay: true },
                        ),
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

    /*
    const handleSingleSelect = useCallback((val: string | undefined) => {
        onChange({
            filterKey: filter.key,
            valueList: val ? [val] : [],
            value: val,
        }, name);
    }, [onChange, filter.key, name]);
    */

    switch (filter.widgetType) {
        case 'DATE': {
            return (
                <DateRangeInput
                    variant={variant}
                    className={_cs(
                        className,
                        styles.input,
                        doesObjectHaveNoData(value?.valueGte)
                        && doesObjectHaveNoData(value?.valueLte)
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
                    variant={variant}
                    className={_cs(
                        className,
                        styles.input,
                        doesObjectHaveNoData(value?.valueGte)
                            && doesObjectHaveNoData(value?.valueLte)
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
                    variant={variant}
                    className={_cs(
                        className,
                        styles.input,
                        doesObjectHaveNoData(value?.valueGte)
                        && doesObjectHaveNoData(value?.valueLte)
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
                    variant={variant}
                    className={_cs(
                        className,
                        styles.input,
                        doesObjectHaveNoData(value?.valueGte)
                        && doesObjectHaveNoData(value?.valueLte)
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
                        variant={variant}
                        className={_cs(
                            className,
                            styles.input,
                            (doesObjectHaveNoData(value?.value) && !allFiltersVisible)
                            && styles.hidden,
                        )}
                        name="valueGte"
                        label={`${title} (Greater than or equal)`}
                        value={value?.valueGte}
                        onChange={onFieldChange}
                        disabled={disabled}
                    />
                    <NumberButStringInput
                        variant={variant}
                        className={_cs(
                            className,
                            styles.input,
                            (doesObjectHaveNoData(value?.value) && !allFiltersVisible)
                            && styles.hidden,
                        )}
                        name="valueLte"
                        label={`${title} (Less than or equal)`}
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
                    variant={variant}
                    className={_cs(
                        className,
                        styles.input,
                        (doesObjectHaveNoData(value?.valueList) && !allFiltersVisible)
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
                    variant={variant}
                    name="valueList"
                    className={_cs(
                        className,
                        styles.input,
                        (doesObjectHaveNoData(value?.valueList) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    value={value?.valueList}
                    onChange={onFieldChange}
                    label={title}
                    projectId={projectId}
                    options={geoAreaOptions}
                    onOptionsChange={setGeoAreaOptions}
                    disabled={disabled}
                    // NOTE: we can hide includeSubRegions option because
                    // includeSubRegions will not be sent to server if some
                    // valueList is selected
                    actions={(value?.valueList?.length ?? 0) > 0 && (
                        <Checkbox
                            name="includeSubRegions"
                            tooltip={value?.includeSubRegions ? 'Exclude sub regions' : 'Include sub regions'}
                            disabled={disabled}
                            checkmark={SubRegionCheckmark}
                            onChange={onFieldChange}
                            value={value?.includeSubRegions}
                        />
                    )}
                />
            );
        }
        case 'SELECT': {
            return (
                <MultiSelectInput
                    variant={variant}
                    className={_cs(
                        className,
                        styles.input,
                        (doesObjectHaveNoData(value?.value) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="valueList"
                    value={value?.valueList}
                    label={title}
                    onChange={onFieldChange}
                    options={filter.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'MULTISELECT': {
            return (
                <MultiSelectInput
                    variant={variant}
                    className={_cs(
                        className,
                        styles.input,
                        (doesObjectHaveNoData(value?.valueList) && !allFiltersVisible)
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
        case 'ORGANIGRAM': {
            return (
                <MultiSelectInput
                    variant={variant}
                    className={_cs(
                        className,
                        styles.input,
                        (doesObjectHaveNoData(value?.valueList) && !allFiltersVisible)
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
        case 'MATRIX1D': {
            return (
                <MultiSelectInput
                    variant={variant}
                    className={_cs(
                        className,
                        styles.input,
                        (doesObjectHaveNoData(value?.valueList) && !allFiltersVisible)
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
        case 'MATRIX2D': {
            return (
                <MultiSelectInput
                    variant={variant}
                    className={_cs(
                        className,
                        styles.input,
                        (doesObjectHaveNoData(value?.valueList) && !allFiltersVisible)
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
        case 'TEXT':
            return (
                <TextInput
                    variant={variant}
                    className={_cs(
                        className,
                        styles.input,
                        (doesObjectHaveNoData(value?.value) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="value"
                    value={value?.value}
                    onChange={onFieldChange}
                    label={title}
                    disabled={disabled}
                />
            );
        // case 'CONDITIONAL':
        default:
            // FIXME: add "not implemented" message
            return null;
    }
}

export default FrameworkFilterItem;
