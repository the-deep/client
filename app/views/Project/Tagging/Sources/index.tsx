import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoGridOutline,
    IoList,
} from 'react-icons/io5';
import {
    Header,
    useHash,
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import ProjectContext from '#base/context/ProjectContext';

import SourcesStats from './SourcesStats';
import SourcesFilter from './SourcesFilter';
import {
    PartialFormType as PartialFilterFormType,
} from './SourcesFilter/schema';
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
    const [sourcesFilters, setSourcesFilters] = useState<PartialFilterFormType>({});
    const [activePage, setActivePage] = useState<number>(1);
    const activeView = useHash();

    const handleSetSourcesFilters = useCallback((filters: PartialFilterFormType) => {
        setSourcesFilters(filters);
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
                </div>
                {activeProject && (
                    <div className={styles.leadsContainer}>
                        <SourcesFilter
                            className={styles.filter}
                            value={sourcesFilters}
                            onFilterApply={handleSetSourcesFilters}
                            projectId={activeProject}
                            isEntriesOnlyFilter={activeView === 'grid'}
                        />
                        <div className={styles.leads}>
                            <TabPanel
                                name="table"
                            >
                                <SourcesTable
                                    className={styles.table}
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
                    </div>
                )}
            </Tabs>
        </div>
    );
}

export default Sources;
