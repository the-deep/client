import React, { useState } from 'react';
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
import _ts from '#ts';
import ProjectContext from '#base/context/ProjectContext';

import AppliedFilters from './AppliedFilters';
import SourcesStats from './SourcesStats';
import SourcesFilter, { useFilterState } from './SourcesFilter';
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

    const {
        value: sourcesFilters,
        setFieldValue: setSourcesFilterValue,
    } = useFilterState();

    React.useEffect(() => {
        setActivePage(1);
    }, []);

    return (
        <div className={_cs(styles.sources, className)}>
            <Tabs
                useHash
                defaultHash="table"
            >
                <div className={styles.topSection}>
                    {activeProject && (
                        <SourcesStats
                            className={styles.stats}
                            projectId={activeProject}
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
                    <Button
                        name={undefined}
                        onClick={toggleShowFilter}
                        icons={<IoFunnel />}
                    >
                        Filter
                    </Button>
                    {activeProject && (
                        <AppliedFilters
                            projectId={activeProject}
                            value={sourcesFilters}
                            onChange={setSourcesFilterValue}
                        />
                    )}
                </div>
                <div className={styles.sourceListContainer}>
                    {showFilters && activeProject && (
                        <SourcesFilter
                            className={styles.filter}
                            value={sourcesFilters}
                            projectId={activeProject}
                            onChange={setSourcesFilterValue}
                            isEntriesOnlyFilter={activeView === 'grid'}
                        />
                    )}
                    {activeProject && (
                        <div className={styles.leads}>
                            <TabPanel
                                name="table"
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
                            >
                                <EntriesGrid
                                    projectId={String(activeProject)}
                                    filters={sourcesFilters}
                                />
                            </TabPanel>
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
}

export default Sources;
