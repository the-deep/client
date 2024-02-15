import React, { useCallback, useMemo, useState } from 'react';
import {
    Header,
    ListView,
    Tab,
    TabList,
    Tabs,
    Message,
} from '@the-deep/deep-ui';
import { EntriesAsList, Error, analyzeErrors, getErrorObject, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
} from '@togglecorp/fujs';

import {
    AssessmentRegistrySectorTypeEnum,
    AssessmentRegistrySummaryFocusDimensionTypeEnum,
    AssessmentRegistryFocusTypeEnum,
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

function SummaryForm(props: Props) {
    const {
        disabled,
        projectId,
        value,
        error: riskError,
        setFieldValue,
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

    const error = getErrorObject(riskError);
    const [selectedDimension, setSelectedDimension] = useState<AssessmentRegistrySectorTypeEnum
    | undefined>();

    const variablesForPillarOptions = useMemo(
        (): GetAssessmentRegistrySummaryOptionsQueryVariables => ({ projectId }), [projectId],
    );

    const {
        loading: optionsLoading,
        data,
    } = useQuery<GetAssessmentRegistrySummaryOptionsQuery,
    GetAssessmentRegistrySummaryOptionsQueryVariables>(
        GET_ASSESSMENT_REGISTRY_SUMMARY_OPTIONS,
        {
            skip: isNotDefined(projectId),
            variables: variablesForPillarOptions,
        },
    );

    const selectedFocusesMap = useMemo(() => (
        listToMap(
            value?.focuses,
            (item) => item,
            () => true,
        )
    ), [value?.focuses]);

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

        // FIXME: Need to remove this type cast
        return finalPillarList.filter((item) => selectedFocusesMap?.[
            item.pillar as AssessmentRegistryFocusTypeEnum
        ]);
    }, [
        data,
        selectedFocusesMap,
    ]);

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
        // FIXME: Need to remove this type cast
        return finalDimensionList.filter((item) => selectedFocusesMap?.[
            item.dimension as AssessmentRegistryFocusTypeEnum
        ]);
    }, [
        data,
        selectedFocusesMap,
    ]);

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

    const isFaulty = useMemo(() => {
        if (
            isDefined(error?.summarySubDimensionIssue)
            && isDefined(dimensionIssueToClientIdMap)
        ) {
            const errorSubDimension = Object.keys(dimensionIssueToClientIdMap).reduce(
                (acc, key) => {
                    const clientId = dimensionIssueToClientIdMap[key];
                    const isFaultyInSubDimension = analyzeErrors(
                        getErrorObject(error?.summarySubDimensionIssue)?.[clientId],
                    );
                    acc[key] = isFaultyInSubDimension;
                    return acc;
                }, {} as Record<string, boolean>,
            );

            // NOTE: sector key to error
            const sectorWithError = Object.keys(errorSubDimension).reduce((acc, key) => {
                const sectorKey = key.split('-')?.[0];
                return { ...acc, [sectorKey]: true };
            }, {} as Record<string, boolean>);

            return sectorWithError;
        }
        return {};
    }, [
        error?.summarySubDimensionIssue,
        dimensionIssueToClientIdMap,
    ]);

    if (loading || optionsLoading) {
        return (
            <Message pending={loading || optionsLoading} />
        );
    }

    return (
        <div className={styles.summaryForm}>
            <div className={styles.pillarContent}>
                <Header
                    headingSize="small"
                    heading="Operational Environment"
                />
                <ListView
                    className={styles.pillars}
                    data={pillarList}
                    keySelector={keySelectorPillar}
                    renderer={PillarItem}
                    rendererParams={pillarRenderParams}
                    emptyMessage="Looks like none of the operational environment pillar is selected in Focus tab."
                    pending={false}
                    errored={false}
                    filtered={false}
                    messageShown
                    messageIconShown
                />
            </div>
            {isDefined(value.sectors) && value.sectors.length > 0 && (
                <div className={styles.dimensionContent}>
                    <Header
                        headingSize="small"
                        heading="Sectoral Unmet Needs"
                    />
                    <Tabs
                        variant="primary"
                        value={selectedDimension ?? value.sectors?.[0]}
                        onChange={setSelectedDimension}
                    >
                        <TabList className={styles.tabList}>
                            {value.sectors?.map((sector) => (
                                <Tab
                                    className={_cs(
                                        styles.tab,
                                        isFaulty?.[sector] && styles.error,
                                    )}
                                    key={sector}
                                    name={sector}
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
                                dimensionIssuesOptions={dimensionIssuesOptions}
                                setDimensionIssuesOptions={setDimensionIssuesOptions}
                                dimensionIssueToClientIdMap={dimensionIssueToClientIdMap}
                                setDimensionIssueToClientIdMap={setDimensionIssueToClientIdMap}
                                disabled={disabled}
                                error={error}
                            />
                        ))}
                    </Tabs>
                </div>
            )}
        </div>
    );
}

export default SummaryForm;
