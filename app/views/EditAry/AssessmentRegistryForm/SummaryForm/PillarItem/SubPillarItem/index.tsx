import React, { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { isNotDefined } from '@togglecorp/fujs';

import {
    AssessmentRegistrySummarySubPillarTypeEnum,
    GetSubPillarIssuesQuery,
    GetSubPillarIssuesQueryVariables,
} from '#generated/types';
import { SubSectorIssueInputType } from '#views/EditAry/AssessmentRegistryForm/formSchema';

import IssueInput from './IssueInput';

import styles from './styles.css';
import { DimensionType } from '../..';

const GET_SUBPILLAR_ISSUES = gql`
    query GetSubPillarIssues ($subPillar: AssessmentRegistrySummarySubPillarTypeEnum) {
        issues(subPillar: $subPillar) {
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
    subPillarData: NonNullable<DimensionType['subPillarInformation']>[number];
    subPillarName: AssessmentRegistrySummarySubPillarTypeEnum;
    value: SubSectorIssueInputType[];
    onValueChange: (data: SubSectorIssueInputType) => void;
    disabled?: boolean;
}

function SubPillarItem(props: Props) {
    const {
        subPillarData,
        subPillarName,
        value,
        onValueChange,
        disabled,
    } = props;

    const variablesForSubPillarIssues = useMemo(
        (): GetSubPillarIssuesQueryVariables => ({ subPillar: subPillarName }), [subPillarName],
    );
    console.log('sub Info object', subPillarData);

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
