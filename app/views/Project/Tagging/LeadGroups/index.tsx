import React, { useCallback, useMemo, useState, useContext } from 'react';
import { useQuery, gql } from '@apollo/client';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    Container,
    Kraken,
    TableView,
    TableColumn,
    TableHeaderCellProps,
    TableHeaderCell,
    createStringColumn,
    createNumberColumn,
    Pager,
} from '@the-deep/deep-ui';

import ProjectContext from '#base/context/ProjectContext';
import { createDateColumn } from '#components/tableHelpers';
import { useModalState } from '#hooks/stateManagement';
import {
    convertDateToIsoDateTime,
    isFiltered,
} from '#utils/common';
import AddLeadGroupModal from '#components/general/AddLeadGroupModal';
import {
    LeadGroupListQuery,
    LeadGroupListQueryVariables,
} from '#generated/types';
import ActionCell, { Props as ActionCellProps } from './ActionCell';

import LeadGroupFilterForm from './LeadGroupFilterForm';

import styles from './styles.css';

const ASSESSMENT_LIST = gql`
    query LeadGroupList(
        $search: String,
        $startDate: DateTime,
        $endDate: DateTime,
        $page: Int,
        $pageSize: Int,
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            id
            leadGroups (
                search: $search,
                createdAtLte: $endDate,
                createdAtGte: $startDate,
                page: $page,
                pageSize: $pageSize,
            ) {
                results {
                    id
                    title
                    createdAt
                    leadCounts
                    createdBy {
                        displayName
                    }
                }
                totalCount
            }
        }
    }
`;

export type LeadGroup = NonNullable<NonNullable<NonNullable<NonNullable<LeadGroupListQuery['project']>['leadGroups']>['results']>[number]>;
const leadGroupKeySelector = (leadGroup: LeadGroup) => leadGroup.id;

interface Props {
    className?: string;
}

function LeadGroups(props: Props) {
    const {
        className,
    } = props;

    const [filters, setFilters] = useState<Omit<LeadGroupListQueryVariables, 'projectId'> | undefined>(undefined);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(25);
    const [
        addLeadGroupModalShown,
        showAddLeadGroupModal,
        hideAddLeadGroupModal,
    ] = useModalState(false);

    const { project } = useContext(ProjectContext);
    // FIXME: rename startDate to createdAtGte
    // FIXME: rename endDate to createdAtLte
    const variables = useMemo(
        () => (
            project ? ({
                ...filters,
                startDate: convertDateToIsoDateTime(filters?.startDate),
                endDate: convertDateToIsoDateTime(filters?.endDate, { endOfDay: true }),
                page,
                pageSize,
                projectId: project.id,
            }) : undefined
        ),
        [filters, project, pageSize, page],
    );

    const {
        data,
        loading,
        refetch,
    } = useQuery<LeadGroupListQuery, LeadGroupListQueryVariables>(
        ASSESSMENT_LIST,
        {
            skip: !project,
            variables,
        },
    );

    const canEditLead = project?.allowedPermissions.includes('UPDATE_LEAD');

    const [leadGroupToEdit, setLeadGroupToEdit] = useState<string | undefined>(undefined);

    const handleLeadGroupEditClick = useCallback((leadGroupId: string | undefined) => {
        setLeadGroupToEdit(leadGroupId);
        showAddLeadGroupModal();
    }, [showAddLeadGroupModal]);

    const columns = useMemo(() => {
        const actionColumn: TableColumn<
            LeadGroup, string, ActionCellProps, TableHeaderCellProps
        > = {
            id: 'action',
            title: 'Actions',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: ActionCell,
            cellRendererParams: (leadGroupId) => ({
                leadGroupId,
                onLeadGroupEditClick: handleLeadGroupEditClick,
                projectId: project?.id,
                onDeleteSuccess: refetch,
                disabled: !canEditLead,
            }),
        };

        return ([
            createStringColumn<LeadGroup, string>(
                'title',
                'Title',
                (item) => item?.title,
            ),
            createStringColumn<LeadGroup, string>(
                'created_by',
                'Created By',
                (item) => item?.createdBy?.displayName,
            ),
            createNumberColumn<LeadGroup, string>(
                'leadCounts',
                'No. of Sources',
                (item) => item?.leadCounts,
            ),
            createDateColumn<LeadGroup, string>(
                'created_at',
                'Created At',
                (item) => item?.createdAt,
                {
                    columnWidth: 116,
                },
            ),
            actionColumn,
        ]);
    }, [
        canEditLead,
        refetch,
        project?.id,
        handleLeadGroupEditClick,
    ]);

    const handleLeadGroupAddSuccess = useCallback(() => {
        refetch();
        setLeadGroupToEdit(undefined);
    }, [refetch]);

    return (
        <Container
            className={_cs(styles.sourceGroups, className)}
            heading="Source Groups"
            headerClassName={styles.header}
            contentClassName={styles.content}
            footerClassName={styles.footer}
            headerActions={canEditLead && (
                <Button
                    name={undefined}
                    onClick={handleLeadGroupEditClick}
                >
                    Add Source Group
                </Button>
            )}
            headerDescription={(
                <LeadGroupFilterForm
                    filters={filters}
                    onFiltersChange={setFilters}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={(data?.project?.leadGroups?.totalCount) ?? 0}
                    maxItemsPerPage={pageSize}
                    onActivePageChange={setPage}
                    onItemsPerPageChange={setPageSize}
                />
            )}
        >
            <TableView
                className={styles.table}
                columns={columns}
                keySelector={leadGroupKeySelector}
                data={data?.project?.leadGroups?.results}
                filtered={isFiltered(filters)}
                filteredEmptyMessage="No matching source groups found."
                filteredEmptyIcon={(
                    <Kraken
                        size="large"
                        variant="hi"
                    />
                )}
                pending={loading}
                emptyMessage="No source groups found."
                rowClassName={styles.tableRow}
                emptyIcon={(
                    <Kraken
                        size="large"
                        variant="hi"
                    />
                )}
                messageIconShown
                messageShown
            />
            {addLeadGroupModalShown && (
                <AddLeadGroupModal
                    onModalClose={hideAddLeadGroupModal}
                    leadGroupToEdit={leadGroupToEdit}
                    onLeadGroupAdd={handleLeadGroupAddSuccess}
                />
            )}
        </Container>
    );
}

export default LeadGroups;
