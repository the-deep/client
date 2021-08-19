import React, { useState } from 'react';
import { connect } from 'react-redux';
import { IoAdd } from 'react-icons/io5';
import {
    Tabs,
    Tab,
    TabList,
    TabPanel,
    Container,
    Button,
} from '@the-deep/deep-ui';
import { useModalState } from '#hooks/stateManagement';
import {
    AppState,
} from '#typings';
import { activeProjectIdFromStateSelector } from '#redux';

import ExportHistory from './ExportHistory';
import Navbar from '../Navbar';
import NewAssessmentExport from './NewAssessmentExport';
import NewExport from './NewExport';
import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeProject: activeProjectIdFromStateSelector(state),
});
interface Props {
    activeProject: number;
}
type ExportType = 'export-entry-history' | 'export-assessment-history';

function Export(props: Props) {
    const { activeProject } = props;
    const [activeTab, setActiveTab] = useState<ExportType>('export-entry-history');

    const [
        isCreateNewExportModalShown,
        showCreateNewExportModal,
        hideCreateNewExportModal,
    ] = useModalState(false);

    const [
        isNewAssessmentModalShown,
        showNewAssessmentModal,
        hideNewAssessmentModal,
    ] = useModalState(false);

    return (
        <Container
            className={styles.container}
        >
            <Navbar />
            <div className={styles.content}>
                <Tabs
                    onChange={setActiveTab}
                    value={activeTab}
                >
                    <div className={styles.top}>
                        <TabList
                            className={styles.tabList}
                        >
                            <Tab name="export-entry-history">
                                Export History
                            </Tab>
                            <Tab name="export-assessment-history">
                                Export Assessment History
                            </Tab>
                        </TabList>

                        <div className={styles.actionButtons}>
                            <Button
                                name="export-entry"
                                className={styles.button}
                                onClick={showCreateNewExportModal}
                                icons={<IoAdd />}
                                variant="secondary"
                            >
                                New Export
                            </Button>
                            <Button // TODO: properly check permissions
                                name="export-assessment"
                                className={styles.button}
                                onClick={showNewAssessmentModal}
                                icons={<IoAdd />}
                                variant="secondary"
                            >
                                New Assessment Export
                            </Button>
                        </div>
                    </div>
                    <TabPanel name="export-entry-history">
                        <ExportHistory
                            projectId={activeProject}
                            type="entries"
                        />
                    </TabPanel>
                    <TabPanel name="export-assessment-history">
                        <ExportHistory
                            projectId={activeProject}
                            type="assessments"
                        />
                    </TabPanel>
                </Tabs>
                {isCreateNewExportModalShown && (
                    <NewExport
                        onClose={hideCreateNewExportModal}
                    />
                )}
                {isNewAssessmentModalShown && (
                    <NewAssessmentExport
                        onClose={hideNewAssessmentModal}
                    />
                )}
            </div>
        </Container>
    );
}

export default connect(mapStateToProps)(Export);
