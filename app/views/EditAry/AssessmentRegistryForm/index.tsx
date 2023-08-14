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
import { isDefined, listToMap, _cs } from '@togglecorp/fujs';
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

import { PartialFormType, SubPillarIssueInputType } from './formSchema';

import styles from './styles.css';

const GET_SUBPILLAR_ISSUES = gql`
    query GetSubPillarIssues {
        assessmentRegSummaryIssues {
            results {
                id
                label
                subPillar
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
    issueList: SubPillarIssueInputType[];
    setIssueList: React.Dispatch<React.SetStateAction<SubPillarIssueInputType[]>>;
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
        issueList,
        setIssueList,
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

    // useEffect(
    //     () => {
    //         setFieldValue(() => {
    //             const val = issueList?.map((issueItem) => ({
    //                 summaryIssue: issueItem.issueId,
    //                 order: Number(issueItem.order),
    //                 text: issueItem?.text ?? '',
    //             })).filter((item) => isTruthyString(item.summaryIssue));
    //             return [val].flat();
    //         }, 'summarySubPillarIssue');
    //     }, [setFieldValue, issueList],
    // );

    const {
        loading,
        data: issuesResponse,
    } = useQuery<GetSubPillarIssuesQuery, GetSubPillarIssuesQueryVariables>(
        GET_SUBPILLAR_ISSUES,
    );

    const handleIssueAdd = useCallback(
        (n: string, v: string) => {
            const issueOrder = n.split('-')[1];
            setFieldValue((prev: PartialFormType['summarySubPillarIssue']) => {
                const safeOldValue = (prev ?? []).filter(
                    (item) => item.summaryIssue !== v && item.order !== Number(issueOrder),
                );
                const newValue = {
                    summaryIssue: v,
                    order: Number(issueOrder),
                    text: '',
                };
                return [...safeOldValue, newValue];
            }, 'summarySubPillarIssue');
        }, [setFieldValue],
    );

    // FIXME: subPillar type required in server
    const generateKey = useCallback(
        (subPillar?: string, order?: number): string => `${subPillar}-${order}`,
        [],
    );
    const issueMappedData = useMemo(
        () => {
            const removeNullIssue = removeNull(issuesResponse?.assessmentRegSummaryIssues?.results);
            const issueBySubPillar = listToMap(
                removeNullIssue ?? [],
                (d) => d.id,
            );
            const resultMap = (value.summarySubPillarIssue ?? []).reduce((acc, item) => {
                const subPillarInfo = item.summaryIssue
                    ? issueBySubPillar[item.summaryIssue] : undefined;
                if (isDefined(subPillarInfo)) {
                    const key = generateKey(subPillarInfo.subPillar, item.order);
                    // FIXME: Typescript can't provide type saftely for dynamic key
                    acc[key as string] = item;
                }
                return acc;
            }, {});
            return resultMap;
        },
        [value, issuesResponse],
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
                        issueOptions={issuesResponse?.assessmentRegSummaryIssues?.results}
                        issueList={issueMappedData}
                        handleIssueAdd={handleIssueAdd}
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
