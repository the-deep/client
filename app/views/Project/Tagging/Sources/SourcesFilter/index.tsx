import React, { useCallback, useState } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    ObjectSchema,
    PurgeNull,
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    useForm,
    ArraySchema,
    PartialForm,
} from '@togglecorp/toggle-form';
import {
    TextInput,
    SelectInput,
    MultiSelectInput,
    useBooleanState,
    Button,
} from '@the-deep/deep-ui';
import {
    IoSearch,
    IoClose,
    IoChevronUpOutline,
    IoChevronDownOutline,
} from 'react-icons/io5';
import { gql, useQuery } from '@apollo/client';
import _ts from '#ts';
import { EnumFix } from '#utils/types';
import {
    hasNoData,
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import DateRangeDualInput from '#components/DateRangeDualInput';
import ProjectMemberMultiSelectInput, { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import NonFieldError from '#components/NonFieldError';
import {
    ProjectSourcesQueryVariables,
    SourceFilterOptionsQuery,
    SourceFilterOptionsQueryVariables,
    OrganizationType,
} from '#generated/types';

import EntryFilter from './EntryFilter';
import styles from './styles.css';

export type SourcesFilterFields = PurgeNull<EnumFix<ProjectSourcesQueryVariables,
    'statuses'
    | 'confidentiality'
    | 'exists'
    | 'priorities'
    | 'statuses'

    // NOTE: the enum fix works recursively
    | 'commentStatus'
    | 'entryTypes'
>>;

type FormType = SourcesFilterFields;

type PartialFormType = PartialForm<FormType, 'filterKey'>;
export type PartialEntriesFilterDataType = NonNullable<PartialFormType['entriesFilterData']>;
type PartialFrameworkFilterType = NonNullable<PartialEntriesFilterDataType['filterableData']>[number];
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type FrameworkFilterSchema = ObjectSchema<PartialFrameworkFilterType, PartialFormType>;
type FrameworkFilterFields = ReturnType<FrameworkFilterSchema['fields']>;
const frameworkFilterSchema: FrameworkFilterSchema = {
    fields: (): FrameworkFilterFields => ({
        filterKey: [],
        value: [],
        valueList: [],
    }),
};
type FrameworkFiltersSchema = ArraySchema<PartialFrameworkFilterType, PartialFormType>;
type FrameworkFiltersMember = ReturnType<FrameworkFiltersSchema['member']>;

const frameworkFiltersSchema: FrameworkFiltersSchema = {
    keySelector: (d) => d.filterKey,
    member: (): FrameworkFiltersMember => frameworkFilterSchema,
};

type EntriesFilterDataSchema = ObjectSchema<PartialEntriesFilterDataType, PartialFormType>;
type EntriesFilterDataFields = ReturnType<EntriesFilterDataSchema['fields']>;
const entriesFilterDataSchema: EntriesFilterDataSchema = {
    fields: (): EntriesFilterDataFields => ({
        createdBy: [],
        createdAt_Gte: [],
        createdAt_Lt: [],
        commentStatus: [],
        controlled: [],
        entryTypes: [],
        filterableData: frameworkFiltersSchema,
    }),
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        statuses: [],
        createdAt_Gte: [],
        createdAt_Lt: [],
        publishedOn_Gte: [],
        publishedOn_Lt: [],
        assignees: [],
        search: [],
        exists: [],
        priorities: [],
        customFilters: [],
        authoringOrganizationTypes: [],
        confidentiality: [],
        entriesFilterData: entriesFilterDataSchema,
    }),
};

const initialValue: PartialFormType = {
    customFilters: 'EXCLUDE_EMPTY_FILTERED_ENTRIES', // NOTE: customFilters is required when entriesFilterData filter is applied.
};

const SOURCE_FILTER_OPTIONS = gql`
    query SourceFilterOptions(
        $projectId: ID!,
    ) {
        sourceStatusOptions: __type(name: "LeadStatusEnum") {
            name
            enumValues {
                name
                description
            }
        }
        sourceExistsOptions: __type(name: "LeadExistsEnum") {
            name
            enumValues {
                name
                description
            }
        }
        sourcePriorityOptions: __type(name: "LeadPriorityEnum") {
            name
            enumValues {
                name
                description
            }
        }
        sourceConfidentialityOptions: __type(name: "LeadConfidentialityEnum") {
            name
            enumValues {
                name
                description
            }
        }
        project(id: $projectId) {
            analysisFramework {
                filters {
                    filterType
                    key
                    properties
                    title
                    widgetType
                }
            }
        }
        organizationTypes {
            results {
                id
                title
            }
        }
        emmEntititiesOptions: __type(name: "EmmEntityType") {
            name
            enumValues {
                name
                description
            }
        }
        emmRiskFactorsOptions: __type(name: "EmmKeyRiskFactorType") {
            name
            enumValues {
                name
                description
            }
        }
        emmKeywordsOptions: __type(name: "EmmKeyWordType") {
            name
            enumValues {
                name
                description
            }
        }
        entryTypeOptions: __type(name: "EntryTagTypeEnum") {
            name
            enumValues {
                name
                description
            }
        }
        commentStatusOptions: __type(name: "EntryFilterCommentStatusEnum") {
            name
            enumValues {
                name
                description
            }
        }
    }
`;

