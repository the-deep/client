import React, { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { isNotDefined } from '@togglecorp/fujs';

import { PartialFormType } from '#views/EditAry/AssessmentRegistryForm/formSchema';
import {
    AssessmentRegistrySummarySubSectorTypeEnum,
    GetSubPillarIssuesQuery,
    GetSubPillarIssuesQueryVariables,
} from '#generated/types';

import IssueInput from './IssueInput';
import { IssuesInputType } from '../..';

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
    subPillarName?: AssessmentRegistrySummarySubSectorTypeEnum;
    value: IssuesInputType[];
    onValueChange: (id: string, name: string) => void;
}

function SubPillarItem(props: Props) {
    const {
        subPillarName,
        value,
        onValueChange,
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
        });

    return (
        <div className={styles.subPillarItem}>
            { subPillarName }
            <IssueInput
                name={subPillarName}
                options={result?.issues?.results}
                pending={loading}
                value={value}
                onValueChange={onValueChange}
            />
        </div>
    );
}

export default SubPillarItem;
