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
    LeadOrderingEnum,
    SaveLeadFilterMutation,
    SaveLeadFilterMutationVariables,
    ProjectSavedLeadFilterQuery,
    ProjectSavedLeadFilterQueryVariables,
} from '#generated/types';

import _ts from '#ts';
import ProjectContext from '#base/context/ProjectContext';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { BasicOrganization } from '#components/selections/NewOrganizationMultiSelectInput';
import SourcesFilterContext from './SourcesFilterContext';
import AppliedFilters from './AppliedFilters';
import SourcesStats from './SourcesStats';
import SourcesFilter, { useFilterState, getProjectSourcesQueryVariables } from './SourcesFilter';
import { PartialFormType, FormType as FilterFormType } from './SourcesFilter/schema';
import SourcesTable from './SourcesTable';
import EntriesGrid from './EntriesGrid';
import { SAVE_LEAD_FILTER, PROJECT_SAVED_LEAD_FILTER } from './queries';
import { getSortState, transformRawFiltersToFormValues } from './utils';

import styles from './styles.css';

const defaultSorting = {
    name: 'CREATED_AT',
    direction: 'Descending',
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

    const [filterTrulyPristine, setFilterTrulyPristine] = useState(true);

    const [
        sourcesFilters,
        setSourcesFilters,
    ] = useState<PartialFormType>({});

    const sortState = useSortState();
    const { sorting, setSorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = validSorting.direction === 'Ascending'
        ? `ASC_${validSorting.name}`
        : `DESC_${validSorting.name}`;

    const [
        saveLeadFilter,
    ] = useMutation<SaveLeadFilterMutation, SaveLeadFilterMutationVariables>(
        SAVE_LEAD_FILTER,
    );

    const {
        data: projectSavedLeadFilterData,
        loading: projectSavedLeadFilterPending,
    } = useQuery<ProjectSavedLeadFilterQuery, ProjectSavedLeadFilterQueryVariables>(
        PROJECT_SAVED_LEAD_FILTER,
        {
            skip: !activeProject,
            variables: activeProject ? { projectId: activeProject } : undefined,
        },
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
    }), [
        createdByOptions,
        assigneeOptions,
        authorOrganizationOptions,
        sourceOrganizationOptions,
        entryCreatedByOptions,
        geoAreaOptions,
    ]);

    const handleSourcesFiltersValueChange = useCallback(
        (...value: EntriesAsList<PartialFormType>) => {
            if (!filtersShown) {
                showFilter();
            }
            setSourcesFilterFieldValue(...value);
        },
        [setSourcesFilterFieldValue, showFilter, filtersShown],
    );

    const handleSourcesGetSuccess = useCallback(() => {
        if (activeProject && !filterTrulyPristine) {
            saveLeadFilter({
                variables: {
                    projectId: activeProject,
                    filters: {
                        ...getProjectSourcesQueryVariables(
                            sourcesFilters as Omit<FilterFormType, 'projectId'>,
                        ),
                        ordering: [ordering as LeadOrderingEnum],
                    },
                },
            });
        }
    }, [
        sourcesFilters,
        activeProject,
        ordering,
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
        if (!projectSavedLeadFilterData?.project) {
            return;
        }

        const { userSavedLeadFilter } = projectSavedLeadFilterData?.project ?? {};
        if (userSavedLeadFilter?.filters) {
            const { ordering: orderingFilter, ...others } = userSavedLeadFilter.filters;
            setSorting(getSortState(orderingFilter));
            setSourcesFilterValue(transformRawFiltersToFormValues(others));
            setSourcesFilters(transformRawFiltersToFormValues(others));
            setPristine(true);
            setFilterTrulyPristine(false);
        }
        if (userSavedLeadFilter?.filtersData) {
            const { filtersData } = userSavedLeadFilter;
            setCreatedByOptions(filtersData?.createdByOptions);
            setAssigneeOptions(filtersData?.assigneeOptions);
            setAuthorOrganizationOptions(filtersData?.authorOrganizationOptions);
            setSourceOrganizationOptions(filtersData?.sourceOrganizationOptions);
            setEntryCreatedByOptions(filtersData?.entryFilterCreatedByOptions);
            setGeoAreaOptions(filtersData?.entryFilterGeoAreaOptions);
        }
    }, [
        projectSavedLeadFilterData,
        setSorting,
        setSourcesFilterValue,
        setPristine,
    ]);

    const handleClear = useCallback(() => {
        clearSourcesFilterValue();
        setSourcesFilters({});
        setPristine(true);
        setFilterTrulyPristine(false);
    }, [clearSourcesFilterValue, setPristine]);

    const isFilterEmpty = doesObjectHaveNoData(sourcesFilterValue, ['', null]);

    return (
        <div className={_cs(styles.sources, className)}>
            <Tabs
                useHash
                defaultHash="table"
            >
                <SourcesFilterContext.Provider value={sourcesFilterContextValue}>
                    <div className={styles.statsContainer}>
                        {activeProject && (
                            <SourcesStats
                                className={styles.stats}
                                projectId={activeProject}
                                filters={sourcesFilters}
                            />
                        )}
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
                                    {filterTrulyPristine && (
                                        <Button
                                            disabled={projectSavedLeadFilterPending}
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
                            {!(isFilterEmpty && pristine) && (
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
                            {activeProject && (
                                <AppliedFilters
                                    className={styles.appliedFilters}
                                    projectId={activeProject}
                                    value={sourcesFilterValue}
                                    onChange={handleSourcesFiltersValueChange}
                                />
                            )}
                        </div>
                    </div>
                    <div className={styles.sourceListContainer}>
                        {filtersShown && activeProject && (
                            <SourcesFilter
                                className={styles.filter}
                                value={sourcesFilterValue}
                                projectId={activeProject}
                                onChange={handleSourcesFiltersValueChange}
                                isEntriesOnlyFilter={activeView === 'grid'}
                            />
                        )}
                        {activeProject && (
                            <>
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
                            </>
                        )}
                    </div>
                </SourcesFilterContext.Provider>
            </Tabs>
        </div>
    );
}

export default Sources;
