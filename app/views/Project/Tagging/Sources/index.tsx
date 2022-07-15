import React, { useState, useCallback, useMemo } from 'react';
import { _cs, doesObjectHaveNoData } from '@togglecorp/fujs';
import {
    IoGridOutline,
    IoList,
    IoFunnel,
    IoCheckmark,
    IoClose,
} from 'react-icons/io5';
import {
    Header,
    useHash,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    Button,
    useBooleanState,
    SortContext,
    useSortState,
} from '@the-deep/deep-ui';
import { EntriesAsList, createSubmitHandler } from '@togglecorp/toggle-form';
import {
    useMutation,
    useQuery,
} from '@apollo/client';

import {
    // LeadOrderingEnum,
    SaveLeadFilterMutation,
    SaveLeadFilterMutationVariables,
    ProjectSavedLeadFilterQuery,
    ProjectSavedLeadFilterQueryVariables,
} from '#generated/types';

import _ts from '#ts';
import {
    FrameworkFilterType,
} from '#types/newAnalyticalFramework';
import ProjectContext from '#base/context/ProjectContext';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { BasicOrganization } from '#components/selections/NewOrganizationMultiSelectInput';
import SourcesFilterContext from './SourcesFilterContext';
import SourcesAppliedFilters from './SourcesAppliedFilters';
import SourcesStats from './SourcesStats';
import SourcesFilter, { useFilterState, getProjectSourcesQueryVariables } from './SourcesFilter';
import { PartialFormType, FormType as FilterFormType } from './SourcesFilter/schema';
import SourcesTable from './SourcesTable';
import EntriesGrid from './EntriesGrid';
import { SAVE_LEAD_FILTER, PROJECT_SAVED_LEAD_FILTER } from './queries';
import {
    // getSortState,
    transformRawFiltersToFormValues,
    SortDirection,
} from './utils';

import styles from './styles.css';

interface BooleanOption {
    key: 'true' | 'false';
    value: string;
}

const hasEntryOptions: BooleanOption[] = [
    { key: 'true', value: 'Has entry' },
    { key: 'false', value: 'No entries' },
];

const hasAssessmentOptions: BooleanOption[] = [
    { key: 'true', value: 'Assessment completed' },
    { key: 'false', value: 'Assessment not completed' },
];

const defaultSorting: {
    name: string,
    direction: SortDirection,
} = {
    name: 'CREATED_AT',
    direction: SortDirection.dsc,
};

interface Props {
    className?: string;
}

