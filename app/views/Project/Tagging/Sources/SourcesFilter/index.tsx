import React, { useContext } from 'react';
import {
    _cs,
    isDefined,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import {
    getErrorObject,
    getErrorString,
    useForm,
    Error,
    EntriesAsList,
} from '@togglecorp/toggle-form';
import {
    TextInput,
    SelectInput,
    MultiSelectInput,
    CheckListInput,
    DateDualRangeInput,
    Tabs,
    TabList,
    Tab,
    TabPanel,
} from '@the-deep/deep-ui';
import {
    IoSearch,
} from 'react-icons/io5';
import _ts from '#ts';
import {
    enumKeySelector,
    enumLabelSelector,
    convertDateToIsoDateTime,
} from '#utils/common';
import ProjectMemberMultiSelectInput from '#components/selections/ProjectMemberMultiSelectInput';
import NewOrganizationMultiSelectInput from '#components/selections/NewOrganizationMultiSelectInput';
import BooleanInput from '#components/selections/BooleanInput';
import NonFieldError from '#components/NonFieldError';
import { OrganizationType } from '#generated/types';

import SourcesFilterContext from '../SourcesFilterContext';
import schema, {
    FormType,
    PartialFormType,
} from './schema';
import EntryFilter from './EntryFilter';
import useFilterOptions from './useFilterOptions';
import styles from './styles.css';

const initialValue: PartialFormType = {};

function organizationTypeKeySelector(value: Pick<OrganizationType, 'id' | 'title'>) {
    return value.id;
}

function organizationTypeLabelSelector(value: Pick<OrganizationType, 'id' | 'title'>) {
    return value.title;
}

export function getProjectSourcesQueryVariables(
    filters: Omit<FormType, 'projectId'>,
): Omit<FormType, 'projectId'> {
    const entriesFilterData = filters.entriesFilterData ? {
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
                || (isDefined(filterable.valueList) && filterable.valueList.length > 0)
            ))
            : undefined,
    } : undefined;
    const isEntriesFilterDataEmpty = doesObjectHaveNoData(entriesFilterData, ['', null]);

    return {
        ...filters,
        createdAtGte: convertDateToIsoDateTime(filters.createdAtGte),
        createdAtLte: convertDateToIsoDateTime(filters.createdAtLte, { endOfDay: true }),
        entriesFilterData: isEntriesFilterDataEmpty ? undefined : entriesFilterData,
    };
}

export function useFilterState() {
    const {
        value,
        error: formError,
        setFieldValue,
        setValue,
        pristine,
        setError,
        validate,
        setPristine,
    } = useForm(schema, initialValue);
    const error = getErrorObject(formError);

    const resetValue = React.useCallback(() => {
        setValue(initialValue);
    }, [setValue]);

    const returnValue = React.useMemo(() => ({
        value,
        error,
        setFieldValue,
        setValue,
        resetValue,
        pristine,
        setError,
        validate,
        setPristine,
    }), [
        value,
        error,
        setFieldValue,
        setValue,
        resetValue,
        pristine,
        setError,
        validate,
        setPristine,
    ]);

    return returnValue;
}

interface Props {
    className?: string;
    disabled?: boolean;
    projectId: string;
    value: PartialFormType;
    filterOnlyUnprotected?: boolean;
    isEntriesOnlyFilter?: boolean;
    hideEntriesFilter?: boolean;
    contentClassName?: string;
    error?: Error<FormType>;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
}

