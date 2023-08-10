import React, { useMemo } from 'react';
import { gql } from '@apollo/client/core';
import { useQuery } from '@apollo/client';
import { isNotDefined } from '@togglecorp/fujs';
import {
    AssessmentRegistrySummarySubDimmensionTypeEnum,
    GetSubDimmensionIssuesQuery,
    GetSubDimmensionIssuesQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const GET_SUB_DIMMENSION_ISSUES = gql`
    query GetSubDimmensionIssues ($subDimmension: AssessmentRegistrySummarySubDimmensionTypeEnum) {
        assessmentRegSummaryIssues(subDimmension: $subDimmension) {
            results {
                id
                label
                subDimmension
                subDimmensionDisplay
            }
        }
    }
`;

interface Props {
    name: string;
    // value: SubPillarIssueInputType[];
    // onValueChange: (data: SubPillarIssueInputType) => void;
    // disabled?: boolean;
}

function SubDimmensionItem(props: Props) {
    const { name } = props;

    const variablesForSubDimmensionIssues = useMemo(
        (): GetSubDimmensionIssuesQueryVariables => ({
            subDimmension: name as AssessmentRegistrySummarySubDimmensionTypeEnum,
        }), [name],
    );

    const {
        loading,
        data: result,
    } = useQuery<GetSubDimmensionIssuesQuery, GetSubDimmensionIssuesQueryVariables>(
        GET_SUB_DIMMENSION_ISSUES, {
            skip: isNotDefined(name),
            variables: variablesForSubDimmensionIssues,
        },
    );
    return (
        <div className={styles.subDimmensionItem}>
            this is sub dimmension component

        </div>
    );
}

export default SubDimmensionItem;
