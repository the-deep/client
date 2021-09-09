import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoGridOutline,
    IoList,
} from 'react-icons/io5';
import {
    Header,
    QuickActionButton,
} from '@the-deep/deep-ui';

import ProjectContext from '#base/context/ProjectContext';
import SourcesStats from './SourcesStats';
import SourcesFilter from './SourcesFilter';
import SourcesTable from './SourcesTable';
import SourcesGrid from './SourcesGrid';
import { FilterFormType as Filters } from './utils';

import _ts from '#ts';
import styles from './styles.css';

interface Props {
    className?: string;
    refreshTimestamp?: number;
}

function Sources(props: Props) {
    const { className, refreshTimestamp } = props;
    const { project } = React.useContext(ProjectContext);
    const activeProject = project ? +project.id : undefined;
    const [sourcesFilters, setSourcesFilters] = useState<Filters>();

    const [activeView, setActiveView] = React.useState<'table' | 'grid'>('table');

    const handleGridButtonClick = React.useCallback(() => {
        setActiveView('grid');
    }, []);

    const handleTableButtonClick = React.useCallback(() => {
        setActiveView('table');
    }, []);

    return (
        <div className={_cs(styles.sources, className)}>
            <div className={styles.topSection}>
                {activeProject && (
                    <SourcesStats
                        className={styles.stats}
                        filters={sourcesFilters}
                        projectId={activeProject}
                        refreshTimestamp={refreshTimestamp}
                    />
                )}
                <Header
                    heading={_ts('sourcesFilter', 'title')}
                    headingSize="medium"
                    actions={(
                        <>
                            <QuickActionButton
                                className={_cs(
                                    styles.switchButton,
                                    activeView === 'table' && styles.active,
                                )}
                                name="switch"
                                variant="action"
                                onClick={handleTableButtonClick}
                                big
                            >
                                <IoList />
                            </QuickActionButton>
                            <QuickActionButton
                                name="switch"
                                className={_cs(
                                    styles.switchButton,
                                    activeView === 'grid' && styles.active,
                                )}
                                variant="action"
                                onClick={handleGridButtonClick}
                                big
                            >
                                <IoGridOutline />
                            </QuickActionButton>
                        </>
                    )}
                />
                {activeProject && (
                    <SourcesFilter
                        className={styles.filter}
                        onFilterApply={setSourcesFilters}
                        projectId={activeProject}
                    />
                )}
            </div>
            <div className={styles.leads}>
                {activeView === 'table' && activeProject && (
                    <SourcesTable
                        className={styles.table}
                        filters={sourcesFilters}
                        projectId={activeProject}
                        refreshTimestamp={refreshTimestamp}
                    />
                )}
                {activeView === 'grid' && activeProject && (
                    <SourcesGrid
                        projectId={String(activeProject)}
                    />
                )}
            </div>
        </div>
    );
}

export default Sources;