function convertDateToIsoDateTime(dateString: string | undefined) {
    if (!dateString) {
        return undefined;
    }
    const date = new Date(dateString);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date.toISOString();
}

function organizationTypeKeySelector(value: Pick<OrganizationType, 'id' | 'title'>) {
    return value.id;
}

function organizationTypeLabelSelector(value: Pick<OrganizationType, 'id' | 'title'>) {
    return value.title;
}

function getProjectSourcesQueryVariables(
    filters: SourcesFilterFields,
) {
    return {
        ...filters,
        createdAt_Gte: convertDateToIsoDateTime(filters.createdAt_Gte),
        createdAt_Lt: convertDateToIsoDateTime(filters.createdAt_Lt),
        entriesFilterData: filters.entriesFilterData ? {
            ...filters.entriesFilterData,
            createdAt_Gte: convertDateToIsoDateTime(filters.entriesFilterData.createdAt_Gte),
            createdAt_Lt: convertDateToIsoDateTime(filters.entriesFilterData.createdAt_Lt),
            filterableData: filters.entriesFilterData.filterableData
                ? filters.entriesFilterData.filterableData.filter((filterable) => (
                    isDefined(filterable.value)
                    || isDefined(filterable.valueGte)
                    || isDefined(filterable.valueLte)
                    || isDefined(filterable.valueList)
                ))
                : undefined,
        } : undefined,
    };
}

interface Props {
    className?: string;
    disabled?: boolean;
    projectId: string;
    filterOnlyUnprotected?: boolean;
    onFilterApply: (value: Omit<SourceFilterOptionsQueryVariables, 'projectId'>) => void;
}

