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
    SetBaseValueArg,
} from '@togglecorp/toggle-form';
import { BasicRegion } from '#components/selections/RegionMultiSelectInput';
import { BasicOrganization } from '#types';
import { GeoArea } from '#components/GeoMultiSelectInput';

import MetadataForm from './MetadataForm';
import MethodologyForm from './MethodologyForm';
import FocusForm from './FocusForm';
import { PartialFormType } from './formSchema';

import styles from './styles.css';

type TabOptions = 'metadata' | 'documents' | 'focus' | 'methodology' | 'summary' | 'score' | 'cna' | undefined;

type Value = PartialFormType;
interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    setValue: (value: SetBaseValueArg<Value>) => void;
    error: Error<Value>;
    setRegionOptions?: React.Dispatch<React.SetStateAction<BasicRegion[] | null | undefined>>;
    regionOptions?: BasicRegion[] | null;
    setStakeholderOptions: React.Dispatch<React.SetStateAction<BasicOrganization[]>>;
    stakeholderOptions: BasicOrganization[];
    setGeoAreaOptions: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    geoAreaOptions?: GeoArea[] | null;
}

function AssessmentRegistyForm(props: Props) {
    const {
        value,
        setFieldValue,
        setValue,
        error,
        regionOptions,
        setRegionOptions,
        stakeholderOptions,
        setStakeholderOptions,
        geoAreaOptions,
        setGeoAreaOptions,
    } = props;

    const [activeTab, setActiveTab] = useState<TabOptions>('metadata');

    return (
        <div className={styles.assessmentRegistryForm}>
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
                variant="primary"
            >
                <TabList className={styles.tabList}>
                    <Tab name="metadata">Metadata</Tab>
                    <Tab name="documents">Additional Documents</Tab>
                    <Tab name="focus">Focus</Tab>
                    <Tab name="methodology">Methodology</Tab>
                    <Tab name="summary">Summary</Tab>
                    <Tab name="score">Score</Tab>
                    <Tab name="cna">CNA</Tab>
                    <div className={styles.dummy} />
                </TabList>
                <TabPanel
                    name="metadata"
                >
                    <MetadataForm
                        value={value}
                        setFieldValue={setFieldValue}
                        setValue={setValue}
                        error={error}
                        regionOptions={regionOptions}
                        setRegionOptions={setRegionOptions}
                        stakeholderOptions={stakeholderOptions}
                        setStakeholderOptions={setStakeholderOptions}
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
                    <FocusForm
                        value={value}
                        setFieldValue={setFieldValue}
                        error={error}
                        geoAreaOptions={geoAreaOptions}
                        setGeoAreaOptions={setGeoAreaOptions}
                    />
                </TabPanel>
                <TabPanel
                    name="methodology"
                    activeClassName={styles.tabPanel}
                >
                    <MethodologyForm
                        error={error}
                        setFieldValue={setFieldValue}
                        value={value}
                    />
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
        </div>
    );
}

export default AssessmentRegistyForm;
