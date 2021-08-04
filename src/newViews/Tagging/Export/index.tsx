import React, { useState, useCallback } from 'react';
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

import Navbar from '../Navbar';
import NewExport from './NewExport';
import styles from './styles.scss';

type ExportType = 'export-entry-history' | 'export-assessment-history';

function Export() {
    const [activeTab, setActiveTab] = useState<ExportType>('export-entry-history');

    const handleExportAssessmentClick = useCallback(() => {}, []);
    const [
        isCreateNewExportModalShown,
        showCreateNewExportModal,
        hideCreateNewExportModal,
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
                                disabled
                            >
                                New Export
                            </Button>
                            <Button
                                name="export-assessment"
                                className={styles.button}
                                onClick={handleExportAssessmentClick}
                                icons={<IoAdd />}
                                variant="tertiary"
                                disabled
                            >
                                New Assessment Export
                            </Button>
                        </div>
                    </div>
                    <TabPanel name="export-entry-history">
                        This is export history
                    </TabPanel>
                    <TabPanel name="export-assessment-history">
                        This is Export Assessment History
                    </TabPanel>
                </Tabs>
                {isCreateNewExportModalShown && (
                    <NewExport
                        onClose={hideCreateNewExportModal}
                    />
                )}
            </div>
        </Container>
    );
}

export default Export;

