import React, { useCallback, useState } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    SelectInput,
    MultiSelectInput,
    TextInput,
    DateInput,
    TimeInput,
    NumberInput,
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
    filter: AnalysisFrameworkFilterType;
    value: PartialFrameworkFilterValue;
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
            valueList: undefined,
        }),
        [filter],
    );
    const onFieldChange = useFormObject(name, onChange, defaultOptionVal);

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
            return (
                <>
                    <DateInput
                        className={_cs(
                            className,
                            styles.input,
                            (hasNoData(value?.valueGte) && !allFiltersVisible)
                            && styles.hidden,
                        )}
                        name="valueGte"
                        label={`${title} Start Date`}
                        value={value?.valueGte}
                        onChange={onFieldChange}
                        disabled={disabled}
                    />
                    <DateInput
                        className={_cs(
                            className,
                            styles.input,
                            (hasNoData(value?.valueLte) && !allFiltersVisible)
                            && styles.hidden,
                        )}
                        name="valueLte"
                        label={`${title} End Date`}
                        value={value?.valueLte}
                        onChange={onFieldChange}
                        disabled={disabled}
                    />
                </>
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
                <NumberInput
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
        case 'CONDITIONAL':
            return null; // FIXME to be added later
        default:
            return null;
    }
}

export default FrameworkFilterItem;
