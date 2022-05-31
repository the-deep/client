import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { _cs, doesObjectHaveNoData } from '@togglecorp/fujs';
import {
    IoGridOutline,
    IoList,
    IoFunnel,
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
import { EntriesAsList, removeNull, createSubmitHandler } from '@togglecorp/toggle-form';
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
import { getSortState } from './utils';

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
    const [activePage, setActivePage] = useState<number>(1);
    const [
        showFilters,
        ,,,
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
        setFieldValue: setSourcesFilterValue,
        setValue: setSourcesFilter,
        resetValue: clearSourcesFilterValue,
        setError,
        validate,
        pristine,
        setPristine,
    } = useFilterState();

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

    useQuery<ProjectSavedLeadFilterQuery, ProjectSavedLeadFilterQueryVariables>(
        PROJECT_SAVED_LEAD_FILTER,
        {
            skip: !activeProject,
            variables: activeProject ? { projectId: activeProject } : undefined,
            onCompleted: (response) => {
                if (!response || !response.project) {
                    return;
                }
                const {
                    userSavedLeadFilter,
                } = response.project;

                if (userSavedLeadFilter?.filters) {
                    const { ordering: orderingFilter, ...others } = userSavedLeadFilter.filters;
                    setSorting(getSortState(orderingFilter));
                    setSourcesFilter(removeNull(others));
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
            },
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
            setSourcesFilterValue(...value);
        },
        [setSourcesFilterValue],
    );

    const handleSubmit = useCallback((values: PartialFormType) => {
        setActivePage(1);
        setSourcesFilters(values);
        setPristine(true);
    }, [setPristine]);

    const handleApply = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            handleSubmit,
        );
        submit();
    }, [setError, validate, handleSubmit]);

    const handleClear = useCallback(() => {
        clearSourcesFilterValue();
        setSourcesFilters({});
        setActivePage(1);
        setPristine(true);
    }, [clearSourcesFilterValue, setActivePage, setPristine]);

    const isFilterEmpty = doesObjectHaveNoData(sourcesFilterValue, ['', null]);

    useEffect(() => {
        if (activeProject) {
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
    }, [activeProject, sourcesFilters, ordering, saveLeadFilter]);

    return (
        <div className={_cs(styles.sources, className)}>
            <Tabs
                useHash
                defaultHash="table"
            >
                <SourcesFilterContext.Provider value={sourcesFilterContextValue}>
                    <div className={styles.topSection}>
                        {activeProject && (
                            <SourcesStats
                                className={styles.stats}
                                projectId={activeProject}
                                filters={sourcesFilters}
                            />
                        )}
                        <Header
                            headingSectionClassName={styles.header}
                            heading={_ts('sourcesFilter', 'title')}
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
                            <div>
                                <Button
                                    name={undefined}
                                    onClick={toggleShowFilter}
                                    icons={<IoFunnel />}
                                >
                                    Filter
                                </Button>
                            </div>
                            {activeProject && (
                                <AppliedFilters
                                    className={styles.appliedFilters}
                                    projectId={activeProject}
                                    value={sourcesFilterValue}
                                    onChange={handleSourcesFiltersValueChange}
                                />
                            )}
                            {showFilters && !(isFilterEmpty && pristine) && (
                                <div className={styles.buttons}>
                                    <Button
                                        disabled={pristine}
                                        name="sourcesFilterSubmit"
                                        variant="action"
                                        onClick={handleApply}
                                    >
                                        {_ts('sourcesFilter', 'apply')}
                                    </Button>
                                    <Button
                                        disabled={isFilterEmpty}
                                        name="clearFilter"
                                        variant="action"
                                        onClick={handleClear}
                                    >
                                        {_ts('sourcesFilter', 'clearAll')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.sourceListContainer}>
                        {showFilters && activeProject && (
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
                                            filters={sourcesFilters}
                                            projectId={activeProject}
                                            activePage={activePage}
                                            setActivePage={setActivePage}
                                        />
                                    </SortContext.Provider>
                                </TabPanel>
                                <TabPanel
                                    name="grid"
                                    className={styles.leads}
                                >
                                    <EntriesGrid
                                        projectId={String(activeProject)}
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
