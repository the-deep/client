import React, { useState } from 'react';
import {
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@the-deep/deep-ui';

import MetadataForm from './MetadataForm';
import styles from './styles.css';

type TabOptions = 'metadata' | 'documents' | 'focus' | 'methodology' | 'summary' | 'score' | 'cna' | undefined;

interface Props {
    projectId?: string;
}

function AssessmentRegistyForm(props: Props) {
    const { projectId } = props;
    console.log(projectId);
    const [activeTab, setActiveTab] = useState<TabOptions>('metadata');
    return (
        <Tabs
            value={activeTab}
            onChange={setActiveTab}
            variant="secondary"
        >
            <TabList>
                <Tab name="metadata">Metadata</Tab>
                <Tab name="documents">Additional Documents</Tab>
                <Tab name="focus">Focus</Tab>
                <Tab name="methodology">Methodology</Tab>
                <Tab name="summary">Summary</Tab>
                <Tab name="score">Score</Tab>
                <Tab name="cna">CNA</Tab>
            </TabList>
            <TabPanel
                name="metadata"
            >
                <MetadataForm />
            </TabPanel>
            <TabPanel
                name="documents"
                activeClassName={styles.tabPanel}
            >
                Additional Documents form
            </TabPanel>
            <TabPanel
                name="focus"
                activeClassName={styles.tabPanel}
            >
                Focus form
            </TabPanel>
            <TabPanel
                name="methodology"
                activeClassName={styles.tabPanel}
            >
                Methodology form
            </TabPanel>
            <TabPanel
                name="summary"
                activeClassName={styles.tabPanel}
            >
                Summary form
            </TabPanel>
            <TabPanel
                name="score"
                activeClassName={styles.tabPanel}
            >
                Score form
            </TabPanel>
            <TabPanel
                name="cna"
                activeClassName={styles.tabPanel}
            >
                CNA form
            </TabPanel>
        </Tabs>
    );
}

export default AssessmentRegistyForm;
