import React, { useCallback } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
    getErrorString,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    TextInput,
    SelectInput,
    MultiSelectInput,
    useBooleanState,
    DateRangeInput,
    Button,
} from '@the-deep/deep-ui';
import {
    IoSearch,
    IoClose,
    IoChevronUpOutline,
    IoChevronDownOutline,
} from 'react-icons/io5';
import { gql, useQuery } from '@apollo/client';
import { EnumEntity } from '#types';
import _ts from '#ts';
import { enumKeySelector, enumLabelSelector } from '#utils/common';
import NonFieldError from '#components/NonFieldError';
import {
    ProjectSourcesQueryVariables,
    LeadPriorityEnum,
    LeadConfidentialityEnum,
    LeadExistsEnum,
    SourceFilterOptionsQuery,
    LeadStatusEnum,
    UserType,
    OrganizationTypeType,
} from '#generated/types';
import styles from './styles.css';

// FIXME: Created at and published on are date ranges and not date inputs
export type SourcesFilterFields = Omit<ProjectSourcesQueryVariables,
    'ordering' | 'page' | 'pageSize' | 'projectId' | 'createdAt_Gte' | 'createdAt_Lt' | 'publishedOn_Gte' | 'publishedOn_Lt'> & {
        createdAt?: {
            startDate: string;
            endDate: string;
        }
        publishedOn?: {
            startDate: string;
            endDate: string;
        }
    };
type FormType = SourcesFilterFields;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        statuses: [],
        createdAt: [],
        publishedOn: [],
        assignees: [],
        search: [],
        exists: [],
        priorities: [],
        authoringOrganizationTypes: [],
        confidentiality: [],
        emmRiskFactors: [],
        emmKeywords: [],
        emmEntities: [],
    }),
};

const initialValue: FormType = {};

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
            members {
                id
                displayName
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
    }
