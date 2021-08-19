import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
    getErrorString,
    getErrorObject,
    defaultUndefinedType,
} from '@togglecorp/toggle-form';
import {
    TextInput,
    DateRangeInput,
    SelectInput,
    MultiSelectInput,
    Button,
} from '@the-deep/deep-ui';
import {
    IoSearch,
    IoClose,
    IoChevronUpOutline,
    IoChevronDownOutline,
} from 'react-icons/io5';

import { useModalState } from '#hooks/stateManagement';
import { useRequest } from '#utils/request';

import {
    KeyValueElement,
    LeadOptions,
    EmmEntity,
    WidgetElement,
    FilterFields,
    EntryOptions,
} from '#typings';

import NonFieldError from '#newComponents/ui/NonFieldError';

import { SourceEntryFilter } from '../../types';
import EntryFilter from './EntryFilter';
import styles from './styles.scss';

type FormSchema = ObjectSchema<SourceEntryFilter>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        status: [defaultUndefinedType],
        createdAt: [defaultUndefinedType],
        publishedOn: [defaultUndefinedType],
        assignee: [defaultUndefinedType],
        search: [defaultUndefinedType],
        exists: [defaultUndefinedType],
        priority: [defaultUndefinedType],
        authoringOrganizationTypes: [defaultUndefinedType],
        confidentiality: [defaultUndefinedType],
        emmRiskFactors: [defaultUndefinedType],
        emmKeywords: [defaultUndefinedType],
        emmEntities: [defaultUndefinedType],
        entriesFilter: [defaultUndefinedType],
    }),
};

const initialValue: SourceEntryFilter = {};

const keySelector = (d: KeyValueElement): string => d.key;
const labelSelector = (d: KeyValueElement): string => d.value;
const emmKeySelector = (d: EmmEntity): string => d.key.toString();
const emmLabelSelector = (d: EmmEntity): string => `${d.label} ${d.totalCount}`;

const existsFilterOptions: KeyValueElement[] = [
    {
        key: 'assessment_exists',
        value: 'Yes',
    },
    {
        key: 'assessment_does_not_exist',
        value: 'No',
    },
];

interface Props {
    className?: string;
    entryOptions?: EntryOptions;
    filters?: FilterFields[];
    widgets?: WidgetElement<unknown>[];
    projectId: number;
    filterOnlyUnprotected?: boolean;
    onFilterApply: (values: SourceEntryFilter) => void;
    hasAssessment?: boolean;
}

