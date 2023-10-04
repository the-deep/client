import React, {
    useMemo,
    useState,
    useCallback,
} from 'react';

import {
    Footer,
    ListView,
    Pager,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import {
    AssessmentRegistrySummarySubDimensionTypeEnum,
    AssessmentRegistrySummarySubPillarTypeEnum,
    GetSummaryIssueQuery,
    GetSummaryIssueQueryVariables,
} from '#generated/types';

import IssueItem, { Props as IssueProps } from './IssueItem';

import styles from './styles.css';

const GET_SUMMARY_ISSUE = gql`
    query GetSummaryIssue(
        $subPillar: AssessmentRegistrySummarySubPillarTypeEnum,
        $subDimension: AssessmentRegistrySummarySubDimensionTypeEnum,
        $search: String,
        $isParent: Boolean,
        $page: Int,
        $pageSize: Int,
    ) {
        assessmentRegSummaryIssues(
            subPillar: $subPillar,
            subDimension: $subDimension,
            search: $search,
            isParent: $isParent,
            pageSize: $pageSize,
            page: $page,
        ) {
            page
            results {
                id
                label
                childCount
                level
                parent {
                    id
                    label
                    childCount
                    level
                    subPillar
                    subDimension
                }
                subPillar
                subDimension
            }
            totalCount
        }
    }
`;

type SummaryIssueType = NonNullable<NonNullable<GetSummaryIssueQuery['assessmentRegSummaryIssues']>['results']>[number];
interface Props {
    type: 'pillar' | 'dimension';
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum;
    subDimension?: AssessmentRegistrySummarySubDimensionTypeEnum;
}
const keySelector = (d: SummaryIssueType) => d.id;

function AddSummaryIssue(props: Props) {
    const {
        type,
        subPillar,
        subDimension,
    } = props;

    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);

    const variables = useMemo(
        (): GetSummaryIssueQueryVariables => ({
            subPillar,
            subDimension,
            isParent: true,
            page,
            pageSize,
        }), [
            subPillar,
            subDimension,
            page,
            pageSize,
        ],
    );

    const {
        loading,
        previousData,
        data = previousData,
    } = useQuery<GetSummaryIssueQuery, GetSummaryIssueQueryVariables>(
        GET_SUMMARY_ISSUE,
        {
            skip: isNotDefined(variables),
            variables,
        },
    );

    const issueParams = useCallback(
        (
            name: string,
            issuesData: SummaryIssueType,
        ): IssueProps => ({
            name,
            data: issuesData,
            subPillar,
            subDimension,
            type,
        }),
        [
            subPillar,
            subDimension,
            type,
        ],
    );

    const response = useMemo(
        () => removeNull(data?.assessmentRegSummaryIssues),
        [data?.assessmentRegSummaryIssues],
    );

    return (
        <>
            <ListView
                className={styles.issueListContainer}
                data={data?.assessmentRegSummaryIssues?.results}
                keySelector={keySelector}
                renderer={IssueItem}
                rendererParams={issueParams}
                errored={false}
                filtered={false}
                pending={loading}
                messageShown
                messageIconShown
            />
            {isDefined(response?.totalCount) && response?.totalCount > 0 && (
                <Footer
                    actions={(
                        <Pager
                            activePage={page}
                            itemsCount={(response?.totalCount) ?? 0}
                            maxItemsPerPage={pageSize}
                            onActivePageChange={setPage}
                            onItemsPerPageChange={setPageSize}
                            itemsPerPageControlHidden
                            infoVisibility="hidden"
                        />
                    )}
                />
            )}
        </>
    );
}
export default AddSummaryIssue;
