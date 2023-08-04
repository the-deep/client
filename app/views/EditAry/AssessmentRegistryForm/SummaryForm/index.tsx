import React, { useCallback, useMemo } from 'react';
import { Heading, List } from '@the-deep/deep-ui';
import { Error, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import { isNotDefined } from '@togglecorp/fujs';

import {
    GetSummaryPillarOptionsQuery,
    GetSummaryPillarOptionsQueryVariables,
    SummaryOptionType,
} from '#generated/types';

import { PartialFormType, SubSectorIssueInputType } from '../formSchema';
import PillarItem from './PillarItem';

import styles from './styles.css';

const GET_SUMMARY_PILLAR_OPTIONS = gql`
    query GetSummaryPillarOptions($projectId: ID!) {
        project(id: $projectId) {
            id
            assessmentRegistryOptions {
                summaryOptions {
                    sector
                    subSector
                }
            }
        }
    }
`;

const keySelector = (d: SummaryOptionType) => d.sector;

interface Props {
    value: SubSectorIssueInputType[];
    onValueChange: (id: string, name: string) => void;
    projectId: string;
    disabled?: boolean;
}

function SummaryForm(props: Props) {
    const {
        value,
        onValueChange,
        error,
        disabled,
        projectId,
    } = props;

    const variablesForPillarOptions = useMemo(
        (): GetSummaryPillarOptionsQueryVariables => ({ projectId }), [projectId],
    );

    const {
        loading,
        data,
    } = useQuery<GetSummaryPillarOptionsQuery, GetSummaryPillarOptionsQueryVariables>(
        GET_SUMMARY_PILLAR_OPTIONS,
        {
            skip: isNotDefined(projectId),
            variables: variablesForPillarOptions,
        },
    );

    const options = removeNull(data?.project?.assessmentRegistryOptions?.summaryOptions);
    const pillarRenderParams = useCallback(
        (_: string, pillarData: SummaryOptionType) => ({
            data: pillarData,
            value,
            onValueChange,
            disabled: loading || disabled,
        }), [onValueChange, value, loading, disabled],
    );

    return (
        <div className={styles.summary}>
            <Heading>Operational Heading</Heading>
            <List
                data={options}
                keySelector={keySelector}
                renderer={PillarItem}
                rendererParams={pillarRenderParams}
            />
        </div>
    );
}

export default SummaryForm;