function CombinedSourceEntryFilterForm(props: Props) {
    const {
        className,
        onFilterApply,
        projectId,
        filters,
        widgets,
        entryOptions,
        filterOnlyUnprotected,
        hasAssessment,
    } = props;

    const [
        allFiltersVisible,
        showAllFilters,
        hideAllFilters,
    ] = useModalState(false);

    const queryOptions = useMemo(() => ({
        projects: [projectId],
    }), [projectId]);

    const {
        pending,
        response: leadOptions,
    } = useRequest<LeadOptions>({
        skip: isNotDefined(projectId),
        url: 'server://lead-options/',
        method: 'GET',
        query: queryOptions,
        failureHeader: 'Source Entry Filter',
    });

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, initialValue);

    const error = getErrorObject(riskyError);

    const handleApply = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        setError(err);
        if (!errored && isDefined(val)) {
            onFilterApply(val);
        }
    }, [setError, validate, onFilterApply]);

    const handleClear = useCallback(() => {
        setValue(initialValue);
        onFilterApply(initialValue);
    }, [setValue, onFilterApply]);

    return (
        <div className={_cs(styles.sourceEntryFilterForm, className)}>
            <NonFieldError error={error} />
            <div className={styles.content}>
                <TextInput
                    className={styles.input}
                    icons={<IoSearch />}
                    name="search"
                    onChange={setFieldValue}
                    value={value.search}
                    error={error?.search}
                    label="Search"
                    placeholder="Search"
                />
                <MultiSelectInput
                    className={styles.input}
                    name="status"
                    onChange={setFieldValue}
                    options={leadOptions?.status}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.status}
                    error={getErrorString(error?.status)}
                    disabled={pending}
                    label="Status"
                    placeholder="Status"
                />
                <DateRangeInput
                    className={styles.input}
                    name="publishedOn"
                    onChange={setFieldValue}
                    value={value.publishedOn}
                    disabled={pending}
                    label="Published On"
                />
                <DateRangeInput
                    className={styles.input}
                    name="createdAt"
                    onChange={setFieldValue}
                    value={value.createdAt}
                    label="Added on"
                />
                <MultiSelectInput
                    className={styles.input}
                    name="assignee"
                    onChange={setFieldValue}
                    options={leadOptions?.assignee}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    disabled={pending}
                    value={value.assignee}
                    error={getErrorString(error?.assignee)}
                    label="Assignee"
                    placeholder="Assignee"
                />
                {!hasAssessment && (
                    <SelectInput
                        className={styles.input}
                        name="exists"
                        onChange={setFieldValue}
                        options={existsFilterOptions}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        value={value.exists}
                        error={error?.exists}
                        label="Has assessment"
                        placeholder="Has assessment"
                    />
                )}
                <MultiSelectInput
                    className={styles.input}
                    name="priority"
                    onChange={setFieldValue}
                    options={leadOptions?.priority}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.priority}
                    error={getErrorString(error?.priority)}
                    disabled={pending}
                    label="Priority"
                    placeholder="Priority"
                />
                <MultiSelectInput
                    className={styles.input}
                    name="authoringOrganizationTypes"
                    onChange={setFieldValue}
                    options={leadOptions?.organizationTypes}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.authoringOrganizationTypes}
                    error={getErrorString(error?.authoringOrganizationTypes)}
                    disabled={pending}
                    label="Authoring Organization Type"
                    placeholder="Authoring Organization Type"
                />

                {!filterOnlyUnprotected && (
                    <MultiSelectInput
                        className={styles.input}
                        name="confidentiality"
                        onChange={setFieldValue}
                        options={leadOptions?.confidentiality}
                        disabled={pending}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        value={value.confidentiality}
                        error={getErrorString(error?.confidentiality)}
                        label="Confidentiality"
                        placeholder="Confidentiality"
                    />
                )}
                {leadOptions?.hasEmmLeads && (
                    <>
                        <MultiSelectInput
                            className={styles.input}
                            name="emmRiskFactors"
                            onChange={setFieldValue}
                            options={leadOptions?.emmRiskFactors}
                            keySelector={emmKeySelector}
                            labelSelector={emmLabelSelector}
                            value={value.emmRiskFactors}
                            error={getErrorString(error?.emmRiskFactors)}
                            disabled={pending}
                            label="EMM Risk Factors"
                            placeholder="EMM Risk Factors"
                        />
                        <MultiSelectInput
                            className={styles.input}
                            name="emmKeywords"
                            onChange={setFieldValue}
                            options={leadOptions?.emmKeywords}
                            keySelector={emmKeySelector}
                            labelSelector={emmLabelSelector}
                            value={value.emmKeywords}
                            error={getErrorString(error?.emmKeywords)}
                            disabled={pending}
                            label="EMM Keywords"
                            placeholder="EMM Keywords"
                        />
                        <MultiSelectInput
                            className={styles.input}
                            name="emmEntities"
                            onChange={setFieldValue}
                            options={leadOptions?.emmEntities}
                            keySelector={emmKeySelector}
                            labelSelector={emmLabelSelector}
                            value={value.emmEntities}
                            disabled={pending}
                            error={getErrorString(error?.emmEntities)}
                            label="EMM Entities"
                            placeholder="EMM Entities"
                        />
                    </>
                )}
                {allFiltersVisible && !hasAssessment && (
                    <EntryFilter
                        className={styles.entryFilter}
                        name="entriesFilter"
                        value={value.entriesFilter}
                        onChange={setFieldValue}
                        projectId={projectId}
                        filters={filters}
                        widgets={widgets}
                        entryOptions={entryOptions}
                    />
                )}
                <div className={styles.actions}>
                    {!hasAssessment && (
                        <Button
                            className={styles.button}
                            name="showAll"
                            variant="action"
                            actions={allFiltersVisible ? (
                                <IoChevronUpOutline />
                            ) : (
                                <IoChevronDownOutline />
                            )}
                            onClick={allFiltersVisible ? hideAllFilters : showAllFilters}
                        >
                            { allFiltersVisible ? 'Hide filters' : 'Show all filters' }
                        </Button>
                    )}
                    <Button
                        className={styles.button}
                        disabled={pristine}
                        name="filterSubmit"
                        variant="action"
                        onClick={handleApply}
                    >
                        Apply
                    </Button>
                    <Button
                        className={styles.button}
                        disabled={pristine}
                        name="clearFilter"
                        variant="action"
                        actions={<IoClose />}
                        onClick={handleClear}
                    >
                        Clear all
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default CombinedSourceEntryFilterForm;
