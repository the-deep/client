import React, { useMemo, useContext } from 'react';
import {
    _cs,
    capitalize,
    listToMap,
    isNotDefined,
    encodeDate,
    isDefined,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
    useFormObject,
    useFormArray,
    SetValueArg,
} from '@togglecorp/toggle-form';
import {
    Tag,
    TagProps,
    Button,
} from '@the-deep/deep-ui';
import { IoClose } from 'react-icons/io5';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import {
    FrameworkFilterType,
    KeyLabel,
} from '#types/newAnalyticalFramework';
import {
    keySelector as projectMemberKeySelector,
    labelSelector as projectMemberLabelSelector,
} from '#components/selections/ProjectMemberMultiSelectInput';
import {
    keySelector as organizationKeySelector,
    organizationTitleSelector as organizationLabelSelector,
} from '#components/selections/NewOrganizationMultiSelectInput';
import {
    keySelector as geoAreaKeySelector,
    labelSelector as geoAreaLabelSelector,
} from '#components/GeoMultiSelectInput';

import { PartialFormType, PartialEntriesFilterDataType } from '../SourcesFilter/schema';
import useFilterOptions,
{
    organizationTypeKeySelector,
    organizationTypeLabelSelector,
} from '../SourcesFilter/useFilterOptions';
import SourcesFilterContext from '../SourcesFilterContext';
import {
    SourceFilterOptions,
} from '../SourcesFilter/types';
import styles from './styles.css';

const filterKeySelector = (d: KeyLabel) => d.key;
const filterLabelSelector = (d: KeyLabel) => d.label;

interface DismissableTagProps<T> extends TagProps {
    label?: React.ReactNode;
    name: T,
    onDismiss: (value: undefined, name: T) => void;
}

function DismissableTag<T>(props: DismissableTagProps<T>) {
    const {
        name,
        label,
        className,
        onDismiss,
        actions,
        ...otherProps
    } = props;

    const handleDismiss = React.useCallback(() => {
        onDismiss(undefined, name);
    }, [name, onDismiss]);

    return (
        <div className={_cs(styles.dismissableTag, className)}>
            <div className={styles.label}>
                {label}
            </div>
            <Tag
                {...otherProps}
                className={styles.tag}
                actions={(
                    <>
                        {actions}
                        <Button
                            name={name}
                            onClick={handleDismiss}
                            variant="action"
                        >
                            <IoClose />
                        </Button>
                    </>
                )}
            />
        </div>
    );
}

interface DismissableTextOutputProps<T extends string | number | undefined> {
    label?: React.ReactNode;
    value?: string;
    name: T;
    onDismiss: (value: undefined, name: T) => void;
}

function DismissableTextOutput<T extends string | number | undefined>(
    props: DismissableTextOutputProps<T>,
) {
    const {
        label,
        value,
        name,
        onDismiss,
    } = props;

    if (doesObjectHaveNoData(value)) {
        return null;
    }

    return (
        <DismissableTag
            label={label}
            name={name}
            onDismiss={onDismiss}
        >
            {value}
        </DismissableTag>
    );
}

interface DismissableBooleanOutputProps<T extends string | number | undefined> {
    label?: React.ReactNode;
    trueLabel: string;
    falseLabel: string;
    value?: boolean;
    name: T;
    onDismiss: (value: undefined, name: T) => void;
}
function DismissableBooleanOutput<T extends string | number | undefined>(
    props: DismissableBooleanOutputProps<T>,
) {
    const {
        label,
        trueLabel,
        falseLabel,
        value,
        name,
        onDismiss,
    } = props;

    if (value === true) {
        return (
            <DismissableTag
                label={label}
                name={name}
                onDismiss={onDismiss}
            >
                {trueLabel}
            </DismissableTag>
        );
    }

    if (value === false) {
        return (
            <DismissableTag
                label={label}
                name={name}
                onDismiss={onDismiss}
            >
                {falseLabel}
            </DismissableTag>
        );
    }

    return null;
}

interface DismissableListOutputProps<
    D,
    V extends string | number,
    N extends string | number | undefined
> {
    label?: React.ReactNode;
    value: V[] | undefined;
    name: N;
    onDismiss: (value: undefined, name: N) => void;
    keySelector: (value: D) => V;
    labelSelector: (value: D) => string;
    options: D[] | undefined | null;
}
function DismissableListOutput<D, V extends string | number, N extends string | number | undefined>(
    props: DismissableListOutputProps<D, V, N>,
) {
    const {
        name,
        value,
        onDismiss,
        label,
        labelSelector,
        keySelector,
        options,
    } = props;

    const labelMap = useMemo(() => (
        listToMap(options, keySelector, labelSelector)
    ), [options, keySelector, labelSelector]);

    const content = useMemo(() => {
        if (isNotDefined(value)) {
            return undefined;
        }

        return value?.map((val) => labelMap?.[val])?.join(', ');
    }, [value, labelMap]);

    if (doesObjectHaveNoData(value)) {
        return null;
    }

    return (
        <DismissableTag
            label={label}
            name={name}
            onDismiss={onDismiss}
        >
            {content}
        </DismissableTag>
    );
}

