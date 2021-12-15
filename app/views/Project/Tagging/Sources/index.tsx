import React, { useState } from 'react';
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
    const activeView = useHash();

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
                                    transparentBorder
                                >
                                    <IoList />
                                </Tab>
                                <Tab
                                    name="grid"
                                    className={styles.tab}
                                    transparentBorder
                                >
                                    <IoGridOutline />
                                </Tab>
                            </TabList>
                        )}
                    />
                    {activeProject && (
                        <SourcesFilter
                            className={styles.filter}
                            value={sourcesFilters}
                            onFilterApply={setSourcesFilters}
                            projectId={activeProject}
                            isEntriesOnlyFilter={activeView === 'grid'}
                        />
                    )}
                </div>
                {activeProject && (
                    <div className={styles.leads}>
                        <TabPanel name="table">
                            <SourcesTable
                                className={styles.table}
                                filters={sourcesFilters}
                                projectId={activeProject}
                            />
                        </TabPanel>
                        <TabPanel name="grid">
                            <EntriesGrid
                                projectId={String(activeProject)}
                                filters={sourcesFilters}
                            />
                        </TabPanel>
                    </div>
                )}
            </Tabs>
        </div>
    );
}

export default Sources;
