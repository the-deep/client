import React, {
    useCallback,
    useMemo, useState,
} from 'react';

import {
    ControlledExpandableContainer,
    ListView,
    QuickActionButton,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';
import { isNotDefined } from '@togglecorp/fujs';
import { IoAddOutline } from 'react-icons/io5';

import {
    AssessmentRegistrySummarySubDimensionTypeEnum,
    AssessmentRegistrySummarySubPillarTypeEnum,
    GetSummarySubIssuesQuery,
    GetSummarySubIssuesQueryVariables,
    SummaryIssueSearchQuery,
} from '#generated/types';

import AddIssueModal from '../AddIssueModal';

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

    const variables = useMemo(
        (): GetSummarySubIssuesQueryVariables => ({
            subPillar: subPillar as AssessmentRegistrySummarySubPillarTypeEnum,
            subDimension: subDimension as AssessmentRegistrySummarySubDimensionTypeEnum,
            parent: selected,
            page: 1,
            pageSize: 10,
        }), [
            subPillar,
            subDimension,
            selected,
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
        (n: string) => {
            setAddIssue(true);
            setSelected(n);
        }, [],
    );

    const headerActions = useMemo(() => (
        <div className={styles.actions}>
            {/* TODO:
                <QuickActionButton
                name={name}
                onClick={handleEditIssue}
                disabled={loading}
            >
                <IoPencilOutline />
            </QuickActionButton> */}
            <QuickActionButton
                name={name}
                onClick={handleAddNewIssue}
                disabled={loading}
            >
                <IoAddOutline />
            </QuickActionButton>
        </div>
    ), [
        name,
        loading,
        handleAddNewIssue,
    ]);

    const handleOnExpansionChange = useCallback(
        (_: boolean, n: string) => {
            setSelected((oldValue) => (oldValue === n ? undefined : n));
        }, [],
    );

    const issueParams = useCallback(
        (
            n: string,
            issuesData: NonNullable<NonNullable<GetSummarySubIssuesQuery['assessmentRegSummaryIssues']>['results']>[number],
        ) => ({
            name: n,
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
        <ControlledExpandableContainer
            className={styles.issueItem}
            headerClassName={styles.header}
            headingContainerClassName={styles.headingContainer}
            headerActionsContainerClassName={styles.headerActions}
            headingClassName={styles.heading}
            heading={data.label}
            headingSize="extraSmall"
            headerActions={headerActions}
            expansionTriggerArea="arrow"
            name={data.id}
            expanded={!!selected}
            onExpansionChange={handleOnExpansionChange}
            withoutBorder
        >
            <ListView
                className={styles.subIssue}
                data={issuesResponse?.assessmentRegSummaryIssues?.results}
                keySelector={keySelector}
                renderer={IssueItem}
                rendererParams={issueParams}
                errored={false}
                filtered={false}
                pending={false}
                messageShown
                emptyIcon
            />
            {addIssue && (
                <AddIssueModal
                    type="pillar"
                    subPillar={data.subPillar}
                    parentId={selected}
                    onClose={() => setAddIssue(false)}
                    refetch={refetch}
                />
            )}
        </ControlledExpandableContainer>
    );
}
export default IssueItem;
