import React, { useState } from 'react';
import {
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@the-deep/deep-ui';
import QualityScoreForm from './QualityScoreForm';
import AnalyticalDensityForm from './AnalyticalDensityForm';

import styles from './styles.css';

type TabOptions = 'qualityScores' | 'analyticalDensity' | undefined;

function ScoreForm() {
    const [activeTab, setActiveTab] = useState<TabOptions>('qualityScores');
    return (
        <div className={styles.scoreForm}>
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
                variant="primary"
            >
                <TabList>
                    <Tab name="qualityScores">Quality Scores</Tab>
                    <Tab name="analyticalDensity">Analytical Density</Tab>
                    <div className={styles.dummy} />
                </TabList>
                <TabPanel
                    name="qualityScores"
                    className={styles.tabPanel}
                >
                    <QualityScoreForm />
                </TabPanel>
                <TabPanel
                    name="analyticalDensity"
                    className={styles.tabPanel}
                >
                    <AnalyticalDensityForm
                        heading="Wash"
                    />
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default ScoreForm;
