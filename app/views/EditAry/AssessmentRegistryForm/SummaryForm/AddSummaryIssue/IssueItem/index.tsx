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
    TextOutput,
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

export interface Props {
    name: string;
    data: NonNullable<NonNullable<GetSummaryIssueQuery['assessmentRegSummaryIssues']>['results']>[number];
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

    const response = removeNull(issuesResponse?.assessmentRegSummaryIssues);

    const handleAddNewIssue = useCallback(
        (issueKey: string) => {
            setAddIssue(true);
            setSelected(issueKey);
        }, [],
    );

    const handleOnExpansionChange = useCallback(
        (val: boolean, issueKey: string) => {
            if (val) {
                setSelected((oldValue) => (oldValue === issueKey ? undefined : issueKey));
            }

            if (!val) {
                setSelected(undefined);
            }
        },
        [],
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

    return (
        <ControlledExpandableContainer
            className={_cs(
                styles.issueItem,
                data.level === 1 && styles.issueItemBorder,
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
                    <TextOutput label="sub issues" value={data.childCount} />
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
