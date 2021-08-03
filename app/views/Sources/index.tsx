import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import SourcesStats from './SourcesStats';
import SourcesFilter from './SourcesFilter';
import SourcesTable from './SourcesTable';
import { FilterFormType as Filters } from './utils';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Sources(props: Props) {
    const { className } = props;
    const { projectId } = useParams<{ projectId: string }>();
    const activeProject = +projectId;
    const [sourcesFilters, setSourcesFilters] = useState<Filters>();
    const [refreshTimestamp] = useState(() => (new Date()).getTime());

    return (
        <div className={_cs(styles.sources, className)}>
            <SourcesStats
                className={styles.stats}
                filters={sourcesFilters}
                projectId={activeProject}
                refreshTimestamp={refreshTimestamp}
            />
            <SourcesFilter
                className={styles.filter}
                onFilterApply={setSourcesFilters}
                projectId={activeProject}
            />
            <SourcesTable
                className={styles.table}
                filters={sourcesFilters}
                projectId={activeProject}
                refreshTimestamp={refreshTimestamp}
            />
        </div>
    );
}
export default Sources;
