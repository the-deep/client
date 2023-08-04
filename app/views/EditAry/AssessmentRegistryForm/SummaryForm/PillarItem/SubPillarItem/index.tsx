import React, { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { isNotDefined } from '@togglecorp/fujs';

import {
    AssessmentRegistrySummarySubSectorTypeEnum,
    GetSubPillarIssuesQuery,
    GetSubPillarIssuesQueryVariables,
} from '#generated/types';
import { SubSectorIssueInputType } from '#views/EditAry/AssessmentRegistryForm/formSchema';

import IssueInput from './IssueInput';

import styles from './styles.css';

const GET_SUBPILLAR_ISSUES = gql`
    query GetSubPillarIssues ($subPillar: AssessmentRegistrySummarySubSectorTypeEnum) {
        issues(subSector: $subPillar) {
            results {
                id
                label
                subSector
            }
        }
    }
`;

interface Props {
    subPillarName?: AssessmentRegistrySummarySubSectorTypeEnum;
    value: SubSectorIssueInputType[];
    onValueChange: (id: string, name: string) => void;
    disabled?: boolean;
}

function SubPillarItem(props: Props) {
    const {
        subPillarName,
        value,
        onValueChange,
        disabled,
    } = props;

    const variablesForSubPillarIssues = useMemo(
        (): GetSubPillarIssuesQueryVariables => ({ subPillar: subPillarName }), [subPillarName],
    );

    const {
        loading,
        data: result,
    } = useQuery<GetSubPillarIssuesQuery, GetSubPillarIssuesQueryVariables>(
        GET_SUBPILLAR_ISSUES, {
            skip: isNotDefined(subPillarName),
            variables: variablesForSubPillarIssues,
        },
    );

    return (
        <div className={styles.subPillarItem}>
            { subPillarName }
            <IssueInput
                name={subPillarName}
                options={result?.issues?.results}
                value={value}
                onValueChange={onValueChange}
                disabled={disabled || loading}
            />
        </div>
    );
}

export default SubPillarItem;
