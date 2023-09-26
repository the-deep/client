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
import { isNotDefined } from '@togglecorp/fujs';

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
                parent {
                    id
                    label
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

interface Props {
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum;
    subDimension?: AssessmentRegistrySummarySubDimensionTypeEnum;
}
const keySelector = (d: NonNullable<NonNullable<GetSummaryIssueQuery['assessmentRegSummaryIssues']>['results']>[number]) => d.id;

function AddSummaryIssue(props: Props) {
    const {
        subPillar,
        subDimension,
    } = props;

    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);

    const variables = useMemo(
        (): GetSummaryIssueQueryVariables => ({
            subPillar: subPillar as AssessmentRegistrySummarySubPillarTypeEnum,
            subDimension: subDimension as AssessmentRegistrySummarySubDimensionTypeEnum,
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
            issuesData: NonNullable<NonNullable<GetSummaryIssueQuery['assessmentRegSummaryIssues']>['results']>[number],
        ): IssueProps => ({
            name,
            data: issuesData,
            subPillar,
            subDimension,
        }),
        [
            subPillar,
            subDimension,
        ],
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

            <Footer
                actions={(
                    <Pager
                        activePage={page}
                        itemsCount={(data?.assessmentRegSummaryIssues?.totalCount) ?? 0}
                        maxItemsPerPage={pageSize}
                        onActivePageChange={setPage}
                        onItemsPerPageChange={setPageSize}
                        itemsPerPageControlHidden
                    />
                )}
            />
        </>
    );
}
export default AddSummaryIssue;
