import React, { useCallback, useMemo, useState } from 'react';
import { Header, Heading, List, Tab, TabList, TabPanel, Tabs } from '@the-deep/deep-ui';
import { Error, removeNull, SetBaseValueArg } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import { isDefined, isNotDefined, listToGroupList } from '@togglecorp/fujs';

import {
    AssessmentRegistrySectorTypeEnum,
    AssessmentRegistrySummaryFocusDimmensionTypeEnum,
    AssessmentRegistrySummarySubDimmensionTypeEnum,
    AssessmentRegistrySummarySubPillarTypeEnum,
    GetAssessmentRegistrySummaryOptionsQuery,
    GetAssessmentRegistrySummaryOptionsQueryVariables,
} from '#generated/types';

import { SubPillarIssuesMapType, PartialFormType } from '../formSchema';
import PillarItem from './PillarItem';
import DimmensionItem from './DimmensionItem';

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

type IssueOptionsType = {
    id: string;
    label: string;
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum | null;
    subDimmension?: AssessmentRegistrySummarySubDimmensionTypeEnum | null;
}

const keySelectorPillar = (d: PillarType) => d.pillar;
const keySelectorDimmension = (d: DimmensionType) => d.dimmension;

interface Props {
    projectId: string;
    value: PartialFormType;
    error: Error<PartialFormType>;
    issueOptions?: IssueOptionsType[] | null;
    pillarIssuesList: SubPillarIssuesMapType;
    disabled?: boolean;
    setValue: (value: SetBaseValueArg<PartialFormType>) => void;
    handleIssueAdd: (name: string, value: string) => void;
    refetchIssuesOptions: () => void;
}

function SummaryForm(props: Props) {
    const {
        pillarIssuesList,
        disabled,
        projectId,
        value,
        error,
        issueOptions,
        handleIssueAdd,
        setValue,
        refetchIssuesOptions,
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
            ([dimmensionItem, dimmensionArray]) => ({
                dimmension: dimmensionItem,
                dimmensionDisplay: dimmensionArray[0].dimmensionDisplay,
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
            pillarIssuesList,
            issueOptions,
            disabled: loading || disabled,
            error,
            handleIssueAdd,
            refetchIssuesOptions,
            formValue: value,
        }), [
            pillarIssuesList,
            issueOptions,
            value,
            loading,
            disabled,
            error,
            handleIssueAdd,
            refetchIssuesOptions,
        ],
    );

    const dimmensionRendererParams = useCallback(
        (_: string, dimmensionData) => ({
            data: dimmensionData,
            issueOptions,
            disabled: loading || disabled,
            error,
            refetchIssuesOptions,
        }), [
            issueOptions,
            loading,
            disabled,
            error,
            refetchIssuesOptions,
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
                            <TabPanel
                                key={sector}
                                name={sector}
                                className={styles.tabPanel}
                            >
                                <List
                                    data={dimmensionList}
                                    keySelector={keySelectorDimmension}
                                    renderer={DimmensionItem}
                                    rendererParams={dimmensionRendererParams}
                                />
                            </TabPanel>
                        ))}
                    </Tabs>
                </div>
            )}
        </div>
    );
}

export default SummaryForm;
