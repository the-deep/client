import React, { useCallback, useMemo, useState, useContext } from 'react';
import { useQuery, gql } from '@apollo/client';
import { _cs } from '@togglecorp/fujs';
import {
    PendingMessage,
    Button,
    Container,
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
import { convertDateToIsoDateTime } from '#utils/common';
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
        $startDate: Date,
        $endDate: Date,
        $page: Int,
        $pageSize: Int,
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            leadGroups (
                search: $search,
                createdAt_Lt: $endDate,
                createdAt_Gte: $startDate,
                page: $page,
                pageSize: $pageSize,
            ) {
                results {
                    id
                    title
                    createdAt
                    leadsCount
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
    const variables = useMemo(
        () => (
            project ? ({
                ...filters,
                startDate: convertDateToIsoDateTime(filters?.startDate),
                endDate: convertDateToIsoDateTime(filters?.endDate),
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
                'leadsCount',
                'No. of Leads',
                (item) => item?.leadsCount,
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
    }, [canEditLead, refetch, project?.id]);

    const handleLeadGroupAddSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <Container
            className={_cs(styles.analysis, className)}
            heading="Lead Groups"
            headerClassName={styles.header}
            contentClassName={styles.content}
            footerClassName={styles.footer}
            headerActions={canEditLead && (
                <Button
                    name={undefined}
                    onClick={showAddLeadGroupModal}
                >
                    Add Lead Group
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
            {loading && (<PendingMessage />)}
            <TableView
                className={styles.table}
                columns={columns}
                keySelector={leadGroupKeySelector}
                data={data?.project?.leadGroups?.results}
            />
            {addLeadGroupModalShown && (
                <AddLeadGroupModal
                    onModalClose={hideAddLeadGroupModal}
                    onLeadGroupAdd={handleLeadGroupAddSuccess}
                />
            )}
        </Container>
    );
}

export default LeadGroups;
