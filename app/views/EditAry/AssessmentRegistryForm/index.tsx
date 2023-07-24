import React, { useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
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
import CnaForm from './CnaForm';
import { PartialFormType } from './formSchema';

import styles from './styles.css';

type TabOptions = 'metadata' | 'documents' | 'focus' | 'methodology' | 'summary' | 'score' | 'cna' | undefined;

const fieldsInMetadata: { [key in keyof PartialFormType]?: true } = {
    bgCountries: true,
    bgCrisisType: true,
    bgCrisisStartDate: true,
    bgPreparedness: true,
    externalSupport: true,
    coordinatedJoint: true,
    detailsType: true,
    family: true,
    frequency: true,
    confidentiality: true,
    language: true,
    noOfPages: true,
    dataCollectionStartDate: true,
    dataCollectionEndDate: true,
    publicationDate: true,
    donors: true,
    leadOrganizations: true,
    internationalPartners: true,
    nationalPartners: true,
    governments: true,
};

const fieldsInAdditionalDocuments: { [key in keyof PartialFormType]?: true } = {
};

const fieldsInFocus: { [key in keyof PartialFormType]?: true } = {
    focuses: true,
    sectors: true,
    protectionInfoMgmts: true,
    affectedGroups: true,
    locations: true,
};

const fieldsInMethodology: { [key in keyof PartialFormType]?: true } = {
    methodologyAttributes: true,
    objectives: true,
    limitations: true,
};

const fieldsInSummary: { [key in keyof PartialFormType]?: true } = {
};

const fieldsInScore: { [key in keyof PartialFormType]?: true } = {
};

const fieldsInCna: { [key in keyof PartialFormType]?: true } = {
};

type Value = PartialFormType;
interface Props {
    projectId: string;
    value: Value;
    className?: string;
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

function AssessmentRegistryForm(props: Props) {
    const {
        projectId,
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
        className,
    } = props;

    const [activeTab, setActiveTab] = useState<TabOptions>('metadata');

    const errorInMetadata = useMemo(() => (
        error
        && Object.keys(error).some(
            (fieldName) => fieldsInMetadata[fieldName as keyof typeof error],
        )
    ), [error]);

    const errorInAdditionalDocuments = useMemo(() => (
        error
        && Object.keys(error).some(
            (fieldName) => fieldsInAdditionalDocuments[fieldName as keyof typeof error],
        )
    ), [error]);

    const errorInMethodology = useMemo(() => (
        error
        && Object.keys(error).some(
            (fieldName) => fieldsInMethodology[fieldName as keyof typeof error],
        )
    ), [error]);

    const errorInFocus = useMemo(() => (
        error
        && Object.keys(error).some(
            (fieldName) => fieldsInFocus[fieldName as keyof typeof error],
        )
    ), [error]);

    const errorInSummary = useMemo(() => (
        error
        && Object.keys(error).some(
            (fieldName) => fieldsInSummary[fieldName as keyof typeof error],
        )
    ), [error]);

    const errorInScore = useMemo(() => (
        error
        && Object.keys(error).some(
            (fieldName) => fieldsInScore[fieldName as keyof typeof error],
        )
    ), [error]);

    const errorInCna = useMemo(() => (
        error
        && Object.keys(error).some(
            (fieldName) => fieldsInCna[fieldName as keyof typeof error],
        )
    ), [error]);

    return (
        <div className={_cs(styles.assessmentRegistryForm, className)}>
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
                variant="primary"
            >
                <TabList className={styles.tabList}>
                    <Tab
                        className={_cs(
                            styles.tab,
                            errorInMetadata && styles.error,
                        )}
                        name="metadata"
                    >
                        Metadata
                    </Tab>
                    <Tab
                        className={_cs(
                            styles.tab,
                            errorInAdditionalDocuments && styles.error,
                        )}
                        name="documents"
                    >
                        Additional Documents
                    </Tab>
                    <Tab
                        className={_cs(
                            styles.tab,
                            errorInFocus && styles.error,
                        )}
                        name="focus"
                    >
                        Focus
                    </Tab>
                    <Tab
                        className={_cs(
                            styles.tab,
                            errorInMethodology && styles.error,
                        )}
                        name="methodology"
                    >
                        Methodology
                    </Tab>
                    <Tab
                        className={_cs(
                            styles.tab,
                            errorInSummary && styles.error,
                        )}
                        name="summary"
                    >
                        Summary
                    </Tab>
                    <Tab
                        className={_cs(
                            styles.tab,
                            errorInScore && styles.error,
                        )}
                        name="score"
                    >
                        Score
                    </Tab>
                    <Tab
                        className={_cs(
                            styles.tab,
                            errorInCna && styles.error,
                        )}
                        name="cna"
                    >
                        CNA
                    </Tab>
                    <div className={styles.dummy} />
                </TabList>
                <TabPanel
                    name="metadata"
                    activeClassName={styles.tabPanel}
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
                    <CnaForm
                        projectId={projectId}
                    />
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default AssessmentRegistryForm;