interface DismissableDateRangeOutputProps<
K extends string | number | undefined,
N extends string | number | undefined
> {
    label?: React.ReactNode;
    fromName: K;
    toName: N;
    fromValue?: string;
    toValue?: string;
    onDismissFromValue: (value: undefined, name: K) => void;
    onDismissToValue: (value: undefined, name: N) => void;
}

function DismissableDateRangeOutput<
K extends string | number | undefined,
N extends string | number | undefined
>(
    props: DismissableDateRangeOutputProps<K, N>,
) {
    const {
        label,
        fromName,
        toName,
        fromValue,
        toValue,
        onDismissFromValue,
        onDismissToValue,
    } = props;

    const handleDismiss = React.useCallback(() => {
        onDismissFromValue(undefined, fromName);
        onDismissToValue(undefined, toName);
    }, [onDismissFromValue, onDismissToValue, fromName, toName]);

    if (doesObjectHaveNoData(fromValue) || doesObjectHaveNoData(toValue)) {
        return null;
    }

    const content = `${fromValue} - ${toValue}`;

    return (
        <DismissableTag
            label={label}
            name={fromName}
            onDismiss={handleDismiss}
        >
            {content}
        </DismissableTag>
    );
}
interface DismissableSelectOutputProps<D, V extends string | number, N> {
    label: React.ReactNode;
    name: N;
    value?: V;
    onDismiss: (value: undefined, name: N) => void;
    keySelector: (value: D) => V;
    labelSelector: (value: D) => string;
    options: D[] | undefined | null;
}

function DismissableSelectOutput<D, V extends string | number, N>(
    props: DismissableSelectOutputProps< D, V, N >,
) {
    const {
        name,
        value,
        onDismiss,
        label,
        labelSelector,
        keySelector,
        options,
    } = props;

    const labelMap = useMemo(() => (
        listToMap(options, keySelector, labelSelector)
    ), [options, keySelector, labelSelector]);

    const content = useMemo(() => {
        if (isNotDefined(value)) {
            return undefined;
        }
        return labelMap?.[value];
    }, [value, labelMap]);

    if (doesObjectHaveNoData(value)) {
        return null;
    }
    return (
        <DismissableTag
            label={label}
            name={name}
            onDismiss={onDismiss}
        >
            {content}
        </DismissableTag>
    );
}

type PartialFrameworkFilterValue = NonNullable<PartialEntriesFilterDataType['filterableData']>[number];

