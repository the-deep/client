import React, { useCallback, useMemo } from 'react';
import {
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
    removeNull,
    SetBaseValueArg,
} from '@togglecorp/toggle-form';
import { isDefined, isNotDefined, listToMap, _cs } from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';

import { BasicRegion } from '#components/selections/RegionMultiSelectInput';
import { BasicOrganization } from '#types';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { GalleryFileType, GetSubPillarIssuesQuery, GetSubPillarIssuesQueryVariables } from '#generated/types';

import MetadataForm from './MetadataForm';
import MethodologyForm from './MethodologyForm';
import FocusForm from './FocusForm';
import CnaForm from './CnaForm';
import ScoreForm from './ScoreForm';
import SummaryForm from './SummaryForm';
import AdditionalDocument from './AdditionalDocument';

import { PartialFormType } from './formSchema';

import styles from './styles.css';

const GET_ASSESSMENT_SUMMARY_ISSUES = gql`
    query GetSubPillarIssues {
        assessmentRegSummaryIssues {
            results {
                id
                label
                subPillar
                subDimmension
            }
        }
    }
`;
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

    const {
        loading,
        data: issuesResponse,
        refetch,
    } = useQuery<GetSubPillarIssuesQuery, GetSubPillarIssuesQueryVariables>(
        GET_ASSESSMENT_SUMMARY_ISSUES,
    );

    const pillarIssueMappedData = useMemo(
        () => {
            const removeNullIssue = removeNull(issuesResponse?.assessmentRegSummaryIssues?.results);
            const issueBySubPillar = listToMap(
                removeNullIssue ?? [],
                (d) => d.id,
            );
            const resultMap = (value.summarySubPillarIssue ?? []).reduce((acc, currentIssue) => {
                const subPillarInfo = currentIssue.summaryIssue
                    ? issueBySubPillar[currentIssue.summaryIssue] : undefined;
                if (isDefined(subPillarInfo)) {
                    // FIXME: subPillar type required in server
                    const key = `${subPillarInfo.subPillar}-${currentIssue.order}`;
                    // FIXME: Typescript can't provide type saftely for dynamic key
                    acc[key] = currentIssue;
                }
                return acc;
            }, {});
            return resultMap;
        },
        [value, issuesResponse],
    );

    const updatePillarItemValue = useCallback(
        (
            summaryissueToUpdate: string,
            targetOrder: number,
            updatedSummaryIssue: string,
            updatedText?: string,
        ) => value.summarySubPillarIssue?.map(
            (item) => {
                if (
                    item.summaryIssue === summaryissueToUpdate
                    && item.order === targetOrder
                ) {
                    return {
                        ...item,
                        summaryIssue: updatedSummaryIssue,
                        text: updatedText,
                    };
                }
                return item;
            },
        ), [value],
    );
    const handlePillarIssueAdd = useCallback(
        (n: string, issueId: string) => {
            const issueOrder = n.split('-')[1];
            const previousMatch = pillarIssueMappedData[n];
            if (isDefined(previousMatch)) {
                const updatedValue = updatePillarItemValue(
                    previousMatch?.summaryIssue,
                    previousMatch?.order,
                    issueId,
                );
                setFieldValue(
                    (_: PartialFormType['summarySubPillarIssue']) => [...updatedValue ?? []],
                    'summarySubPillarIssue',
                );
            }
            if (isNotDefined(previousMatch)) {
                setFieldValue((prev: PartialFormType['summarySubPillarIssue']) => {
                    const newValue = {
                        summaryIssue: issueId,
                        order: Number(issueOrder),
                        text: '',
                    };
                    return [...prev ?? [], newValue];
                }, 'summarySubPillarIssue');
            }
        }, [setFieldValue, pillarIssueMappedData, updatePillarItemValue],
    );

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
                    <AdditionalDocument
                        value={value}
                        setFieldValue={setFieldValue}
                        error={error}
                        uploadedList={uploadedList}
                        setUploadedList={setUploadedList}
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
                    <SummaryForm
                        projectId={projectId}
                        value={value}
                        error={error}
                        setValue={setValue}
                        issueOptions={issuesResponse?.assessmentRegSummaryIssues?.results}
                        pillarIssuesList={pillarIssueMappedData}
                        handleIssueAdd={handlePillarIssueAdd}
                        refetchIssuesOptions={refetch}
                        disabled={loading}
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
                    />
                </TabPanel>
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
            </Tabs>
        </div>
    );
}

export default AssessmentRegistryForm;
