import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    Container,
    PendingMessage,
    TableView,
    TableColumn,
    TableHeaderCellProps,
    TableHeaderCell,
    createStringColumn,
    createNumberColumn,
    Pager,
} from '@the-deep/deep-ui';

import { createDateColumn } from '#components/tableHelpers';
import FrameworkImageButton, { Props as FrameworkImageButtonProps } from '#components/framework/FrameworkImageButton';
import {
    ProjectListQuery,
    ProjectListQueryVariables,
} from '#generated/types';

import ActionCell, { Props as ActionCellProps } from './ActionCell';
import ProjectFilterForm from './ProjectFilterForm';

import styles from './styles.css';

const PROJECT_LIST = gql`
    query ProjectList(
        $search: String,
        $organizations: [ID!],
        $analysisFrameworks: [ID!],
        $startDate: Date,
        $endDate: Date,
        $page: Int,
        $pageSize: Int,

    ) {
        projects(
            search: $search,
            organizations: $organizations,
            analysisFrameworks: $analysisFrameworks,
            createdAt_Lt: $endDate,
            createdAt_Gte: $startDate,
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
                    title
                    mergedAs {
                        id
                        title
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
}

function ExploreDeep(props: Props) {
    const {
        className,
    } = props;

    const [filters, setFilters] = useState<ProjectListQueryVariables | undefined>(undefined);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(25);

    const variables = useMemo(() => ({
        ...filters,
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
                (item) => item?.organizations?.map((org) => org.title)?.join(', '),
            ),
            actionsColumn,
        ]);
    }, [refetch]);

    const handleFilterChange = useCallback((value: ProjectListQueryVariables | undefined) => {
        setFilters(value);
        setPage(1);
    }, []);

    return (
        <Container
            className={_cs(styles.exploreDeep, className)}
            heading="Explore DEEP"
            spacing="compact"
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={(data?.projects?.totalCount) ?? 0}
                    maxItemsPerPage={pageSize}
                    onActivePageChange={setPage}
                    onItemsPerPageChange={setPageSize}
                />
            )}
        >
            <ProjectFilterForm
                filters={filters}
                onFiltersChange={handleFilterChange}
            />
            {loading && (<PendingMessage />)}
            <TableView
                columns={columns}
                keySelector={projectKeySelector}
                data={data?.projects?.results}
            />
        </Container>
    );
}

export default ExploreDeep;
