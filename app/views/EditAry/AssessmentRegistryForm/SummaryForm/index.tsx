import React, { useCallback, useMemo, useState } from 'react';
import { Header, List, Tab, TabList, TabPanel, Tabs } from '@the-deep/deep-ui'; import { EntriesAsList, Error, removeNull } from '@togglecorp/toggle-form';
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
    SubPillarIssuesMapType,
    PartialFormType,
    SummaryIssueType,
} from '../formSchema';
import PillarItem from './PillarItem';
import DimensionItem from './DimensionItem';
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
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    pillarIssuesList: SubPillarIssuesMapType;
    // setValue: (value: SetBaseValueArg<PartialFormType>) => void;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    handleIssueAdd: (name: string, value: string) => void;
    error: Error<PartialFormType>;
    disabled?: boolean;
}

function SummaryForm(props: Props) {
    const {
        pillarIssuesList,
        disabled,
        projectId,
        value,
        error,
        setFieldValue,
        issuesOptions,
        setIssuesOptions,
        handleIssueAdd,
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

    const [
        pillarList,
        dimensionList,
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
        return ([finalPillarList, finalDimensionList]);
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
            issuesOptions,
            setIssuesOptions,
            handleIssueAdd,
            formValue: value,
            // setValue,
            disabled: loading || disabled,
            error,
        }), [
            value,
            pillarIssuesList,
            issuesOptions,
            setIssuesOptions,
            handleIssueAdd,
            loading,
            disabled,
            error,
        ],
    );

    const dimensionRendererParams = useCallback(
        (_: string, dimensionData) => ({
            value,
            data: dimensionData,
            setFieldValue,
            issuesOptions,
            setIssuesOptions,
            disabled: loading || disabled,
            error,
        }), [
            value,
            setFieldValue,
            issuesOptions,
            setIssuesOptions,
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
                            /* <TabPanel
                                key={sector}
                                name={sector}
                                className={styles.tabPanel}
                            >
                                <List
                                    data={dimensionList}
                                    keySelector={keySelectorDimension}
                                    renderer={DimensionItem}
                                    rendererParams={dimensionRendererParams}
                                />
                            </TabPanel> */
                        ))}
                    </Tabs>
                </div>
            )}
        </div>
    );
}

export default SummaryForm;
