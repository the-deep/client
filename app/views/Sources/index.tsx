import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoGridSharp,
    IoReorderFour,
} from 'react-icons/io5';
import {
    Header,
    Button,
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
}

function Sources(props: Props) {
    const { className } = props;
    const { project } = React.useContext(ProjectContext);
    const activeProject = project ? +project.id : undefined;
    const [sourcesFilters, setSourcesFilters] = useState<Filters>();
    const [refreshTimestamp] = useState(() => (new Date()).getTime());

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
                            <Button
                                name="switch"
                                variant="action"
                                big
                                onClick={handleTableButtonClick}
                            >
                                <IoReorderFour />
                            </Button>
                            <Button
                                name="switch"
                                variant="action"
                                onClick={handleGridButtonClick}
                                big
                            >
                                <IoGridSharp />
                            </Button>
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
                {activeView === 'grid' && (
                    <SourcesGrid />
                )}
            </div>
        </div>
    );
}

export default Sources;
