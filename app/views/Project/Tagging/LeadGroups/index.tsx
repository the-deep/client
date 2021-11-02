import React, { useMemo, useState, useContext } from 'react';
import { useQuery, gql } from '@apollo/client';
import { _cs } from '@togglecorp/fujs';
import {
    PendingMessage,
    Container,
    TableView,
    TableColumn,
    TableHeaderCellProps,
    TableHeaderCell,
    createStringColumn,
    Pager,
} from '@the-deep/deep-ui';

import ProjectContext from '#base/context/ProjectContext';
import { createDateColumn } from '#components/tableHelpers';
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

    const { project } = useContext(ProjectContext);
    const variables = useMemo(
        () => (
            project ? ({
                ...filters,
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

    const canEditEntry = project?.allowedPermissions.includes('UPDATE_ENTRY');

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
                disabled: !canEditEntry,
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
    }, [canEditEntry, refetch, project?.id]);

    return (
        <Container
            className={_cs(styles.analysis, className)}
            heading="Lead Groups"
            headerClassName={styles.header}
            contentClassName={styles.content}
            footerClassName={styles.footer}
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
        </Container>
    );
}

export default LeadGroups;
