import React, { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { isNotDefined } from '@togglecorp/fujs';

import {
    AssessmentRegistrySummarySubPillarTypeEnum,
    GetSubPillarIssuesQuery,
    GetSubPillarIssuesQueryVariables,
} from '#generated/types';
import { SubPillarIssueInputType } from '#views/EditAry/AssessmentRegistryForm/formSchema';

import IssueInput from './IssueInput';

import styles from './styles.css';

const GET_SUBPILLAR_ISSUES = gql`
    query GetSubPillarIssues ($subPillar: AssessmentRegistrySummarySubPillarTypeEnum) {
        assessmentRegSummaryIssues(subPillar: $subPillar) {
            results {
                id
                label
                subPillar
                subPillarDisplay
            }
        }
    }
`;

interface Props {
    name: string;
    issueList: SubPillarIssueInputType[];
    setIssueList: React.Dispatch<React.SetStateAction<SubPillarIssueInputType[]>>;
    onSuccessIssueAdd: (issue: SubPillarIssueInputType[]) => void;
    disabled?: boolean;
}

function SubPillarItem(props: Props) {
    const {
        name,
        issueList,
        setIssueList,
        onSuccessIssueAdd,
        disabled,
    } = props;

    const variablesForSubPillarIssues = useMemo(
        (): GetSubPillarIssuesQueryVariables => ({
            subPillar: name as AssessmentRegistrySummarySubPillarTypeEnum,
        }), [name],
    );

    const {
        loading,
        data: result,
    } = useQuery<GetSubPillarIssuesQuery, GetSubPillarIssuesQueryVariables>(
        GET_SUBPILLAR_ISSUES, {
            skip: isNotDefined(name),
            variables: variablesForSubPillarIssues,
        },
    );

    return (
        <div className={styles.subPillarItem}>
            { name }
            <IssueInput
                name={name}
                options={result?.assessmentRegSummaryIssues?.results}
                value={issueList}
                setValue={setIssueList}
                onSuccessIssueAdd={onSuccessIssueAdd}
                disabled={disabled || loading}
            />
        </div>
    );
}

export default SubPillarItem;
