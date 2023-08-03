import React, { useState } from 'react';
import {
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
} from '@togglecorp/toggle-form';
import QualityScoreForm from './QualityScoreForm';
import AnalyticalDensityForm from './AnalyticalDensityForm';
import {
    PartialFormType,
} from '../formSchema';

import styles from './styles.css';

type TabOptions = 'qualityScores' | 'analyticalDensity' | undefined;

interface Props {
    projectId: string;
    value: PartialFormType,
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>
}

function ScoreForm(props: Props) {
    const {
        projectId,
        value,
        setFieldValue,
        error,
    } = props;

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
                    <QualityScoreForm
                        projectId={projectId}
                        value={value}
                        setFieldValue={setFieldValue}
                        error={error}
                    />
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
