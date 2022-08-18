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
import SourcesFilterContext from '#components/leadFilters/SourcesFilterContext';
import BooleanInput from '#components/selections/BooleanInput';
import NonFieldError from '#components/NonFieldError';
import { OrganizationType } from '#generated/types';

import schema, {
    FormType,
    PartialFormType,
} from './schema';
import EntryFilter from './EntryFilter';
import styles from './styles.css';

const initialValue: PartialFormType = {};

// FIXME: use utils
function organizationTypeKeySelector(value: Pick<OrganizationType, 'id' | 'title'>) {
    return value.id;
}

// FIXME: use utils
function organizationTypeLabelSelector(value: Pick<OrganizationType, 'id' | 'title'>) {
    return value.title;
}

// FIXME: move this somewhere else
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
            // FIXME: we do not need to do this, we will filter on form itself
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

// FIXME: move this somewhere else
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

    optionsLoading: boolean;
    optionsErrored: boolean;
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
        optionsLoading,
        optionsErrored,
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
        statusOptions,
        priorityOptions,
        confidentialityOptions,
        organizationTypeOptions,
        hasEntryOptions,
        hasAssessmentOptions,
        entryTypeOptions,
        frameworkFilters,
    } = useContext(SourcesFilterContext);

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
                        label="Title"
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
                        disabled={disabled || optionsLoading || optionsErrored}
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
                        label="Date Published"
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
                        label="Date Created"
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
                                disabled={disabled || optionsLoading}
                            />
                            <BooleanInput
                                variant="general"
                                options={hasAssessmentOptions}
                                name="hasAssessment"
                                value={value.hasAssessment}
                                onChange={setFieldValue}
                                label="Assessment Status"
                                error={error?.hasAssessment}
                                disabled={disabled || optionsLoading}
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
                        label="Created By"
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
                        label="Assignee"
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
                        disabled={disabled || optionsLoading || optionsErrored}
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
                        disabled={disabled || optionsLoading || optionsErrored}
                    />
                    <NewOrganizationMultiSelectInput
                        variant="general"
                        name="authorOrganizations"
                        value={value.authorOrganizations}
                        onChange={setFieldValue}
                        options={authorOrganizationOptions}
                        onOptionsChange={setAuthorOrganizationOptions}
                        disabled={disabled || optionsLoading}
                        label="Authoring Organization"
                        error={getErrorString(error?.authorOrganizations)}
                        usedInProject={projectId}
                    />
                    <NewOrganizationMultiSelectInput
                        variant="general"
                        name="sourceOrganizations"
                        value={value.sourceOrganizations}
                        onChange={setFieldValue}
                        options={sourceOrganizationOptions}
                        onOptionsChange={setSourceOrganizationOptions}
                        disabled={disabled || optionsLoading}
                        label="Source Organization"
                        error={getErrorString(error?.sourceOrganizations)}
                        usedInProject={projectId}
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
                            disabled={disabled || optionsLoading || optionsErrored}
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
                            optionsDisabled={optionsLoading || optionsErrored}
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
