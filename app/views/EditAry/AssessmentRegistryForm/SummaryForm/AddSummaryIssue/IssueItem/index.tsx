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
    useBooleanState,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';
import { IoAddOutline } from 'react-icons/io5';

import {
    AssessmentRegistrySummarySubDimensionTypeEnum,
    AssessmentRegistrySummarySubPillarTypeEnum,
    GetSummaryIssueQuery,
    GetSummarySubIssuesQuery,
    GetSummarySubIssuesQueryVariables,
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
export interface Props {
    name: string;
    data: SummaryIssueType;
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum;
    subDimension?: AssessmentRegistrySummarySubDimensionTypeEnum;
    type: 'pillar' | 'dimension';
}

const keySelector = (d: SummaryIssueType) => d.id;

function IssueItem(props: Props) {
    const {
        name,
        data,
        subPillar,
        subDimension,
        type,
    } = props;

    const [
        showAddIssue,
        setShowAddIssueTrue,
        setShowAddIssueFalse,
    ] = useBooleanState(false);

    const [selected, setSelected] = useState<string | undefined>();
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);

    const variables = useMemo(
        (): GetSummarySubIssuesQueryVariables => ({
            subPillar,
            subDimension,
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

    const response = useMemo(
        () => removeNull(issuesResponse?.assessmentRegSummaryIssues),
        [issuesResponse?.assessmentRegSummaryIssues],
    );

    const handleAddNewIssue = useCallback(
        (issueKey: string) => {
            setShowAddIssueTrue();
            setSelected(issueKey);
        }, [setShowAddIssueTrue],
    );

    const handleOnExpansionChange = useCallback(
        (_: boolean, issueKey: string) => {
            setSelected((oldValue) => (oldValue === issueKey ? undefined : issueKey));
        },
        [],
    );

    const issueParams = useCallback(
        (
            issueKey: string,
            issuesData: SummaryIssueType,
        ) => ({
            name: issueKey,
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

    return (
        <ControlledExpandableContainer
            className={_cs(
                styles.issueItem,
                data.level === 1 && styles.issueItemBorder,
                data.level === 3 && styles.issueContentSeparator,
            )}
            contentClassName={styles.content}
            headerClassName={styles.header}
            headingContainerClassName={styles.headingContainer}
            footerClassName={_cs(data.level === 3 && styles.footer)}
            headerActionsContainerClassName={styles.headerActions}
            headingSectionClassName={styles.headingSection}
            headingClassName={_cs(
                data.level === 1 && styles.headingOne,
                data.level === 2 && styles.headingTwo,
                data.level === 3 && styles.headingThree,
            )}
            headerActions={(
                <>
                    <p className={styles.childHeading}>
                        {`(${data.childCount} sub issues)`}
                    </p>
                    <QuickActionButton
                        name={name}
                        onClick={handleAddNewIssue}
                        disabled={loading || data.level === 3}
                    >
                        <IoAddOutline />
                    </QuickActionButton>
                </>
            )}
            heading={data.label}
            headerIcons={data.level === 3 && <div className={styles.dot} />}
            name={data.id}
            expanded={selected === data.id}
            onExpansionChange={handleOnExpansionChange}
            expansionTriggerArea="arrow"
            withoutBorder
            spacing="compact"
            disabled={data.level === 3 || data.childCount === 0}
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
            {showAddIssue && (
                <AddSummaryIssueModal
                    type={type}
                    subPillar={data.subPillar}
                    subDimension={data.subDimension}
                    parentId={selected}
                    onClose={setShowAddIssueFalse}
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
