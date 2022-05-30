import React, { useState, useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
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
} from '@the-deep/deep-ui';
import { EntriesAsList } from '@togglecorp/toggle-form';
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
        value: sourcesFilters,
        setFieldValue: setSourcesFilterValue,
    } = useFilterState();

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
            setActivePage(1);
            setSourcesFilterValue(...value);
        },
        [setSourcesFilterValue, setActivePage],
    );

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
                            <Button
                                name={undefined}
                                onClick={toggleShowFilter}
                                icons={<IoFunnel />}
                            >
                                Filter
                            </Button>
                            {activeProject && (
                                <AppliedFilters
                                    className={styles.appliedFilters}
                                    projectId={activeProject}
                                    value={sourcesFilters}
                                    onChange={handleSourcesFiltersValueChange}
                                />
                            )}
                        </div>
                    </div>
                    <div className={styles.sourceListContainer}>
                        {showFilters && activeProject && (
                            <SourcesFilter
                                className={styles.filter}
                                value={sourcesFilters}
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
