import React, { useCallback, useState } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    SelectInput,
    MultiSelectInput,
    TextInput,
    DateInput,
    TimeInput,
    DateRangeInput,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import {
    AnalysisFrameworkFilterType,
} from '#generated/types';
import {
    hasNoData,
} from '#utils/common';
import GeoMultiSelectInput, { GeoArea } from '#components/GeoMultiSelectInput';
import NumberButStringInput from '#components/NumberButStringInput';
import { PartialEntriesFilterDataType } from '../..';
import styles from './styles.css';

interface Option {
    key: string;
    label: string;
    clientId: string;
}
const filterKeySelector = (d: Option) => d.key;
// FIXME remove clientId as key when clientId is removed from widget option properties
const filterClientIdSelector = (d: Option) => d.clientId;
const filterLabelSelector = (d: Option) => d.label;

type PartialFrameworkFilterValue = NonNullable<PartialEntriesFilterDataType['filterableData']>[number];

interface Props<K extends number> {
    name: K;
    title: string;
    // FIXME: the filter's properties is `any`, inject proper type
    filter: Pick<AnalysisFrameworkFilterType, 'title' | 'filterType' | 'widgetType' | 'properties' | 'key'>;
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
                        valueGte: dateRangeValue.startDate,
                        valueLt: dateRangeValue.endDate,
                    }),
                    name,
                );
            }
        },
        [name, onChange, filter.key],
    );

    switch (filter.widgetType) {
        case 'DATE': {
            return (
                <DateInput
                    className={_cs(
                        className,
                        styles.input,
                        (hasNoData(value?.value) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="value"
                    label={title}
                    value={value?.value}
                    onChange={onFieldChange}
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
                        startDate: value?.valueGte,
                        endDate: value?.valueLte,
                    } : undefined}
                    label={title}
                    disabled={disabled}
                />
            );
        }
        case 'TIME': {
            return (
                <TimeInput
                    className={_cs(
                        className,
                        styles.input,
                        (hasNoData(value?.value) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="value"
                    label={title}
                    value={value?.value}
                    onChange={onFieldChange}
                    disabled={disabled}
                />
            );
        }
        case 'TIME_RANGE': {
            return (
                <>
                    <TimeInput
                        className={_cs(
                            className,
                            styles.input,
                            (hasNoData(value?.valueGte) && !allFiltersVisible)
                            && styles.hidden,
                        )}
                        name="valueGte"
                        label={`${title} Start Time `}
                        value={value?.valueGte}
                        onChange={onFieldChange}
                        disabled={disabled}
                    />
                    <TimeInput
                        className={_cs(
                            className,
                            styles.input,
                            (hasNoData(value?.valueLte) && !allFiltersVisible)
                            && styles.hidden,
                        )}
                        name="valueLte"
                        label={`${title} End Time `}
                        value={value?.valueLte}
                        onChange={onFieldChange}
                        disabled={disabled}
                    />
                </>
            );
        }
        case 'NUMBER': {
            return (
                <NumberButStringInput
                    className={_cs(
                        className,
                        styles.input,
                        (hasNoData(value?.value) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="value"
                    label={title}
                    value={value?.value}
                    onChange={onFieldChange}
                    disabled={disabled}
                />
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
                    options={filter.properties.options}
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
                    value={value.valueList}
                    onChange={onFieldChange}
                    label={title}
                    projectId={projectId}
                    options={geoAreaOptions}
                    onOptionsChange={setGeoAreaOptions}
                    disabled={disabled}
                    placeholder={title}
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
                    name="value"
                    value={value?.value}
                    label={title}
                    onChange={onFieldChange}
                    options={filter.properties.options}
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
                    options={filter.properties.options}
                    keySelector={filterClientIdSelector}
                    labelSelector={filterLabelSelector}
                    placeholder={title}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'ORGANIGRAM': { // FIXME options sent by the server is gibberish (null values)
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
                    options={filter.properties.options}
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
                    options={filter.properties.options}
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
                    options={filter.properties.options}
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
