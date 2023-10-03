import React, {
    useCallback,
    useMemo, useState,
} from 'react';

import {
    ControlledExpandableContainer,
    Footer,
    ListView,
    Pager,
    QuickActionButton,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';
import { IoAddOutline } from 'react-icons/io5';

import {
    AssessmentRegistrySummarySubDimensionTypeEnum,
    AssessmentRegistrySummarySubPillarTypeEnum,
    GetSummarySubIssuesQuery,
    GetSummarySubIssuesQueryVariables,
    SummaryIssueSearchQuery,
} from '#generated/types';

import AddSummaryIssueModal from '../AddSummaryIssueModal';

import styles from './styles.css';

const GET_SUMMARY_SUB_ISSUES = gql`
    query GetSummarySubIssues (
        $subPillar: AssessmentRegistrySummarySubPillarTypeEnum,
        $subDimension: AssessmentRegistrySummarySubDimensionTypeEnum,
        $search: String,
        $parent: ID,
        $page: Int,
        $pageSize: Int,
    ) {
        assessmentRegSummaryIssues(
            subPillar: $subPillar,
            subDimension: $subDimension,
            search: $search,
            parent: $parent,
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
export interface Props {
    name: string;
    data: NonNullable<NonNullable<SummaryIssueSearchQuery['assessmentRegSummaryIssues']>['results']>[number];
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum;
    subDimension?: AssessmentRegistrySummarySubDimensionTypeEnum;
}

const keySelector = (d: NonNullable<NonNullable<GetSummarySubIssuesQuery['assessmentRegSummaryIssues']>['results']>[number]) => d.id;

function IssueItem(props: Props) {
    const {
        name,
        data,
        subPillar,
        subDimension,
    } = props;

    const [selected, setSelected] = useState<string | undefined>();
    const [addIssue, setAddIssue] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);

    const variables = useMemo(
        (): GetSummarySubIssuesQueryVariables => ({
            subPillar: subPillar as AssessmentRegistrySummarySubPillarTypeEnum,
            subDimension: subDimension as AssessmentRegistrySummarySubDimensionTypeEnum,
            parent: selected,
            page,
            pageSize,
        }), [
            subPillar,
            subDimension,
            selected,
            page,
            pageSize,
        ],
    );

    const {
        loading,
        data: issuesResponse,
        refetch,
    } = useQuery<GetSummarySubIssuesQuery, GetSummarySubIssuesQueryVariables>(
        GET_SUMMARY_SUB_ISSUES,
        {
            skip: isNotDefined(selected),
            variables,
        },
    );

    const handleAddNewIssue = useCallback(
        (issueKey: string) => {
            setAddIssue(true);
            setSelected(issueKey);
        }, [],
    );

    const handleOnExpansionChange = useCallback(
        (_: boolean, issueKey: string) => {
            setSelected((oldValue) => (oldValue === issueKey ? undefined : issueKey));
        }, [],
    );

    const issueParams = useCallback(
        (
            issueKey: string,
            issuesData: NonNullable<NonNullable<GetSummarySubIssuesQuery['assessmentRegSummaryIssues']>['results']>[number],
        ) => ({
            name: issueKey,
            data: issuesData,
            subPillar,
            subDimension,
        }),
        [
            subPillar,
            subDimension,
        ],
    );

    const handleModalClose = useCallback(() => setAddIssue(false), []);

    const response = removeNull(issuesResponse?.assessmentRegSummaryIssues);

    return (
        <ControlledExpandableContainer
            className={styles.issueItem}
            contentClassName={styles.content}
            headerClassName={styles.header}
            headingContainerClassName={styles.headingContainer}
            headerActionsContainerClassName={styles.headerActions}
            headingClassName={styles.heading}
            heading={data.label}
            headingSize="extraSmall"
            headerActions={(
                <QuickActionButton
                    name={name}
                    onClick={handleAddNewIssue}
                    disabled={loading}
                >
                    <IoAddOutline />
                </QuickActionButton>
            )}
            expansionTriggerArea="arrow"
            name={data.id}
            expanded={!!selected}
            onExpansionChange={handleOnExpansionChange}
            withoutBorder
        >
            <ListView
                className={styles.subIssue}
                data={response?.results}
                keySelector={keySelector}
                renderer={IssueItem}
                rendererParams={issueParams}
                errored={false}
                filtered={false}
                pending={false}
                messageShown
                emptyIcon
                emptyMessage="No issue found!"
            />
            {addIssue && (
                <AddSummaryIssueModal
                    type="pillar"
                    subPillar={data.subPillar}
                    parentId={selected}
                    onClose={handleModalClose}
                    refetch={refetch}
                />
            )}
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
        </ControlledExpandableContainer>
    );
}
export default IssueItem;
