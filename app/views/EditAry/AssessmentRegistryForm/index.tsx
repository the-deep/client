import React, { useMemo } from 'react';
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
import { _cs } from '@togglecorp/fujs';

import { BasicRegion } from '#components/selections/RegionMultiSelectInput';
import { BasicOrganization } from '#types';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { GalleryFileType } from '#generated/types';

import MetadataForm from './MetadataForm';
import MethodologyForm from './MethodologyForm';
import FocusForm from './FocusForm';
import CnaForm from './CnaForm';
import ScoreForm from './ScoreForm';
import SummaryForm from './SummaryForm';
import AdditionalDocument from './AdditionalDocument';
import { PartialFormType, SummaryIssueType } from './formSchema';

import styles from './styles.css';

const fieldsInMetadata: { [key in keyof PartialFormType]?: true } = {
    bgCountries: true,
    bgCrisisType: true,
    bgCrisisStartDate: true,
    bgPreparedness: true,
    externalSupport: true,
    coordinatedJoint: true,
    status: true,
    detailsType: true,
    family: true,
    frequency: true,
    confidentiality: true,
    language: true,
    noOfPages: true,
    dataCollectionStartDate: true,
    dataCollectionEndDate: true,
    publicationDate: true,
    stakeholders: true,
};

const fieldsInAdditionalDocuments: { [key in keyof PartialFormType]?: true } = {
    executiveSummary: true,
    additionalDocuments: true,
};

const fieldsInFocus: { [key in keyof PartialFormType]?: true } = {
    focuses: true,
    sectors: true,
    protectionInfoMgmts: true,
    protectionRisks: true,
    affectedGroups: true,
    locations: true,
};

const fieldsInMethodology: { [key in keyof PartialFormType]?: true } = {
    methodologyAttributes: true,
    objectives: true,
    limitations: true,
};

const fieldsInSummary: { [key in keyof PartialFormType]?: true } = {
    summaryPillarMeta: true,
    summarySubPillarIssue: true,
    summarySubDimensionIssue: true,
    summaryDimensionMeta: true,
};

const fieldsInScore: { [key in keyof PartialFormType]?: true } = {
    scoreRatings: true,
    scoreAnalyticalDensity: true,
};

const fieldsInCna: { [key in keyof PartialFormType]?: true } = {
    cna: true,
};

type Value = PartialFormType;
interface Props {
    projectId: string;
    value: Value;
    className?: string;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    error: Error<Value>;
    setRegionOptions?: React.Dispatch<React.SetStateAction<BasicRegion[] | null | undefined>>;
    regionOptions?: BasicRegion[] | null;
    setStakeholderOptions: React.Dispatch<React.SetStateAction<BasicOrganization[]>>;
    stakeholderOptions: BasicOrganization[];
    setGeoAreaOptions: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    geoAreaOptions?: GeoArea[] | null;
    setUploadedList: React.Dispatch<React.SetStateAction<GalleryFileType[] | undefined>>;
    uploadedList?: GalleryFileType[];
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    issueItemToClientIdMap: Record<string, string>;
    setIssueItemToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    dimensionIssueToClientIdMap: Record<string, string>;
    setDimensionIssueToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    dimensionIssuesOptions?: SummaryIssueType[] | null;
    setDimensionIssuesOptions: React.Dispatch<React.SetStateAction<
    SummaryIssueType[]
    | undefined
    | null
    >>;
    loading?: boolean;
}

function AssessmentRegistryForm(props: Props) {
    const {
        projectId,
        value,
        setFieldValue,
        error,
        regionOptions,
        setRegionOptions,
        stakeholderOptions,
        setStakeholderOptions,
        geoAreaOptions,
        setGeoAreaOptions,
        className,
        uploadedList,
        setUploadedList,
        issuesOptions,
        setIssuesOptions,
        issueItemToClientIdMap,
        setIssueItemToClientIdMap,
        dimensionIssueToClientIdMap,
        setDimensionIssueToClientIdMap,
        dimensionIssuesOptions,
        setDimensionIssuesOptions,
        loading,
    } = props;

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

    const isCnaShown = useMemo(() => (
        value?.coordinatedJoint === 'COORDINATED' || value?.coordinatedJoint === 'HARMONIZED'
    ), [
        value?.coordinatedJoint,
    ]);

    return (
        <div className={_cs(styles.assessmentRegistryForm, className)}>
            <Tabs
                useHash
                variant="primary"
                defaultHash="metadata"
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
                    {isCnaShown && (
                        <Tab
                            className={_cs(
                                styles.tab,
                                errorInCna && styles.error,
                            )}
                            name="cna"
                        >
                            CNA
                        </Tab>
                    )}
                    <div className={styles.dummy} />
                </TabList>
                <TabPanel
                    name="metadata"
                    activeClassName={styles.tabPanel}
                >
                    <MetadataForm
                        value={value}
                        setFieldValue={setFieldValue}
                        error={error}
                        regionOptions={regionOptions}
                        setRegionOptions={setRegionOptions}
                        stakeholderOptions={stakeholderOptions}
                        setStakeholderOptions={setStakeholderOptions}
                        loading={loading}
                    />
                </TabPanel>
                <TabPanel
                    name="documents"
                    activeClassName={styles.tabPanel}
                >
                    <AdditionalDocument
                        value={value}
                        setFieldValue={setFieldValue}
                        error={error}
                        uploadedList={uploadedList}
                        setUploadedList={setUploadedList}
                        loading={loading}
                    />
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
                        loading={loading}
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
                        loading={loading}
                    />
                </TabPanel>
                <TabPanel
                    name="summary"
                    activeClassName={styles.tabPanel}
                >
                    <SummaryForm
                        projectId={projectId}
                        value={value}
                        error={error}
                        setFieldValue={setFieldValue}
                        issuesOptions={issuesOptions}
                        setIssuesOptions={setIssuesOptions}
                        issueItemToClientIdMap={issueItemToClientIdMap}
                        setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                        dimensionIssueToClientIdMap={dimensionIssueToClientIdMap}
                        setDimensionIssueToClientIdMap={setDimensionIssueToClientIdMap}
                        dimensionIssuesOptions={dimensionIssuesOptions}
                        setDimensionIssuesOptions={setDimensionIssuesOptions}
                        loading={loading}

                    />
                </TabPanel>
                <TabPanel
                    name="score"
                    activeClassName={styles.tabPanel}
                >
                    <ScoreForm
                        projectId={projectId}
                        value={value}
                        setFieldValue={setFieldValue}
                        error={error}
                        loading={loading}
                    />
                </TabPanel>
                {isCnaShown && (
                    <TabPanel
                        name="cna"
                        activeClassName={styles.tabPanel}
                    >
                        <CnaForm
                            value={value}
                            setFieldValue={setFieldValue}
                            error={error}
                            projectId={projectId}
                        />
                    </TabPanel>
                )}
            </Tabs>
        </div>
    );
}

export default AssessmentRegistryForm;
