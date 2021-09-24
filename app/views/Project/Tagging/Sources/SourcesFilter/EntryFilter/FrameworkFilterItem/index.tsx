import React, { useCallback } from 'react';
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
import { PartialEntriesFilterDataType } from '../..';
import styles from './styles.css';

interface Option {
    key: string;
    label: string;
}
const filterKeySelector = (d: Option) => d.key;
const filterLabelSelector = (d: Option) => d.label;

type PartialFrameworkFilterValue = NonNullable<PartialEntriesFilterDataType['filterableData']>[number];

interface Props<K extends number> {
    name: K;
    title: string;
    filter: AnalysisFrameworkFilterType;
    className?: string;
    value: PartialFrameworkFilterValue;
    onChange: (value: SetValueArg<PartialFrameworkFilterValue>, name: K) => void;
    optionsDisabled?: boolean;
    disabled?: boolean;
}

function FrameworkFilterItem<K extends number>(props: Props<K>) {
    const {
        name,
        title,
        value,
        filter,
        className,
        onChange,
        optionsDisabled,
        disabled,
    } = props;

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
                <>
                    <DateInput
                        name="value"
                        label={title}
                        value={value?.value}
                        onChange={onFieldChange}
                        className={className}
                        disabled={disabled}
                    />
                </>
            );
        }
        case 'DATE_RANGE': {
            return (
                <>
                    <DateInput
                        name="valueGte"
                        label={`${title} Start Date`}
                        value={value?.valueGte}
                        onChange={onFieldChange}
                        className={className}
                        disabled={disabled}
                    />
                    <DateInput
                        name="valueLte"
                        label={`${title} End Date`}
                        value={value?.valueLte}
                        onChange={onFieldChange}
                        className={className}
                        disabled={disabled}
                    />
                </>
            );
        }
        case 'TIME': {
            return (
                <TimeInput
                    name="value"
                    label={title}
                    value={value?.value}
                    onChange={onFieldChange}
                    className={className}
                    disabled={disabled}
                />
            );
        }
        case 'TIME_RANGE': {
            return (
                <>
                    <TimeInput
                        name="valueGte"
                        label={`${title} Start Time `}
                        value={value?.valueGte}
                        onChange={onFieldChange}
                        className={className}
                        disabled={disabled}
                    />
                    <TimeInput
                        name="valueLte"
                        label={`${title} End Time `}
                        value={value?.valueLte}
                        onChange={onFieldChange}
                        className={className}
                        disabled={disabled}
                    />
                </>
            );
        }
        case 'NUMBER': {
            return (
                <NumberInput
                    name="value"
                    label={title}
                    value={value?.value}
                    onChange={onFieldChange}
                    className={className}
                    disabled={disabled}
                />
            );
        }
        case 'SCALE': {
            return (
                <MultiSelectInput
                    name="valueList"
                    value={value?.valueList}
                    onChange={onFieldChange}
                    label={title}
                    options={filter.properties.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    className={_cs(styles.frameworkFilter, className)}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'GEO': {
            return null;
        }
        case 'SELECT': {
            return (
                <SelectInput
                    name="value"
                    value={value?.value}
                    label={title}
                    onChange={onFieldChange}
                    options={filter.properties.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'MULTISELECT': {
            return (
                <MultiSelectInput
                    name="valueList"
                    value={value?.valueList}
                    onChange={onFieldChange}
                    label={title}
                    options={filter.properties.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    placeholder="Any"
                    className={_cs(styles.frameworkFilter, className)}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'ORGANIGRAM': { // FIXME options sent by the server is gibberish (null values)
            return (
                <MultiSelectInput
                    name="valueList"
                    value={value?.valueList}
                    onChange={onFieldChange}
                    label={title}
                    options={filter.properties.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    placeholder={title}
                    className={_cs(styles.frameworkFilter, className)}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'MATRIX1D': {
            return (
                <MultiSelectInput
                    name="valueList"
                    value={value?.valueList}
                    onChange={onFieldChange}
                    label={title}
                    options={filter.properties.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    placeholder={title}
                    className={_cs(styles.frameworkFilter, className)}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'MATRIX2D': {
            return (
                <MultiSelectInput
                    name="valueList"
                    value={value?.valueList}
                    onChange={onFieldChange}
                    label={title}
                    options={filter.properties.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    placeholder={title}
                    className={_cs(styles.frameworkFilter, className)}
                    disabled={disabled || optionsDisabled}
                />
            );
        }
        case 'TEXT':
            return (
                <TextInput
                    name="value"
                    value={value?.value}
                    onChange={onFieldChange}
                    label={title}
                    placeholder={title}
                    className={_cs(styles.frameworkFilter, className)}
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