function SourcesFilter(props: Props) {
    const {
        className,
        projectId,
        filterOnlyUnprotected,
        value,
        disabled,
        isEntriesOnlyFilter = false,
        hideEntriesFilter = false,
        contentClassName,
        error: formError,
        onChange: setFieldValue,
    } = props;

    const error = getErrorObject(formError);
    const [activeTab, setActiveTab] = React.useState<'source' | 'entry' | undefined>('source');

    const {
        createdByOptions,
        setCreatedByOptions,
        assigneeOptions,
        setAssigneeOptions,
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    } = useContext(SourcesFilterContext);

    const {
        statusOptions,
        priorityOptions,
        confidentialityOptions,
        organizationTypeOptions,
        hasEntryOptions,
        hasAssessmentOptions,
        entryTypeOptions,
        frameworkFilters,
        loading,
        error: sourceFilterOptionsError,
    } = useFilterOptions(projectId);

    return (
        <Tabs
            value={activeTab}
            onChange={setActiveTab}
        >
            <div className={_cs(styles.sourcesFilter, className)}>
                <NonFieldError error={error} />
                <TabList
                    className={styles.tabList}
                >
                    <Tab
                        name="source"
                        className={styles.tab}
                        transparentBorder
                    >
                        Source Filters
                    </Tab>
                    {!hideEntriesFilter && (
                        <Tab
                            name="entry"
                            className={styles.tab}
                            transparentBorder
                        >
                            Entry Filters
                        </Tab>
                    )}
                </TabList>
                <TabPanel
                    name="source"
                    className={_cs(styles.tabContent, contentClassName)}
                >
                    <TextInput
                        variant="general"
                        icons={<IoSearch />}
                        name="search"
                        onChange={setFieldValue}
                        value={value.search}
                        error={error?.search}
                        disabled={disabled}
                        label="Source Title Search"
                    />
                    <CheckListInput
                        className={styles.checklist}
                        listContainerClassName={styles.verticalList}
                        name="statuses"
                        onChange={setFieldValue}
                        options={statusOptions ?? undefined}
                        keySelector={enumKeySelector}
                        labelSelector={enumLabelSelector}
                        value={value.statuses}
                        error={getErrorString(error?.statuses)}
                        label={_ts('sourcesFilter', 'status')}
                        disabled={disabled || loading || !!sourceFilterOptionsError}
                    />
                    <DateDualRangeInput
                        variant="general"
                        fromName="publishedOnGte"
                        fromOnChange={setFieldValue}
                        fromValue={value.publishedOnGte}
                        toName="publishedOnLte"
                        toOnChange={setFieldValue}
                        toValue={value.publishedOnLte}
                        disabled={disabled}
                        label="Published On"
                    />
                    <DateDualRangeInput
                        variant="general"
                        fromName="createdAtGte"
                        fromOnChange={setFieldValue}
                        fromValue={value.createdAtGte}
                        toName="createdAtLte"
                        toOnChange={setFieldValue}
                        toValue={value.createdAtLte}
                        disabled={disabled}
                        label="Source Created At"
                    />
                    {!isEntriesOnlyFilter && (
                        <>
                            <BooleanInput
                                variant="general"
                                options={hasEntryOptions}
                                name="hasEntries"
                                value={value.hasEntries}
                                onChange={setFieldValue}
                                label="Has Entry"
                                error={error?.hasEntries}
                                disabled={disabled || loading}
                            />
                            <BooleanInput
                                variant="general"
                                options={hasAssessmentOptions}
                                name="hasAssessment"
                                value={value.hasAssessment}
                                onChange={setFieldValue}
                                label="Has Assessment"
                                error={error?.hasAssessment}
                                disabled={disabled || loading}
                            />
                        </>
                    )}
                    <ProjectMemberMultiSelectInput
                        variant="general"
                        name="createdBy"
                        projectId={projectId}
                        value={value.createdBy}
                        onChange={setFieldValue}
                        options={createdByOptions}
                        onOptionsChange={setCreatedByOptions}
                        label="Source Created By"
                        disabled={disabled}
                    />
                    <ProjectMemberMultiSelectInput
                        variant="general"
                        name="assignees"
                        projectId={projectId}
                        value={value.assignees}
                        onChange={setFieldValue}
                        options={assigneeOptions}
                        onOptionsChange={setAssigneeOptions}
                        label="Assignees"
                        disabled={disabled}
                    />
                    <MultiSelectInput
                        variant="general"
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
                        variant="general"
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
                    <NewOrganizationMultiSelectInput
                        variant="general"
                        name="authorOrganizations"
                        value={value.authorOrganizations}
                        onChange={setFieldValue}
                        options={authorOrganizationOptions}
                        onOptionsChange={setAuthorOrganizationOptions}
                        disabled={disabled || loading}
                        label="Authoring Organizations"
                        error={getErrorString(error?.authorOrganizations)}
                    />
                    <NewOrganizationMultiSelectInput
                        variant="general"
                        name="sourceOrganizations"
                        value={value.sourceOrganizations}
                        onChange={setFieldValue}
                        options={sourceOrganizationOptions}
                        onOptionsChange={setSourceOrganizationOptions}
                        disabled={disabled || loading}
                        label="Source Organizations"
                        error={getErrorString(error?.sourceOrganizations)}
                    />
                    {!filterOnlyUnprotected && (
                        <SelectInput
                            variant="general"
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
                </TabPanel>
                {!hideEntriesFilter && (
                    <TabPanel
                        name="entry"
                        className={_cs(styles.tabContent, contentClassName)}
                    >
                        <EntryFilter
                            name="entriesFilterData"
                            value={value.entriesFilterData}
                            onChange={setFieldValue}
                            projectId={projectId}
                            entryTypeOptions={entryTypeOptions}
                            frameworkFilters={frameworkFilters}
                            optionsDisabled={loading || !!sourceFilterOptionsError}
                            allFiltersVisible
                            disabled={disabled}
                        />
                    </TabPanel>
                )}
            </div>
        </Tabs>
    );
}

export default SourcesFilter;