function SourcesFilter(props: Props) {
    const {
        className,
        onFilterApply,
        projectId,
        filterOnlyUnprotected,
        disabled,
    } = props;

    const [members, setMembers] = useState<ProjectMember[] | undefined | null>();

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, initialValue);

    const {
        data: sourceFilterOptions,
        loading,
        error: sourceFilterOptionsError,
    } = useQuery<SourceFilterOptionsQuery, SourceFilterOptionsQueryVariables>(
        SOURCE_FILTER_OPTIONS,
        {
            variables: {
                projectId,
            },
        },
    );

    const error = getErrorObject(riskyError);

    const handleSubmit = useCallback((values) => {
        const finalValues = getProjectSourcesQueryVariables(values);
        onFilterApply(finalValues);
    }, [onFilterApply]);

    const handleApply = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            handleSubmit,
        );
        submit();
    }, [setError, validate, handleSubmit]);

    const handleClear = useCallback(() => {
        setValue(initialValue);
        onFilterApply({});
    }, [setValue, onFilterApply]);

    const [
        allFiltersVisible,,,,
        toggleAllFiltersVisibility,
    ] = useBooleanState(false);

    const statusOptions = sourceFilterOptions
        ?.sourceStatusOptions?.enumValues;
    const existsOptions = sourceFilterOptions
        ?.sourceExistsOptions?.enumValues;
    const priorityOptions = sourceFilterOptions
        ?.sourcePriorityOptions?.enumValues;
    const confidentialityOptions = sourceFilterOptions
        ?.sourceConfidentialityOptions?.enumValues;
    const organizationTypeOptions = sourceFilterOptions?.organizationTypes?.results;

    return (
        <div className={_cs(styles.sourcesFilter, className)}>
            <NonFieldError error={error} />
            <div className={styles.content}>
                <TextInput
                    className={styles.input}
                    icons={<IoSearch />}
                    name="search"
                    onChange={setFieldValue}
                    value={value.search}
                    error={error?.search}
                    disabled={disabled}
                    label={_ts('sourcesFilter', 'search')}
                />
                <MultiSelectInput
                    className={styles.input}
                    name="statuses"
                    onChange={setFieldValue}
                    options={statusOptions}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    value={value.statuses}
                    error={getErrorString(error?.statuses)}
                    label={_ts('sourcesFilter', 'status')}
                    disabled={disabled || loading || !!sourceFilterOptionsError}
                />
                <DateRangeDualInput
                    className={styles.input}
                    fromName="publishedOn_Gte"
                    fromOnChange={setFieldValue}
                    fromValue={value.publishedOn_Gte}
                    toName="publishedOn_Lt"
                    toOnChange={setFieldValue}
                    toValue={value.publishedOn_Lt}
                    disabled={disabled}
                    label={_ts('sourcesFilter', 'originalDate')}
                />
                <DateRangeDualInput
                    className={styles.input}
                    fromName="createdAt_Gte"
                    fromOnChange={setFieldValue}
                    fromValue={value.createdAt_Gte}
                    toName="createdAt_Lt"
                    toOnChange={setFieldValue}
                    toValue={value.createdAt_Lt}
                    disabled={disabled}
                    label={_ts('sourcesFilter', 'addedOn')}
                />
                <ProjectMemberMultiSelectInput
                    className={_cs(
                        styles.input,
                        (hasNoData(value?.assignees) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="assignees"
                    projectId={projectId}
                    value={value?.assignees}
                    onChange={setFieldValue}
                    options={members}
                    onOptionsChange={setMembers}
                    label="Entry created by"
                    placeholder="Entry created by"
                    disabled={disabled}
                />
                <SelectInput
                    className={_cs(
                        styles.input,
                        (hasNoData(value.exists) && !allFiltersVisible) && styles.hidden,
                    )}
                    name="exists"
                    onChange={setFieldValue}
                    options={existsOptions}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    value={value.exists}
                    error={error?.exists}
                    label={_ts('sourcesFilter', 'exists')}
                    disabled={disabled || loading || !!sourceFilterOptionsError}
                />
                <MultiSelectInput
                    className={_cs(
                        styles.input,
                        (hasNoData(value.priorities) && !allFiltersVisible) && styles.hidden,
                    )}
                    name="priorities"
                    onChange={setFieldValue}
                    options={priorityOptions}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    value={value.priorities}
                    error={getErrorString(error?.priorities)}
                    label={_ts('sourcesFilter', 'priority')}
                    disabled={disabled || loading || !!sourceFilterOptionsError}
                />
                <MultiSelectInput
                    className={_cs(
                        styles.input,
                        (hasNoData(value.authoringOrganizationTypes)
                        && !allFiltersVisible) && styles.hidden,
                    )}
                    name="authoringOrganizationTypes"
                    onChange={setFieldValue}
                    options={organizationTypeOptions}
                    keySelector={organizationTypeKeySelector}
                    labelSelector={organizationTypeLabelSelector}
                    value={value.authoringOrganizationTypes}
                    error={getErrorString(error?.authoringOrganizationTypes)}
                    label={_ts('sourcesFilter', 'authoringOrganizationTypes')}
                    disabled={disabled || loading || !!sourceFilterOptionsError}
                />
                {!filterOnlyUnprotected && (
                    <SelectInput
                        className={_cs(
                            styles.input,
                            (hasNoData(value.confidentiality) && !allFiltersVisible)
                            && styles.hidden,
                        )}
                        name="confidentiality"
                        onChange={setFieldValue}
                        options={confidentialityOptions}
                        keySelector={enumKeySelector}
                        labelSelector={enumLabelSelector}
                        value={value.confidentiality}
                        error={getErrorString(error?.confidentiality)}
                        label={_ts('sourcesFilter', 'confidentiality')}
                        disabled={disabled || loading || !!sourceFilterOptionsError}
                    />
                )}
                <EntryFilter
                    name="entriesFilterData"
                    value={value.entriesFilterData}
                    onChange={setFieldValue}
                    projectId={projectId}
                    options={sourceFilterOptions}
                    optionsDisabled={loading || !!sourceFilterOptionsError}
                    allFiltersVisible={allFiltersVisible}
                    disabled={disabled}
                />
                <div className={styles.actions}>
                    <Button
                        disabled={disabled || pristine}
                        name="sourcesFilterSubmit"
                        variant="transparent"
                        onClick={handleApply}
                    >
                        {_ts('sourcesFilter', 'apply')}
                    </Button>
                    <Button
                        disabled={disabled || pristine}
                        name="clearFilter"
                        variant="transparent"
                        actions={<IoClose />}
                        onClick={handleClear}
                    >
                        {_ts('sourcesFilter', 'clearAll')}
                    </Button>
                    <Button
                        name="showAll"
                        variant="transparent"
                        actions={allFiltersVisible ? (
                            <IoChevronUpOutline />
                        ) : (
                            <IoChevronDownOutline />
                        )}
                        onClick={toggleAllFiltersVisibility}
                    >
                        {allFiltersVisible ? 'Show Less' : 'Show All'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SourcesFilter;
