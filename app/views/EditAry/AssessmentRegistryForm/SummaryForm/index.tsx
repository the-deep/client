import React, { useCallback, useMemo, useState } from 'react';
import { Header, List, Tab, TabList, Tabs } from '@the-deep/deep-ui';
import { EntriesAsList, Error, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import { isDefined, isNotDefined, listToGroupList } from '@togglecorp/fujs';

import {
    AssessmentRegistrySectorTypeEnum,
    AssessmentRegistrySummaryFocusDimensionTypeEnum,
    AssessmentRegistrySummaryPillarTypeEnum,
    AssessmentRegistrySummarySubDimensionTypeEnum,
    AssessmentRegistrySummarySubPillarTypeEnum,
    GetAssessmentRegistrySummaryOptionsQuery,
    GetAssessmentRegistrySummaryOptionsQueryVariables,
} from '#generated/types';

import {
    PartialFormType,
    SummaryIssueType,
} from '../formSchema';
import PillarItem, { type Props as PillarItemProps } from './PillarItem';
import DimensionTabPanel from './DimensionTabPanel';

import styles from './styles.css';

const GET_ASSESSMENT_REGISTRY_SUMMARY_OPTIONS = gql`
    query GetAssessmentRegistrySummaryOptions($projectId: ID!) {
        project(id: $projectId) {
            id
            assessmentRegistryOptions {
                summaryOptions {
                    subPillarDisplay
                    subPillar
                    pillarDisplay
                    pillar
                }
                summaryFocusOptions {
                    dimension
                    subDimension
                    dimensionDisplay
                    subDimensionDisplay
                }
            }
        }
    }
`;

export interface PillarType {
    pillar: AssessmentRegistrySummaryPillarTypeEnum;
    pillarDisplay: string;
    subPillarInformation: {
        subPillar: AssessmentRegistrySummarySubPillarTypeEnum;
        subPillarDisplay: string;
    }[]
}

export interface DimensionType {
    dimension: AssessmentRegistrySummaryFocusDimensionTypeEnum;
    dimensionDisplay: string;
    subDimensionInformation: {
        subDimension: AssessmentRegistrySummarySubDimensionTypeEnum;
        subDimensionDisplay: string;
    }[]
}

const keySelectorPillar = (d: PillarType) => d.pillar;
const keySelectorDimension = (d: DimensionType) => d.dimension;

interface Props {
    projectId: string;
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
    disabled?: boolean;
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    issueItemToClientIdMap: Record<string, string>;
    setIssueItemToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

function SummaryForm(props: Props) {
    const {
        disabled,
        projectId,
        value,
        error,
        setFieldValue,
        issuesOptions,
        setIssuesOptions,
        issueItemToClientIdMap,
        setIssueItemToClientIdMap,
        // setValue,
    } = props;

    const [selectedDimension, setSelectedDimension] = useState<AssessmentRegistrySectorTypeEnum
    | undefined>();

    const variablesForPillarOptions = useMemo(
        (): GetAssessmentRegistrySummaryOptionsQueryVariables => ({ projectId }), [projectId],
    );

    const {
        loading,
        data,
    } = useQuery<GetAssessmentRegistrySummaryOptionsQuery,
    GetAssessmentRegistrySummaryOptionsQueryVariables>(
        GET_ASSESSMENT_REGISTRY_SUMMARY_OPTIONS,
        {
            skip: isNotDefined(projectId),
            variables: variablesForPillarOptions,
        },
    );

    const pillarList: PillarType[] = useMemo(() => {
        const pillarOptions = removeNull(data?.project?.assessmentRegistryOptions?.summaryOptions);
        const groupByPillar = listToGroupList(pillarOptions ?? [], (d) => d.pillar);
        const finalPillarList = Object.entries(groupByPillar).map(
            ([pillarItem, pillarArray]) => ({
                pillar: pillarItem as AssessmentRegistrySummaryPillarTypeEnum,
                pillarDisplay: pillarArray[0].pillarDisplay,
                subPillarInformation: pillarArray.map((subPillarItem) => ({
                    subPillar: subPillarItem.subPillar,
                    subPillarDisplay: subPillarItem.subPillarDisplay,
                })),
            }),
        );

        return finalPillarList;
    }, [data]);

    const dimensionList: DimensionType[] = useMemo(() => {
        const dimensionOptions = removeNull(
            data?.project?.assessmentRegistryOptions?.summaryFocusOptions,
        );
        const groupByDimension = listToGroupList(dimensionOptions ?? [], (d) => d.dimension);
        const finalDimensionList = Object.entries(groupByDimension).map(
            ([dimensionItem, dimensionArray]) => ({
                dimension: dimensionItem as AssessmentRegistrySummaryFocusDimensionTypeEnum,
                dimensionDisplay: dimensionArray[0].dimensionDisplay,
                subDimensionInformation: dimensionArray.map((subDimensionItem) => ({
                    subDimension: subDimensionItem.subDimension,
                    subDimensionDisplay: subDimensionItem.subDimensionDisplay,
                })),
            }),
        );
        return finalDimensionList;
    }, [data]);

    const pillarRenderParams = useCallback(
        (_: string, pillarData: PillarType): PillarItemProps => ({
            data: pillarData,
            issuesOptions,
            setIssuesOptions,
            issueItemToClientIdMap,
            setIssueItemToClientIdMap,
            value,
            setFieldValue,
            disabled: loading || disabled,
            error,
        }), [
            issueItemToClientIdMap,
            setIssueItemToClientIdMap,
            value,
            issuesOptions,
            setIssuesOptions,
            setFieldValue,
            loading,
            disabled,
            error,
        ],
    );

    return (
        <div className={styles.summaryForm}>
            <div className={styles.pillarContent}>
                <Header
                    headingSize="small"
                    heading="Operational Environment"
                />
                <List
                    data={pillarList}
                    keySelector={keySelectorPillar}
                    renderer={PillarItem}
                    rendererParams={pillarRenderParams}
                />
            </div>
            {isDefined(value.sectors) && value.sectors.length > 0 && (
                <div className={styles.dimensionContent}>
                    <Header
                        headingSize="small"
                        heading="SECTORAL UNMET NEEDS"
                    />
                    <Tabs
                        variant="primary"
                        value={selectedDimension}
                        onChange={setSelectedDimension}
                    >
                        <TabList className={styles.tabList}>
                            {value.sectors?.map((sector) => (
                                <Tab
                                    key={sector}
                                    name={sector}
                                    className={styles.tab}
                                >
                                    {sector}
                                </Tab>
                            ))}
                            <div className={styles.dummy} />
                        </TabList>
                        {value.sectors?.map((sector) => (
                            <DimensionTabPanel
                                key={sector}
                                name={sector}
                                data={dimensionList}
                                value={value}
                                setFieldValue={setFieldValue}
                                error={error}
                                issuesOptions={issuesOptions}
                                setIssuesOptions={setIssuesOptions}
                                disabled={disabled}
                            />
                        ))}
                    </Tabs>
                </div>
            )}
        </div>
    );
}

export default SummaryForm;
