import React, { useCallback, useState } from 'react';
import {
    _cs,
    isDefined,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    useForm,
} from '@togglecorp/toggle-form';
import {
    TextInput,
    SelectInput,
    MultiSelectInput,
    useBooleanState,
    Button,
    DateDualRangeInput,
} from '@the-deep/deep-ui';
import {
    IoSearch,
    IoClose,
    IoChevronUpOutline,
    IoChevronDownOutline,
} from 'react-icons/io5';
import { gql, useQuery } from '@apollo/client';
import _ts from '#ts';
import {
    hasNoData,
    enumKeySelector,
    enumLabelSelector,
    convertDateToIsoDateTime,
} from '#utils/common';
import ProjectMemberMultiSelectInput, { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import NonFieldError from '#components/NonFieldError';
import {
    SourceFilterOptionsQueryVariables,
    OrganizationType,
} from '#generated/types';

import {
    SourcesFilterFields,
    SourceFilterOptions,
} from './types';
import schema, { PartialFormType } from './schema';
import EntryFilter from './EntryFilter';
import styles from './styles.css';

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

function organizationTypeKeySelector(value: Pick<OrganizationType, 'id' | 'title'>) {
    return value.id;
}

function organizationTypeLabelSelector(value: Pick<OrganizationType, 'id' | 'title'>) {
    return value.title;
}

function getProjectSourcesQueryVariables(
    filters: SourcesFilterFields,
) {
    const isEntriesFilterDataEmpty = doesObjectHaveNoData(filters.entriesFilterData, ['', null]);

    return {
        ...filters,
        createdAtGte: convertDateToIsoDateTime(filters.createdAtGte),
        createdAtLte: convertDateToIsoDateTime(filters.createdAtLte, { endOfDay: true }),
        entriesFilterData: (filters.entriesFilterData && !isEntriesFilterDataEmpty) ? {
            ...filters.entriesFilterData,
            createdAtGte: convertDateToIsoDateTime(filters.entriesFilterData.createdAtGte),
            createdAtLte: convertDateToIsoDateTime(
                filters.entriesFilterData.createdAtLte,
                { endOfDay: true },
            ),
            filterableData: filters.entriesFilterData.filterableData
                ? filters.entriesFilterData.filterableData.filter((filterable) => (
                    isDefined(filterable.value)
                    || isDefined(filterable.valueGte)
                    || isDefined(filterable.valueLte)
                    || isDefined(filterable.valueList)
                ))
                : undefined,
        } : undefined,
        customFilters: isEntriesFilterDataEmpty ? undefined : 'EXCLUDE_EMPTY_FILTERED_ENTRIES',
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
    } = useQuery<SourceFilterOptions, SourceFilterOptionsQueryVariables>(
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
                <DateDualRangeInput
                    className={styles.input}
                    fromName="publishedOnGte"
                    fromOnChange={setFieldValue}
                    fromValue={value.publishedOnGte}
                    toName="publishedOnLte"
                    toOnChange={setFieldValue}
                    toValue={value.publishedOnLte}
                    disabled={disabled}
                    label={_ts('sourcesFilter', 'originalDate')}
                />
                <DateDualRangeInput
                    className={styles.input}
                    fromName="createdAtGte"
                    fromOnChange={setFieldValue}
                    fromValue={value.createdAtGte}
                    toName="createdAtLte"
                    toOnChange={setFieldValue}
                    toValue={value.createdAtLte}
                    disabled={disabled}
                    label={_ts('sourcesFilter', 'addedOn')}
                />
                <ProjectMemberMultiSelectInput
                    className={_cs(
                        styles.input,
                        (hasNoData(value.assignees) && !allFiltersVisible)
                        && styles.hidden,
                    )}
                    name="assignees"
                    projectId={projectId}
                    value={value.assignees}
                    onChange={setFieldValue}
                    options={members}
                    onOptionsChange={setMembers}
                    label="Assignees"
                    placeholder="Assignees"
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
