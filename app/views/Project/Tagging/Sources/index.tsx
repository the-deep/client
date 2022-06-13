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
} from '@the-deep/deep-ui';
import { EntriesAsList, createSubmitHandler } from '@togglecorp/toggle-form';

import _ts from '#ts';
import ProjectContext from '#base/context/ProjectContext';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { BasicOrganization } from '#components/selections/NewOrganizationMultiSelectInput';
import SourcesFilterContext from './SourcesFilterContext';
import AppliedFilters from './AppliedFilters';
import SourcesStats from './SourcesStats';
import SourcesFilter, { useFilterState } from './SourcesFilter';
import { PartialFormType } from './SourcesFilter/schema';
import SourcesTable from './SourcesTable';
import EntriesGrid from './EntriesGrid';

import styles from './styles.css';

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
                            description={(
                                <Button
                                    className={styles.filterButton}
                                    name={undefined}
                                    onClick={toggleShowFilter}
                                    icons={<IoFunnel />}
                                >
                                    Filter
                                </Button>
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
                                    <SourcesTable
                                        className={styles.tableContainer}
                                        filters={sourcesFilters}
                                        projectId={activeProject}
                                        activePage={activePage}
                                        setActivePage={setActivePage}
                                    />
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