function Sources(props: Props) {
    const {
        className,
    } = props;

    const { project } = React.useContext(ProjectContext);
    const activeProject = project?.id;

    const [
        filtersShown,
        showFilter,
        , ,
        toggleShowFilter,
    ] = useBooleanState(false);

    const activeView = useHash();

    const [
        createdByOptions,
        setCreatedByOptions,
    ] = useState<ProjectMember[] | undefined | null>();
    const [
        assigneeOptions,
        setAssigneeOptions,
    ] = useState<ProjectMember[] | undefined | null>();
    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();
    const [
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();
    const [
        entryCreatedByOptions,
        setEntryCreatedByOptions,
    ] = useState<ProjectMember[] | undefined | null>();
    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);

    // NOTE: data actually used to send to server
    const [
        sourcesFilters,
        setSourcesFilters,
    ] = useState<PartialFormType>({});

    // NOTE: users should only be able to set "apply previous filter"
    // if they have not changed anything
    const [filterTrulyPristine, setFilterTrulyPristine] = useState(true);

    const {
        value: sourcesFilterValue,
        setFieldValue: setSourcesFilterFieldValue,
        setValue: setSourcesFilterValue,
        resetValue: clearSourcesFilterValue,
        setError,
        validate,
        pristine,
        setPristine,
    } = useFilterState();

    const sortState = useSortState(defaultSorting);

    const validSorting = sortState.sorting || defaultSorting;
    const ordering = validSorting.direction === SortDirection.asc
        ? `ASC_${validSorting.name}`
        : `DESC_${validSorting.name}`;

    const [
        saveLeadFilter,
    ] = useMutation<SaveLeadFilterMutation, SaveLeadFilterMutationVariables>(
        SAVE_LEAD_FILTER,
        {
            onCompleted: (response) => {
                if (!response?.project?.leadFilterSave?.ok) {
                    // eslint-disable-next-line no-console
                    console.error('Failed to save lead filters');
                }
            },
            onError: () => {
                // eslint-disable-next-line no-console
                console.error('Failed to save lead filters');
            },
        },
    );

    const {
        data: projectSavedLeadFilterData,
        loading: projectSavedLeadFilterPending,
        error: projectSavedLeadFilterError,
    } = useQuery<ProjectSavedLeadFilterQuery, ProjectSavedLeadFilterQueryVariables>(
        PROJECT_SAVED_LEAD_FILTER,
        {
            skip: !activeProject,
            variables: activeProject ? { projectId: activeProject } : undefined,
        },
    );

    const statusOptions = projectSavedLeadFilterData
        ?.sourceStatusOptions?.enumValues;
    const priorityOptions = projectSavedLeadFilterData
        ?.sourcePriorityOptions?.enumValues;
    const confidentialityOptions = projectSavedLeadFilterData
        ?.sourceConfidentialityOptions?.enumValues;
    // FIXME: this may be problematic in the future
    const organizationTypeOptions = projectSavedLeadFilterData
        ?.organizationTypes?.results;
    const entryTypeOptions = projectSavedLeadFilterData
        ?.entryTypeOptions?.enumValues;
    const frameworkFilters = (projectSavedLeadFilterData
        ?.project?.analysisFramework?.filters) as (FrameworkFilterType[] | null | undefined);

    const userSavedLeadFilter = projectSavedLeadFilterData
        ?.project?.userSavedLeadFilter;

    const {
        savedFilter,
        savedFilterOptions,
    } = useMemo(
        () => {
            if (!userSavedLeadFilter || !userSavedLeadFilter.filters) {
                return {
                    savedFilter: undefined,
                    savedFilterOptions: undefined,
                };
            }
            const {
                // NOTE: we are not using ordering
                ordering: orderingFilter,
                ...others
            } = userSavedLeadFilter.filters;

            return {
                savedFilter: transformRawFiltersToFormValues(others, frameworkFilters),
                savedFilterOptions: userSavedLeadFilter.filtersData,
            };
        },
        [userSavedLeadFilter, frameworkFilters],
    );

    const sourcesFilterContextValue = useMemo(() => ({
        createdByOptions,
        setCreatedByOptions,
        assigneeOptions,
        setAssigneeOptions,
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
        entryCreatedByOptions,
        setEntryCreatedByOptions,
        geoAreaOptions,
        setGeoAreaOptions,

        statusOptions,
        priorityOptions,
        confidentialityOptions,
        organizationTypeOptions,
        hasAssessmentOptions,
        hasEntryOptions,
        entryTypeOptions,
        frameworkFilters,
    }), [
        createdByOptions,
        assigneeOptions,
        authorOrganizationOptions,
        sourceOrganizationOptions,
        entryCreatedByOptions,
        geoAreaOptions,
        statusOptions,
        priorityOptions,
        confidentialityOptions,
        organizationTypeOptions,
        entryTypeOptions,
        frameworkFilters,
    ]);

    const handleSourcesFiltersValueChange = useCallback(
        (...value: EntriesAsList<PartialFormType>) => {
            // FIXME: let's use a different handler here
            if (!filtersShown) {
                showFilter();
            }
            setSourcesFilterFieldValue(...value);
        },
        [setSourcesFilterFieldValue, showFilter, filtersShown],
    );

    const handleSourcesGetSuccess = useCallback(() => {
        if (!activeProject || filterTrulyPristine) {
            return;
        }

        const filters = getProjectSourcesQueryVariables(
            sourcesFilters as Omit<FilterFormType, 'projectId'>,
        );

        saveLeadFilter({
            variables: {
                projectId: activeProject,
                filters,
            },
        });
    }, [
        sourcesFilters,
        activeProject,
        saveLeadFilter,
        filterTrulyPristine,
    ]);

    const handleSubmit = useCallback((values: PartialFormType) => {
        setSourcesFilters(values);

        setPristine(true);
        setFilterTrulyPristine(false);
    }, [setPristine]);

    const handleApply = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            handleSubmit,
        );
        submit();
    }, [setError, validate, handleSubmit]);

    const handleUsePreviousLeadFilter = useCallback(() => {
        if (savedFilter) {
            setSourcesFilterValue(savedFilter);
            setSourcesFilters(savedFilter);
            setPristine(true);
            setFilterTrulyPristine(false);
        }
        if (savedFilterOptions) {
            setCreatedByOptions(savedFilterOptions?.createdByOptions);
            setAssigneeOptions(savedFilterOptions?.assigneeOptions);
            setAuthorOrganizationOptions(savedFilterOptions?.authorOrganizationOptions);
            setSourceOrganizationOptions(savedFilterOptions?.sourceOrganizationOptions);
            setEntryCreatedByOptions(savedFilterOptions?.entryFilterCreatedByOptions);
            setGeoAreaOptions(savedFilterOptions?.entryFilterGeoAreaOptions);
        }
    }, [
        setSourcesFilterValue,
        setPristine,
        savedFilter,
        savedFilterOptions,
    ]);

    const handleClear = useCallback(() => {
        clearSourcesFilterValue();
        setSourcesFilters({});
        setPristine(true);
        setFilterTrulyPristine(false);
    }, [clearSourcesFilterValue, setPristine]);

    const isCurrentFilterEmpty = doesObjectHaveNoData(sourcesFilters, ['', null]);
    const isFilterEmpty = doesObjectHaveNoData(sourcesFilterValue, ['', null]);
    const isSavedFilterEmpty = doesObjectHaveNoData(savedFilter, ['', null]);

    if (!activeProject) {
        return null;
    }

    return (
        <div className={_cs(styles.sources, className)}>
            <Tabs
                useHash
                defaultHash="table"
            >
                <SourcesFilterContext.Provider value={sourcesFilterContextValue}>
                    <div className={styles.statsContainer}>
                        <SourcesStats
                            className={styles.stats}
                            projectId={activeProject}
                            filters={sourcesFilters}
                        />
                    </div>
                    <div className={styles.topSection}>
                        <Header
                            headingSectionClassName={styles.header}
                            heading={_ts('sourcesFilter', 'title')}
                            descriptionClassName={styles.filterButtons}
                            description={(
                                <>
                                    <Button
                                        name={undefined}
                                        onClick={toggleShowFilter}
                                        icons={<IoFunnel />}
                                    >
                                        Filter
                                    </Button>
                                    {(filterTrulyPristine && !isSavedFilterEmpty) && (
                                        <Button
                                            name="usePreviousFilters"
                                            variant="secondary"
                                            onClick={handleUsePreviousLeadFilter}
                                        >
                                            Use Previous Filters
                                        </Button>
                                    )}
                                </>
                            )}
                            inlineHeadingDescription
                            headingSize="medium"
                            actions={(
                                <TabList className={styles.tabs}>
                                    <Tab
                                        name="table"
                                        className={styles.tab}
                                        title="Sources Table"
                                        transparentBorder
                                    >
                                        <IoList />
                                    </Tab>
                                    <Tab
                                        name="grid"
                                        className={styles.tab}
                                        title="Entries Cards"
                                        transparentBorder
                                    >
                                        <IoGridOutline />
                                    </Tab>
                                </TabList>
                            )}
                        />
                        <div className={styles.filtersContainer}>
                            {!(isCurrentFilterEmpty && isFilterEmpty) && (
                                <div className={styles.buttons}>
                                    <Button
                                        disabled={pristine}
                                        name="sourcesFilterSubmit"
                                        icons={(
                                            <IoCheckmark />
                                        )}
                                        variant="tertiary"
                                        onClick={handleApply}
                                    >
                                        {_ts('sourcesFilter', 'apply')}
                                    </Button>
                                    <Button
                                        disabled={isFilterEmpty}
                                        name="clearFilter"
                                        icons={(
                                            <IoClose />
                                        )}
                                        variant="tertiary"
                                        onClick={handleClear}
                                    >
                                        {_ts('sourcesFilter', 'clearAll')}
                                    </Button>
                                </div>
                            )}
                            <SourcesAppliedFilters
                                className={styles.appliedFilters}
                                value={sourcesFilterValue}
                                onChange={handleSourcesFiltersValueChange}
                            />
                        </div>
                    </div>
                    <div className={styles.sourceListContainer}>
                        {filtersShown && (
                            <SourcesFilter
                                className={styles.filter}
                                value={sourcesFilterValue}
                                projectId={activeProject}
                                onChange={handleSourcesFiltersValueChange}
                                isEntriesOnlyFilter={activeView === 'grid'}
                                optionsLoading={projectSavedLeadFilterPending}
                                optionsErrored={!!projectSavedLeadFilterError}
                            />
                        )}
                        <TabPanel
                            name="table"
                            className={styles.leads}
                        >
                            <SortContext.Provider value={sortState}>
                                <SourcesTable
                                    className={styles.tableContainer}
                                    onSourcesGetSuccess={handleSourcesGetSuccess}
                                    filters={sourcesFilters}
                                    projectId={activeProject}
                                    // NOTE: we need to pass ordering for api calls
                                    ordering={ordering}
                                />
                            </SortContext.Provider>
                        </TabPanel>
                        <TabPanel
                            name="grid"
                            className={styles.leads}
                        >
                            <EntriesGrid
                                projectId={String(activeProject)}
                                onSourcesGetSuccess={handleSourcesGetSuccess}
                                filters={sourcesFilters}
                            />
                        </TabPanel>
                    </div>
                </SourcesFilterContext.Provider>
            </Tabs>
        </div>
    );
}

export default Sources;
