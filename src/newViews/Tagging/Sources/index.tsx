import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
    AppState,
} from '#typings';
import { activeProjectIdFromStateSelector } from '#redux';

import Navbar from '../Navbar';
import SourcesStats from './SourcesStats';
import SourcesFilter, { FormType as Filters } from './SourcesFilter';
import SourcesTable from './SourcesTable';

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

    return (
        <div className={styles.sources}>
            <Navbar />
            <SourcesStats
                className={styles.stats}
                filters={sourcesFilters}
                projectId={activeProject}
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
            />
        </div>
    );
}
export default connect(mapStateToProps)(Sources);
