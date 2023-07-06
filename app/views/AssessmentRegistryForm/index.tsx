import React, { useState } from 'react';
import {
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@the-deep/deep-ui';
import { EntriesAsList, Error, SetBaseValueArg } from '@togglecorp/toggle-form';

import MetadataForm from './MetadataForm';
import { PartialFormType } from './formSchema';
import styles from './styles.css';

type TabOptions = 'metadata' | 'documents' | 'focus' | 'methodology' | 'summary' | 'score' | 'cna' | undefined;

type Value = PartialFormType;
interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    setValue: (value: SetBaseValueArg<Value>) => void;
    error: Error<Value>;
}

function AssessmentRegistyForm(props: Props) {
    const {
        value,
        setFieldValue,
        setValue,
        error,
    } = props;

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
                <MetadataForm
                    value={value}
                    setFieldValue={setFieldValue}
                    setValue={setValue}
                    error={error}
                />
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
