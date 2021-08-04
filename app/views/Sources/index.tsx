import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import {
    IoGridSharp,
    IoReorderFour,
} from 'react-icons/io5';
import {
    Header,
    Button,
} from '@the-deep/deep-ui';

import SourcesStats from './SourcesStats';
import SourcesFilter from './SourcesFilter';
import SourcesTable from './SourcesTable';
import { FilterFormType as Filters } from './utils';

import _ts from '#ts';
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
            <Header
                heading={_ts('sourcesFilter', 'title')}
                headingSize="medium"
                actions={(
                    <>
                        <Button
                            name="switch"
                            variant="action"
                            big
                        >
                            <IoReorderFour />
                        </Button>
                        <Button
                            name="switch"
                            variant="action"
                            big
                        >
                            <IoGridSharp />
                        </Button>
                    </>
                )}
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
