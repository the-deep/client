import React, { useCallback, useMemo } from 'react';
import { Heading, List, ListView } from '@the-deep/deep-ui';
import { EntriesAsList, Error, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import { isNotDefined, listToGroupList, listToMap } from '@togglecorp/fujs';

import {
    GetSummaryDimensionOptionsQuery,
    GetSummaryDimensionOptionsQueryVariables,
    SummaryOptionType,
} from '#generated/types';

import { PartialFormType, SubSectorIssueInputType } from '../formSchema';
import PillarItem from './PillarItem';

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
            }
        }
    }
`;

export interface DimensionType {
    pillar: string;
    pillarDisplay: string;
    subPillarInformation: {
        subPillar: string;
        subPillarDisplay: string;
    }[]
}

const keySelector = (d: DimensionType) => d.pillar;

interface Props {
    formValue: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
    value: SubSectorIssueInputType[];
    onValueChange: (data: SubSectorIssueInputType) => void;
    projectId: string;
    disabled?: boolean;
}

function SummaryForm(props: Props) {
    const {
        value,
        onValueChange,
        disabled,
        projectId,
        formValue,
        setFieldValue,
        error,
    } = props;

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

    const options = removeNull(data?.project?.assessmentRegistryOptions?.summaryOptions);

    const groupData = useMemo(
        () => listToGroupList(
            options ?? [],
            (d) => d.pillar,
            (d) => d,
        ), [options],
    );
    //     const transformedData = Object.entries(data).map(([pillar, pillarArray]) => ({
    //   pillar,
    //   pillarDisplay: pillarArray[0].pillarDisplay,
    //   pillarInfo: pillarArray.map(({ subPillarDisplay, subPillar }) => ({
    //     subPillarDisplay,
    //     subPillar,
    //   })),
    // }));
    console.log('dimension options', options, groupData);
    const pillarRenderParams = useCallback(
        (key: string, pillarData) => {
            console.log(pillarData, 'eeeeeee');
            return ({
                data: pillarData,
                pillarName: key,
                value,
                onValueChange,
                disabled: loading || disabled,
                formValue,
                setFieldValue,
                error,
            });
        }, [
            onValueChange,
            value,
            loading,
            disabled,
            formValue,
            setFieldValue,
            error,
        ],
    );

    const testData = [
        {
            pillarDisplay: 'Context',
            pillar: 'CONTEXT',
            subPillarInformation: [
                {
                    subPillarDisplay: 'Politics',
                    subPillar: 'POLITICS',
                },
                {
                    subPillarDisplay: 'Demography',
                    subPillar: 'DEMOGRAPHY',
                },
            ],
        },
        {
            pillarDisplay: 'Shock',
            pillar: 'SHOCK',
            subPillarInformation: [
                {
                    subPillarDisplay: 'tes',
                    subPillar: 'tes',
                },
                {
                    subPillarDisplay: 'tes2',
                    subPillar: 'tes2',
                },
            ],
        },
    ];

    return (
        <div className={styles.summary}>
            <Heading>Operational Heading</Heading>
            <List
                data={testData}
                keySelector={keySelector}
                renderer={PillarItem}
                rendererParams={pillarRenderParams}
            />
        </div>
    );
}

export default SummaryForm;