interface FrameworkFilterOutputProps {
    label?: string;
    value: PartialFrameworkFilterValue;
    index: number;
    onDismiss: (index: number) => void;
    frameworkFilter?: FrameworkFilterType;
}
function FrameworkFilterOutput(
    props: FrameworkFilterOutputProps,
) {
    const {
        label,
        value,
        onDismiss,
        index,
        frameworkFilter,
    } = props;

    const {
        geoAreaOptions,
    } = useContext(SourcesFilterContext);

    const handleDismiss = React.useCallback(() => {
        onDismiss(index);
    }, [onDismiss, index]);

    switch (frameworkFilter?.widgetType) {
        case 'DATE': {
            if (value.valueGte && value.valueLte) {
                const startDate = encodeDate(new Date(value.valueGte));
                const endDate = encodeDate(new Date(value.valueLte));
                const content = `${startDate} - ${endDate}`;
                return (
                    <DismissableTag
                        label={label}
                        name={index}
                        onDismiss={handleDismiss}
                    >
                        {content}
                    </DismissableTag>
                );
            }
            return null;
        }
        case 'DATE_RANGE': {
            if (value.valueGte && value.valueLte) {
                const startDate = encodeDate(new Date(value.valueGte));
                const endDate = encodeDate(new Date(value.valueLte));
                const content = `${startDate} - ${endDate}`;
                return (
                    <DismissableTag
                        label={label}
                        name={index}
                        onDismiss={handleDismiss}
                    >
                        {content}
                    </DismissableTag>
                );
            }
            return null;
        }
        case 'TIME': {
            if (value.valueGte && value.valueLte) {
                const content = `${value.valueGte} - ${value.valueLte}`;
                return (
                    <DismissableTag
                        label={label}
                        name={index}
                        onDismiss={handleDismiss}
                    >
                        {content}
                    </DismissableTag>
                );
            }
            return null;
        }
        case 'TIME_RANGE': {
            if (value.valueGte && value.valueLte) {
                const content = `${value.valueGte} - ${value.valueLte}`;
                return (
                    <DismissableTag
                        label={label}
                        name={index}
                        onDismiss={handleDismiss}
                    >
                        {content}
                    </DismissableTag>
                );
            }
            return null;
        }

        case 'NUMBER': {
            return (
                <>
                    {isDefined(value.valueGte) && (
                        <DismissableTag
                            label={`${label} (Greater than)`}
                            name={index}
                            onDismiss={handleDismiss}
                        >
                            {value.valueGte}
                        </DismissableTag>
                    )}
                    {isDefined(value.valueLte) && (
                        <DismissableTag
                            label={`${label} (Less than)`}
                            name={index}
                            onDismiss={handleDismiss}
                        >
                            {value.valueLte}
                        </DismissableTag>
                    )}
                </>
            );
        }

        case 'SCALE': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={frameworkFilter?.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    value={value.valueList}
                />
            );
        }

        case 'GEO': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={geoAreaOptions}
                    keySelector={geoAreaKeySelector}
                    labelSelector={geoAreaLabelSelector}
                    value={value.valueList}
                />
            );
        }

        case 'SELECT': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={frameworkFilter?.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    value={value.valueList}
                />
            );
        }

        case 'MULTISELECT': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={frameworkFilter?.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    value={value.valueList}
                />
            );
        }

        case 'ORGANIGRAM': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={frameworkFilter?.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    value={value.valueList}
                />
            );
        }

        case 'MATRIX1D': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={frameworkFilter?.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    value={value.valueList}
                />
            );
        }

        case 'MATRIX2D': {
            return (
                <DismissableListOutput
                    label={label}
                    name={index}
                    onDismiss={handleDismiss}
                    options={frameworkFilter?.properties?.options}
                    keySelector={filterKeySelector}
                    labelSelector={filterLabelSelector}
                    value={value.valueList}
                />
            );
        }

        case 'TEXT': {
            return (
                <DismissableTextOutput
                    label={label}
                    name={index}
                    value={value.value}
                    onDismiss={handleDismiss}
                />
            );
        }

        default:
            return null;
    }
}

const defaultValue: PartialEntriesFilterDataType = {
    filterableData: [],
};

interface EnumOption {
    name: string;
    description?: string | null | undefined
}

interface EntryFilterOutputProps<K> {
    name: K;
    value: PartialEntriesFilterDataType | undefined;
    onChange: (value: SetValueArg<PartialEntriesFilterDataType | undefined>, name: K) => void;
    entryTypeOptions?: EnumOption[] | null | undefined;
    frameworkFilters?: NonNullable<NonNullable<SourceFilterOptions['project']>['analysisFramework']>['filters'];
}

type FilterableData = NonNullable<PartialEntriesFilterDataType['filterableData']>[number];

function EntryFilterOutput<K extends string>(
    props: EntryFilterOutputProps<K>,
) {
    const {
        name,
        value,
        onChange,
        entryTypeOptions,
        frameworkFilters,
    } = props;

    const {
        entryCreatedByOptions,
    } = useContext(SourcesFilterContext);

    const setFieldValue = useFormObject(name, onChange, defaultValue);

    const {
        removeValue: onDismiss,
    } = useFormArray<'filterableData', FilterableData>('filterableData', setFieldValue);

    return (
        <>
            <DismissableTextOutput
                label="Entry Text"
                name="search"
                value={value?.search}
                onDismiss={setFieldValue}
            />
            <DismissableListOutput
                label="Entry Created By"
                name="createdBy"
                onDismiss={setFieldValue}
                value={value?.createdBy}
                options={entryCreatedByOptions}
                labelSelector={projectMemberLabelSelector}
                keySelector={projectMemberKeySelector}
            />
            <DismissableDateRangeOutput
                fromName="createdAtGte"
                onDismissFromValue={setFieldValue}
                fromValue={value?.createdAtGte}
                toName="createdAtLte"
                onDismissToValue={setFieldValue}
                toValue={value?.createdAtLte}
                label="Entry Date Created"
            />
            <DismissableBooleanOutput
                label="Controlled Status"
                name="controlled"
                onDismiss={setFieldValue}
                trueLabel="Controlled"
                falseLabel="Not controlled"
                value={value?.controlled}
            />
            <DismissableBooleanOutput
                label="Has Comment"
                name="hasComment"
                onDismiss={setFieldValue}
                trueLabel="Has Comment"
                falseLabel="Does not have comment"
                value={value?.hasComment}
            />
            <DismissableListOutput
                label="Entry Type"
                name="entryTypes"
                onDismiss={setFieldValue}
                value={value?.entryTypes}
                options={entryTypeOptions}
                labelSelector={enumLabelSelector}
                keySelector={enumKeySelector}
            />
            {value?.filterableData?.map((frameworkFilterValue, filterIndex) => {
                const frameworkFilter = frameworkFilters
                    ?.find((f) => (f.key === frameworkFilterValue.filterKey));
                return (
                    <FrameworkFilterOutput
                        label={capitalize(frameworkFilter?.title?.toLowerCase() ?? '')}
                        key={frameworkFilterValue.filterKey}
                        index={filterIndex}
                        value={frameworkFilterValue}
                        onDismiss={onDismiss}
                        frameworkFilter={frameworkFilter}
                    />
                );
            })}
        </>
    );
}

