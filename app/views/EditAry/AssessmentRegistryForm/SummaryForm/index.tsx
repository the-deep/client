import React, { useCallback, useMemo } from 'react';
import { Heading, List } from '@the-deep/deep-ui';
import { EntriesAsList, Error, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import { isNotDefined, listToGroupList } from '@togglecorp/fujs';

import {
    GetSummaryDimensionOptionsQuery,
    GetSummaryDimensionOptionsQueryVariables,
} from '#generated/types';

import { PartialFormType, SubPillarIssueInputType } from '../formSchema';
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

export interface PillarType {
    pillar: string;
    pillarDisplay: string;
    subPillarInformation: {
        subPillar: string;
        subPillarDisplay: string;
    }[]
}

const keySelector = (d: PillarType) => d.pillar;

interface Props {
    formValue: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
    value: SubPillarIssueInputType[];
    onValueChange: (data: SubPillarIssueInputType) => void;
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

    const groupByPillar = useMemo(
        () => listToGroupList(
            options ?? [],
            (d) => d.pillar,
        ), [options],
    );

    const transformPillarData = Object.entries(groupByPillar).map(([pillarItem, pillarArray]) => ({
        pillar: pillarItem,
        pillarDisplay: pillarArray[0].pillarDisplay,
        subPillarInformation: pillarArray.map((subPillarItem) => ({
            subPillar: subPillarItem.subPillar,
            subPillarDisplay: subPillarItem.subPillarDisplay,
        })),
    }));

    const pillarRenderParams = useCallback(
        (name: string, pillarData) => ({
            data: pillarData,
            pillarName: name,
            value,
            onValueChange,
            disabled: loading || disabled,
            formValue,
            setFieldValue,
            error,
        }), [
            onValueChange,
            value,
            loading,
            disabled,
            formValue,
            setFieldValue,
            error,
        ],
    );

    return (
        <div className={styles.summary}>
            <Heading>Operational Heading</Heading>
            <List
                data={transformPillarData}
                keySelector={keySelector}
                renderer={PillarItem}
                rendererParams={pillarRenderParams}
            />
        </div>
    );
}

export default SummaryForm;
