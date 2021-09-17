import React from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    DateRangeInput,
    MultiSelectInput,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    useFormObject,
    SetValueArg,
} from '@togglecorp/toggle-form';

import {
    SourceFilterOptionsQuery,
} from '#generated/types';
import { enumKeySelector, enumLabelSelector } from '#utils/common';
import { SourcesFilterFields } from '..';
import styles from './styles.css';

const userKeySelector = (
    d: NonNullable<SourceFilterOptionsQuery['project']>['members'][number],
) => d.id;
const userLabelSelector = (
    d: NonNullable<SourceFilterOptionsQuery['project']>['members'][number],
) => d.displayName ?? `${d.firstName} ${d.lastName}`;

interface ControlStatusOption {
    key: 'true' | 'false';
    value: string;
}
const optionLabelSelector = (d: ControlStatusOption) => d.value;
const optionKeySelector = (d: ControlStatusOption) => d.key;

const controlledStatusOptions: ControlStatusOption[] = [
    {
        key: 'true',
        value: 'Controlled',
    },
    {
        key: 'false',
        value: 'Not controlled',
    },
];

const defaultValue: NonNullable<SourcesFilterFields['entriesFilterData']> = {};

interface Props<K extends string> {
    name: K;
    value: SourcesFilterFields['entriesFilterData'] | undefined;
    onChange: (value: SetValueArg<SourcesFilterFields['entriesFilterData']> | undefined, name: K) => void;
    optionsDisabled: boolean;
    options?: SourceFilterOptionsQuery;
    disabled?: boolean;
    className?: string;
}

function EntryFilter<K extends string>(props: Props<K>) {
    const {
        name,
        value,
        onChange,
        options,
        className,
        disabled,
        optionsDisabled,
    } = props;

    const setFieldValue = useFormObject(name, onChange, defaultValue);

    return (
        <div className={_cs(className, styles.entryFilter)}>
            <MultiSelectInput
                className={styles.input}
                name="createdBy"
                value={value?.createdBy}
                onChange={setFieldValue}
                keySelector={userKeySelector}
                labelSelector={userLabelSelector}
                options={options?.project?.members}
                label="Entry created by"
                placeholder="Entry created by"
                disabled={disabled || optionsDisabled}
            />
            <DateRangeInput
                className={styles.input}
                name="createdAt"
                label="Entry created at"
                value={value?.createdAt}
                onChange={setFieldValue}
                disabled={disabled}
            />
            <SelectInput
                className={styles.input}
                name="commentStatus"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value?.commentStatus}
                onChange={setFieldValue}
                options={options?.commentStatusOptions?.enumValues}
                label="Entry comment status"
                placeholder="Entry comment status"
                disabled={disabled || optionsDisabled}
            />
            <SelectInput
                className={styles.input}
                name="controlled"
                value={value?.controlled}
                onChange={setFieldValue}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={controlledStatusOptions}
                label="Entry controlled status"
                placeholder="Entry controlled status"
                disabled={disabled}
            />
            <MultiSelectInput
                className={styles.input}
                name="entryTypes"
                value={value?.entryTypes}
                onChange={setFieldValue}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                options={options?.entryTypeOptions?.enumValues}
                disabled={disabled || optionsDisabled}
                label="Entry type"
                placeholder="Entry type"
            />
        </div>
    );
}

export default EntryFilter;