`;

const userKeySelector = (d: Pick<UserType, 'id' | 'displayName'>) => d.id;
const userLabelSelector = (d: Pick<UserType, 'id' | 'displayName'>) => d.displayName;
const organizationTypeKeySelector = (d: Pick<OrganizationTypeType, 'id' | 'title'>) => d.id;
const organizationTypeLabelSelector = (d: Pick<OrganizationTypeType, 'id' | 'title'>) => d.title;

interface Props {
    className?: string;
    disabled?: boolean;
    projectId: string;
    filterOnlyUnprotected?: boolean;
    onFilterApply: (value: SourcesFilterFields) => void;
}

function SourcesFilter(props: Props) {
    const {
        className,
        onFilterApply,
        projectId,
        filterOnlyUnprotected,
        disabled,
    } = props;

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
    } = useQuery<SourceFilterOptionsQuery>(
        SOURCE_FILTER_OPTIONS,
        {
            variables: {
                projectId,
            },
        },
    );

    const error = getErrorObject(riskyError);

    const handleApply = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            onFilterApply,
        );
        submit();
    }, [setError, validate, onFilterApply]);

    const handleClear = useCallback(() => {
        setValue(initialValue);
        onFilterApply(initialValue);
    }, [setValue, onFilterApply]);

    const [
        showContent,,,,
        toggleContentVisibility,
    ] = useBooleanState(false);

    const statusOptions = sourceFilterOptions
        ?.sourceStatusOptions?.enumValues as EnumEntity<LeadStatusEnum>[] | undefined;
    const existsOptions = sourceFilterOptions
        ?.sourceExistsOptions?.enumValues as EnumEntity<LeadExistsEnum>[] | undefined;
    const priorityOptions = sourceFilterOptions
        ?.sourcePriorityOptions?.enumValues as EnumEntity<LeadPriorityEnum>[] | undefined;
    const confidentialityOptions = sourceFilterOptions
        ?.sourceConfidentialityOptions?.enumValues as EnumEntity<LeadConfidentialityEnum>[]
        | undefined;
    const assigneesOptions = sourceFilterOptions
        ?.project?.members;
    const organizationTypeOptions = sourceFilterOptions?.organizationTypes?.results;
    const emmEntitiesOptions = sourceFilterOptions
        ?.emmEntititiesOptions?.enumValues as EnumEntity<string>[] | undefined;
    const emmRiskFactorsOptions = sourceFilterOptions
        ?.emmRiskFactorsOptions?.enumValues as EnumEntity<string>[] | undefined;
    const emmKeywordsOptions = sourceFilterOptions
        ?.emmKeywordsOptions?.enumValues as EnumEntity<string>[] | undefined;

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
                />
                <DateRangeInput
                    className={styles.input}
                    name="publishedOn"
                    onChange={setFieldValue}
                    value={value.publishedOn}
                    disabled={disabled}
                    label={_ts('sourcesFilter', 'originalDate')}
                />
                <DateRangeInput
                    className={styles.input}
                    name="createdAt"
                    onChange={setFieldValue}
                    value={value.createdAt}
                    disabled={disabled}
                    label={_ts('sourcesFilter', 'addedOn')}
                />
                <MultiSelectInput
                    className={styles.input}
                    name="assignees"
                    onChange={setFieldValue}
                    options={assigneesOptions}
                    keySelector={userKeySelector}
                    labelSelector={userLabelSelector}
                    value={value.assignees}
                    error={getErrorString(error?.assignees)}
                    label={_ts('sourcesFilter', 'assignee')}
                />
                <SelectInput
                    className={_cs(
                        styles.input,
                        (hasNoData(value.exists) && !showContent) && styles.hidden,
                    )}
                    name="exists"
                    onChange={setFieldValue}
                    options={existsOptions}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    value={value.exists}
                    error={error?.exists}
                    label={_ts('sourcesFilter', 'exists')}
                />
                <MultiSelectInput
                    className={_cs(
                        styles.input,
                        (hasNoData(value.priority) && !showContent) && styles.hidden,
                    )}
                    name="priorities"
                    onChange={setFieldValue}
                    options={priorityOptions}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    value={value.priorities}
                    error={getErrorString(error?.priorities)}
                    label={_ts('sourcesFilter', 'priority')}
                />
                <MultiSelectInput
                    className={_cs(
                        styles.input,
                        (hasNoData(value.authoringOrganizationTypes)
                      && !showContent) && styles.hidden,
                    )}
                    name="authoringOrganizationTypes"
                    onChange={setFieldValue}
                    options={organizationTypeOptions}
                    keySelector={organizationTypeKeySelector}
                    labelSelector={organizationTypeLabelSelector}
                    value={value.authoringOrganizationTypes}
                    error={getErrorString(error?.authoringOrganizationTypes)}
                    label={_ts('sourcesFilter', 'authoringOrganizationTypes')}
                />
                {!filterOnlyUnprotected && (
                    <SelectInput
                        className={_cs(
                            styles.input,
                            (hasNoData(value.confidentiality) && !showContent) && styles.hidden,
                        )}
                        name="confidentiality"
                        onChange={setFieldValue}
                        options={confidentialityOptions}
                        keySelector={enumKeySelector}
                        labelSelector={enumLabelSelector}
                        value={value.confidentiality}
                        error={getErrorString(error?.confidentiality)}
                        label={_ts('sourcesFilter', 'confidentiality')}
                    />
                )}
                <MultiSelectInput
                    className={_cs(
                        styles.input,
                        !showContent && styles.hidden,
                    )}
                    name="emmRiskFactors"
                    onChange={setFieldValue}
                    options={emmRiskFactorsOptions}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    value={value.emmRiskFactors}
                    error={getErrorString(error?.emmRiskFactors)}
                    label={_ts('sourcesFilter', 'emmRiskFactors')}
                />
                <MultiSelectInput
                    className={_cs(
                        styles.input,
                        !showContent && styles.hidden,
                    )}
                    name="emmKeywords"
                    onChange={setFieldValue}
                    options={emmKeywordsOptions}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    value={value.emmKeywords}
                    error={getErrorString(error?.emmKeywords)}
                    label={_ts('sourcesFilter', 'emmKeywords')}
                />
                <MultiSelectInput
                    className={_cs(
                        styles.input,
                        !showContent && styles.hidden,
                    )}
                    name="emmEntities"
                    onChange={setFieldValue}
                    options={emmEntitiesOptions}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    value={value.emmEntities}
                    error={getErrorString(error?.emmEntities)}
                    label={_ts('sourcesFilter', 'emmEntities')}
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
                        actions={showContent ? (
                            <IoChevronUpOutline />
                        ) : (
                            <IoChevronDownOutline />
                        )}
                        onClick={toggleContentVisibility}
                    >
                        {showContent ? 'Show Less' : 'Show All'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SourcesFilter;
