import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
    AppState,
} from '#typings';
import { activeProjectIdFromStateSelector } from '#redux';
import { useModalState } from '#hooks/stateManagement';

import Navbar from '../Navbar';
import SourcesStats from './SourcesStats';
import SourcesFilter, { FormType as Filters } from './SourcesFilter';
import SourcesTable from './SourcesTable';
import LeadEditModal from './LeadEditModal';

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
    const [
        isSingleSourceModalShown,
        showSingleSourceAddModal,
        hideSingleSourceAddModal,
    ] = useModalState(true);

    const [
        isBulkModalShown,
        showBulkUploadModal,
        hideBulkUploadModal,
    ] = useModalState(false);

    return (
        <div className={styles.sources}>
            <Navbar
                onAddSingleSourceClick={showSingleSourceAddModal}
                onBulkUploadClick={showBulkUploadModal}
            />
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
            {isSingleSourceModalShown && (
                <LeadEditModal
                    projectId={activeProject}
                    onClose={hideSingleSourceAddModal}
                />
            )}
            {isBulkModalShown && (
                <Modal
                    onCloseButtonClick={hideBulkUploadModal}
                    // FIXME: Use translation later
                >
                    Bulk upload modal
                </Modal>
            )}
        </div>
    );
}
export default connect(mapStateToProps)(Sources);
