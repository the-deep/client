import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    PendingMessage,
    TableView,
    Footer,
    TableColumn,
    TableHeaderCellProps,
    TableHeaderCell,
    createStringColumn,
    createNumberColumn,
    Pager,
} from '@the-deep/deep-ui';

import {
    ProjectListQuery,
    ProjectListQueryVariables,
} from '#generated/types';
import FrameworkImageButton, { Props as FrameworkImageButtonProps } from '#components/framework/FrameworkImageButton';
import { convertDateToIsoDateTime } from '#utils/common';
import { createDateColumn } from '#components/tableHelpers';
import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';
import ActionCell, { Props as ActionCellProps } from '../ActionCell';

const PROJECT_LIST = gql`
    query ProjectList(
        $search: String,
        $organizations: [ID!],
        $analysisFrameworks: [ID!],
        $startDate: DateTime,
        $endDate: DateTime,
        $page: Int,
        $pageSize: Int,

    ) {
        projects(
            search: $search,
            organizations: $organizations,
            analysisFrameworks: $analysisFrameworks,
            createdAtLte: $endDate,
            createdAtGte: $startDate,
            page: $page,
            pageSize: $pageSize,
        ) {
            results {
                id
                title
                createdAt
                currentUserRole
                regions {
                    id
                    title
                }
                analysisFramework {
                    id
                    title
                }
                stats {
                    numberOfLeads
                    numberOfUsers
                }
                membershipPending
                organizations {
                    id
                    organization {
                        id
                        title
                        mergedAs {
                            id
                            title
                        }
                    }
                }
            }
            totalCount
        }
    }
`;
export type Project = NonNullable<NonNullable<NonNullable<ProjectListQuery['projects']>['results']>[number]>;

const projectKeySelector = (p: Project) => p.id;

interface Props {
    className?: string;
    filters: ProjectListQueryVariables | undefined;
}

function ExploreDeepTableView(props: Props) {
    const {
        className,
        filters,
    } = props;

    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(25);

    useEffect(() => {
        // NOTE: Bring user back to page 1 if filters have changed
        setPage(1);
    }, [filters]);

    // FIXME: rename startDate to createdAtGte
    // FIXME: rename endDate to createdAtLte
    const variables = useMemo(() => ({
        ...filters,
        startDate: convertDateToIsoDateTime(filters?.startDate),
        endDate: convertDateToIsoDateTime(filters?.endDate, { endOfDay: true }),
        page,
        pageSize,
    }), [page, pageSize, filters]);

    const {
        data,
        loading,
        refetch,
    } = useQuery<ProjectListQuery, ProjectListQueryVariables>(
        PROJECT_LIST,
        {
            variables,
        },
    );

    const columns = useMemo(() => {
        const frameworkColumn: TableColumn<
            Project, string, FrameworkImageButtonProps, TableHeaderCellProps
        > = {
            id: 'framework',
            title: 'Framework',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: FrameworkImageButton,
            cellRendererParams: (_, project) => ({
                frameworkId: project?.analysisFramework?.id,
                label: project?.analysisFramework?.title,
            }),
        };

        const actionsColumn: TableColumn<
            Project, string, ActionCellProps, TableHeaderCellProps
        > = {
            id: 'actions',
            title: '',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: ActionCell,
            cellRendererParams: (projectId, project) => ({
                projectId,
                membershipPending: project?.membershipPending,
                isMember: !!project?.currentUserRole,
                onMemberStatusChange: refetch,
            }),
            columnWidth: 156,
        };

        return ([
            createStringColumn<Project, string>(
                'title',
                'Title',
                (item) => item.title,
            ),
            createStringColumn<Project, string>(
                'location',
                'Location',
                (item) => item?.regions?.map((region) => region.title)?.join(', '),
            ),
            createDateColumn<Project, string>(
                'created_at',
                'Created At',
                (item) => item?.createdAt,
                {
                    columnWidth: 116,
                },
            ),
            frameworkColumn,
            createNumberColumn<Project, string>(
                'members_count',
                'Users',
                (item) => item?.stats?.numberOfUsers,
                {
                    columnWidth: 96,
                },
            ),
            createNumberColumn<Project, string>(
                'sources_count',
                'Sources',
                (item) => item?.stats?.numberOfLeads,
                {
                    columnWidth: 96,
                },
            ),
            createStringColumn<Project, string>(
                'organizations',
                'Organizations',
                (item) => item?.organizations?.map((org) => organizationTitleSelector(org.organization))?.join(', '),
            ),
            actionsColumn,
        ]);
    }, [refetch]);

    return (
        <>
            {loading && (<PendingMessage />)}
            <TableView
                className={className}
                columns={columns}
                keySelector={projectKeySelector}
                data={data?.projects?.results}
            />
            <Footer
                actions={(
                    <Pager
                        activePage={page}
                        itemsCount={(data?.projects?.totalCount) ?? 0}
                        maxItemsPerPage={pageSize}
                        onActivePageChange={setPage}
                        onItemsPerPageChange={setPageSize}
                    />
                )}
            />
        </>
    );
}

export default ExploreDeepTableView;
