import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';

import {
    AppState,
} from '#typings';
import { activeProjectIdFromStateSelector } from '#redux';

import Navbar from '../Navbar';
import SourcesStats from './SourcesStats';
import SourcesFilter from './SourcesFilter';
import SourcesTable from './SourcesTable';
import { FilterFormType as Filters } from './utils';

import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectIdFromStateSelector(state),
});
interface Props {
    activeProject: number;
}
function Sources(props: Props) {
    const { activeProject } = props;
    const [sourcesFilters, setSourcesFilters] = useState<Filters>();
    const [refreshTimestamp, setRefreshTimestamp] = useState(() => (new Date()).getTime());

    const handleSourceAdd = useCallback(() => {
        setRefreshTimestamp(new Date().getTime());
    }, []);

    return (
        <div className={styles.sources}>
            <Navbar
                onSourcesAdd={handleSourceAdd}
            />
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
export default connect(mapStateToProps)(Sources);
