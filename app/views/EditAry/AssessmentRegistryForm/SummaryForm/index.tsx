import React, { useCallback, useMemo, useState } from 'react';
import { Heading, List } from '@the-deep/deep-ui';
import { EntriesAsList, Error, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import { isNotDefined } from '@togglecorp/fujs';

import {
    GetSummaryPillarOptionsQuery,
    GetSummaryPillarOptionsQueryVariables,
    SummaryOptionType,
    SummarySubSectorIssueInputType,
} from '#generated/types';

import { PartialFormType } from '../formSchema';
import PillarItem from './PillarItem';
import styles from './styles.css';

const GET_SUMMARY_PILLAR_OPTIONS = gql`
    query GetSummaryPillarOptions($projectId: ID!) {
        project(id: $projectId) {
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
    value: PartialFormType,
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
    projectId: string;
    disabled?: boolean;
    readOnly?: boolean;
}

function SummaryForm(props: Props) {
    const {
        value,
        setFieldValue,
        error,
        disabled,
        readOnly,
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

    const [issues, setIssues] = useState<SummarySubSectorIssueInputType[]>([]);

    const handleSuccessIssueAdd = useCallback(
        (id, text) => {
            setIssues((prevVal) => ([
                ...(prevVal ?? []),
                {
                    summaryIssue: id,
                    text,
                },
            ]));
        }, [],
    );

    console.log('this are issues', issues);

    const pillarRenderParams = useCallback(
        (name: string, pillarData: SummaryOptionType) => ({
            data: pillarData,
            value: value.summarySubsectorIssue,
            onValueChange: setFieldValue,
            onAdd: handleSuccessIssueAdd,
        }), [],
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
