import React, { useCallback, useMemo, useState } from 'react';
import { Heading, List, ListView, Tab, TabList, TabPanel, Tabs } from '@the-deep/deep-ui';
import { EntriesAsList, Error, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import { isDefined, isNotDefined, listToGroupList } from '@togglecorp/fujs';

import {
    AssessmentRegistrySectorTypeEnum,
    AssessmentRegistrySummaryFocusDimmensionTypeEnum,
    AssessmentRegistrySummarySubDimmensionTypeEnum,
    GetSummaryDimensionOptionsQuery,
    GetSummaryDimensionOptionsQueryVariables,
} from '#generated/types';

import { PartialFormType, SubPillarIssueInputType } from '../formSchema';
import PillarItem from './PillarItem';
import DimmensionItem from './DimmensionItem';

import styles from './styles.css';

const GET_SUMMARY_DIMENSION_OPTIONS = gql`
    query GetSummaryDimensionOptions($projectId: ID!) {
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
                    dimmension
                    subDimmension
                    dimmensionDisplay
                    subDimmensionDisplay
                }
            }
        }
    }
`;

export interface PillarType {
    pillar: string;
    pillarDisplay: string;
    subPillarInformation: {
        subPillar: string;
        subPillarDisplay: string;
    }[]
}
export interface DimmensionType {
    dimmension: AssessmentRegistrySummaryFocusDimmensionTypeEnum;
    dimmensionDisplay: string;
    subDimmensionInformation: {
        subDimmension: AssessmentRegistrySummarySubDimmensionTypeEnum;
        subDimmensionDisplay: string;
    }[]
}

const keySelectorPillar = (d: PillarType) => d.pillar;
const keySelectorDimmension = (d: DimmensionType) => d.dimmension;

interface Props {
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
    issueList: SubPillarIssueInputType[];
    setIssueList: React.Dispatch<React.SetStateAction<SubPillarIssueInputType[]>>;
    projectId: string;
    disabled?: boolean;
}

function SummaryForm(props: Props) {
    const {
        issueList,
        setIssueList,
        disabled,
        projectId,
        value,
        setFieldValue,
        error,
    } = props;

    const [selectedDimension, setSelectedDimension] = useState<AssessmentRegistrySectorTypeEnum
    | undefined>();

    const variablesForPillarOptions = useMemo(
        (): GetSummaryDimensionOptionsQueryVariables => ({ projectId }), [projectId],
    );

    const {
        loading,
        data,
    } = useQuery<GetSummaryDimensionOptionsQuery, GetSummaryDimensionOptionsQueryVariables>(
        GET_SUMMARY_DIMENSION_OPTIONS,
        {
            skip: isNotDefined(projectId),
            variables: variablesForPillarOptions,
        },
    );

    const [
        pillarList,
        dimmensionList,
    ] = useMemo(() => {
        const pillarOptions = removeNull(data?.project?.assessmentRegistryOptions?.summaryOptions);
        const groupByPillar = listToGroupList(pillarOptions ?? [], (d) => d.pillar);
        const finalPillarList = Object.entries(groupByPillar).map(
            ([pillarItem, pillarArray]) => ({
                pillar: pillarItem,
                pillarDisplay: pillarArray[0].pillarDisplay,
                subPillarInformation: pillarArray.map((subPillarItem) => ({
                    subPillar: subPillarItem.subPillar,
                    subPillarDisplay: subPillarItem.subPillarDisplay,
                })),
            }),
        );

        const dimmensionOptions = removeNull(
            data?.project?.assessmentRegistryOptions?.summaryFocusOptions,
        );
        const groupByDimmension = listToGroupList(dimmensionOptions ?? [], (d) => d.dimmension);
        const finalDimmensionList = Object.entries(groupByDimmension).map(
            ([dimmension, dimmensionArray]) => ({
                pillar: dimmension,
                pillarDisplay: dimmensionArray[0].dimmensionDisplay,
                subDimmensionInformation: dimmensionArray.map((subDimmensionItem) => ({
                    subDimmension: subDimmensionItem.subDimmension,
                    subDimmensionDisplay: subDimmensionItem.subDimmensionDisplay,
                })),
            }),
        );
        return ([finalPillarList, finalDimmensionList]);
    }, [data]);

    // FIXME: side effect hook
    useMemo(
        () => (isDefined(value.sectors) && setSelectedDimension(value.sectors[0])),
        [value.sectors],
    );

    const pillarRenderParams = useCallback(
        (name: string, pillarData) => ({
            data: pillarData,
            pillarName: name,
            issueList,
            setIssueList,
            disabled: loading || disabled,
            value,
            setFieldValue,
            error,
        }), [
            setIssueList,
            issueList,
            loading,
            disabled,
            value,
            setFieldValue,
            error,
        ],
    );

    const dimmensionRendererParams = useCallback(
        (_: string, dimmensionData) => ({
            data: dimmensionData,
        }), [],
    );

    return (
        <>
            <div className={styles.summary}>
                <Heading>Operational Environment</Heading>
                <List
                    data={pillarList}
                    keySelector={keySelectorPillar}
                    renderer={PillarItem}
                    rendererParams={pillarRenderParams}
                />
            </div>
            {isDefined(value.sectors) && value.sectors.length > 0 && (
                <div className={styles.summary}>
                    <Heading>SECTORAL UNMET NEEDS</Heading>
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
                            <TabPanel
                                key={sector}
                                name={sector}
                            >
                                <ListView
                                    data={dimmensionList}
                                    keySelector={keySelectorDimmension}
                                    renderer={DimmensionItem}
                                    rendererParams={dimmensionRendererParams}
                                />

                                {sector}
                            </TabPanel>
                        ))}
                    </Tabs>
                </div>
            )}
        </>
    );
}

export default SummaryForm;
