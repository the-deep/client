import React, { useCallback, useMemo, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { isNotDefined } from '@togglecorp/fujs';

import {
    AssessmentRegistrySummarySubSectorTypeEnum,
    GetSubPillarIssuesQuery,
    GetSubPillarIssuesQueryVariables,
    SummarySubSectorIssueInputType,
} from '#generated/types';

import IssueInput from './IssueInput';

import styles from './styles.css';

const GET_SUBPILLAR_ISSUES = gql`
    query GetSubPillarIssues ($subPillar: AssessmentRegistrySummarySubSectorTypeEnum) {
        issues(subSector: $subPillar) {
            results {
                id
                label
            }
        }
    }
`;

interface Props {
    data?: AssessmentRegistrySummarySubSectorTypeEnum;
    value: SummarySubSectorIssueInputType;
    onValueChange: React.Dispatch<React.SetStateAction<SummarySubSectorIssueInputType>>;
    onAdd: (summaryId: string, text: string) => void;
}

function SubPillarItem(props: Props) {
    const {
        data,
        value,
        onValueChange,
        onAdd,
    } = props;

    const variablesForSubPillarIssues = useMemo(
        (): GetSubPillarIssuesQueryVariables => ({ subPillar: data }), [data],
    );

    const {
        loading,
        data: result,
    } = useQuery<GetSubPillarIssuesQuery, GetSubPillarIssuesQueryVariables>(
        GET_SUBPILLAR_ISSUES, {
            skip: isNotDefined(data),
            variables: variablesForSubPillarIssues,
        });

    const handleIssuesChange = useCallback(
        (issueId: string) => {
            onAdd(issueId, '');
        }, [],
    );

    return (
        <div className={styles.subPillarItem}>
            { data }
            <IssueInput
                name={data}
                options={result?.issues?.results}
                pending={loading}
                value={value}
                onValueChange={onValueChange}
                onAdd={handleIssuesChange}
            />
        </div>
    );
}

export default SubPillarItem;
