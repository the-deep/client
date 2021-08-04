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

import Navbar from '../Navbar';
import styles from './styles.scss';

type ExportType = 'export-history' | 'export-assessment-history';

function Export() {
    const [activeTab, setActiveTab] = useState<ExportType>('export-history');

    const handleExportEntryClick = useCallback(() => {}, []);
    const handleExportAssessmentClick = useCallback(() => {}, []);

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
                            <Tab name="export-history">
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
                                onClick={handleExportEntryClick}
                                icons={<IoAdd />}
                                variant="secondary"
                            >
                                New Export
                            </Button>
                            <Button
                                name="export-assessment"
                                className={styles.button}
                                onClick={handleExportAssessmentClick}
                                icons={<IoAdd />}
                                variant="tertiary"
                            >
                                New Assessment Export
                            </Button>
                        </div>
                    </div>

                    <TabPanel name="export-history">
                        This is export history
                    </TabPanel>
                    <TabPanel name="export-assessment-history">
                        This is Export Assessment History
                    </TabPanel>
                </Tabs>
            </div>
        </Container>
    );
}

export default Export;

