import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import {
    Modal,
} from '@the-deep/deep-ui';

import {
    AppState,
} from '#typings';
import { activeProjectIdFromStateSelector } from '#redux';
import { useModalState } from '#hooks/stateManagement';

import Navbar from '../Navbar';
import BulkUpload from './BulkUpload';
import SourcesStats from './SourcesStats';
import SourcesFilter from './SourcesFilter';
import SourcesTable from './SourcesTable';
import LeadEditModal from './LeadEditModal';
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

    const [
        isSingleSourceModalShown,
        showSingleSourceAddModal,
        hideSingleSourceAddModal,
    ] = useModalState(false);

    const [
        isBulkModalShown,
        showBulkUploadModal,
        hideBulkUploadModal,
    ] = useModalState(false);

    const handleSourceAdd = useCallback(() => {
        hideSingleSourceAddModal();
        setRefreshTimestamp(new Date().getTime());
    }, [hideSingleSourceAddModal]);

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
            {isSingleSourceModalShown && (
                <LeadEditModal
                    projectId={activeProject}
                    onClose={hideSingleSourceAddModal}
                    onLeadSaveSuccess={handleSourceAdd}
                />
            )}
            {isBulkModalShown && (
                <Modal
                    onCloseButtonClick={hideBulkUploadModal}
                >
                    <BulkUpload />
                </Modal>
            )}
        </div>
    );
}
export default connect(mapStateToProps)(Sources);