interface Props {
    value: PartialFormType;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
    projectId: string;
    className?: string;
}

function AppliedFilters(props: Props) {
    const {
        className,
        value,
        onChange,
        projectId,
    } = props;

    const {
        createdByOptions,
        assigneeOptions,
        authorOrganizationOptions,
        sourceOrganizationOptions,
    } = useContext(SourcesFilterContext);

    const {
        statusOptions,
        priorityOptions,
        organizationTypeOptions,
        confidentialityOptions,
        entryTypeOptions,
        frameworkFilters,
    } = useFilterOptions(projectId);

    return (
        <div className={_cs(className, styles.appliedFilters)}>
            <DismissableTextOutput
                label="Title"
                name="search"
                value={value.search}
                onDismiss={onChange}
            />
            <DismissableListOutput
                label="Status"
                name="statuses"
                onDismiss={onChange}
                value={value.statuses}
                options={statusOptions}
                labelSelector={enumLabelSelector}
                keySelector={enumKeySelector}
            />
            <DismissableDateRangeOutput
                fromName="publishedOnGte"
                onDismissFromValue={onChange}
                fromValue={value.publishedOnGte}
                toName="publishedOnLte"
                onDismissToValue={onChange}
                toValue={value.publishedOnLte}
                label="Date Published"
            />
            <DismissableDateRangeOutput
                fromName="createdAtGte"
                onDismissFromValue={onChange}
                fromValue={value.createdAtGte}
                toName="createdAtLte"
                onDismissToValue={onChange}
                toValue={value.createdAtLte}
                label="Source Date Created"
            />
            <DismissableBooleanOutput
                label="Has Entry"
                name="hasEntries"
                onDismiss={onChange}
                trueLabel="Has entry"
                falseLabel="No entries"
                value={value.hasEntries}
            />
            <DismissableBooleanOutput
                label="Assessment Status"
                name="hasAssessment"
                onDismiss={onChange}
                trueLabel="Assessment completed"
                falseLabel="Assessment not completed"
                value={value.hasAssessment}
            />
            <DismissableListOutput
                label="Source Created By"
                name="createdBy"
                onDismiss={onChange}
                value={value.createdBy}
                options={createdByOptions}
                labelSelector={projectMemberLabelSelector}
                keySelector={projectMemberKeySelector}
            />
            <DismissableListOutput
                label="Assignee"
                name="assignees"
                onDismiss={onChange}
                value={value.assignees}
                options={assigneeOptions}
                labelSelector={projectMemberLabelSelector}
                keySelector={projectMemberKeySelector}
            />
            <DismissableListOutput
                label="Priority"
                name="priorities"
                onDismiss={onChange}
                value={value.priorities}
                options={priorityOptions}
                labelSelector={enumLabelSelector}
                keySelector={enumKeySelector}
            />
            <DismissableListOutput
                label="Authoring Organization Type"
                name="authoringOrganizationTypes"
                onDismiss={onChange}
                options={organizationTypeOptions}
                keySelector={organizationTypeKeySelector}
                labelSelector={organizationTypeLabelSelector}
                value={value.authoringOrganizationTypes}
            />
            <DismissableListOutput
                label="Authoring Organization"
                name="authorOrganizations"
                onDismiss={onChange}
                value={value.authorOrganizations}
                options={authorOrganizationOptions}
                labelSelector={organizationLabelSelector}
                keySelector={organizationKeySelector}
            />
            <DismissableListOutput
                label="Source Organization"
                name="sourceOrganizations"
                onDismiss={onChange}
                value={value.sourceOrganizations}
                options={sourceOrganizationOptions}
                labelSelector={organizationLabelSelector}
                keySelector={organizationKeySelector}
            />
            <DismissableSelectOutput
                label="Confidentiality"
                name="confidentiality"
                onDismiss={onChange}
                options={confidentialityOptions}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.confidentiality}
            />
            <EntryFilterOutput
                name="entriesFilterData"
                value={value.entriesFilterData}
                onChange={onChange}
                entryTypeOptions={entryTypeOptions}
                frameworkFilters={frameworkFilters}
            />
        </div>
    );
}

export default AppliedFilters;
