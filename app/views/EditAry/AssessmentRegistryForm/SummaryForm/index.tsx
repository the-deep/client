import React, { useCallback, useMemo, useState } from 'react';
import { Heading, List } from '@the-deep/deep-ui';
import { EntriesAsList, Error, removeNull, SetBaseValueArg } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import { isNotDefined, listToGroupList } from '@togglecorp/fujs';

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

export interface IssuesInputType {
    issueId: string;
    name: string;
    order: string;
}
interface Props {
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    setValue: (value: SetBaseValueArg<PartialFormType>) => void;
    error: Error<PartialFormType>;
    projectId: string;
    disabled?: boolean;
    readOnly?: boolean;
}

function SummaryForm(props: Props) {
    const {
        value,
        setFieldValue,
        setValue,
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

    const [issueList, setIssueList] = useState<IssuesInputType[]>([]);

    const handleIssueSelect = useCallback(
        (issueId: string, subPillar: string) => {
            setIssueList(
                (prev: IssuesInputType[]) => {
                    const safeOldValue = prev?.filter((item) => item.name !== subPillar);
                    const newValue = {
                        issueId,
                        name: subPillar,
                        order: subPillar.split('-')[1],
                    };
                    return [...safeOldValue, newValue];
                },
            );
        }, [setIssueList],
    );

    const pillarRenderParams = useCallback(
        (name: string, pillarData: SummaryOptionType) => ({
            data: pillarData,
            value: issueList,
            onValueChange: handleIssueSelect,
        }), [issueList, handleIssueSelect],
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
