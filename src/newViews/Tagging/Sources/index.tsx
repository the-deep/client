import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
    AppState,
} from '#typings';
import { activeProjectIdFromStateSelector } from '#redux';

import Navbar from '../Navbar';
import SourcesStats from './SourcesStats';
import SourcesFilter, { FormType as Filters } from './SourcesFilter';

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectIdFromStateSelector(state),
});
interface Props {
    activeProject: number;
}
function Sources(props: Props) {
    const { activeProject } = props;
    const [sourcesFilters, setSourcesFilters] = useState<Filters>({});
    console.warn('sources', sourcesFilters);

    return (
        <div>
            <Navbar />
            <SourcesStats />
            <SourcesFilter
                onFilterApply={setSourcesFilters}
                projectId={activeProject}
            />
            <div>This is sources tab</div>
        </div>
    );
}
export default connect(mapStateToProps)(Sources);
