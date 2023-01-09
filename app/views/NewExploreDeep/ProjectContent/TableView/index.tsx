import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { _cs } from '@togglecorp/fujs';
import {
    TableView,
    Footer,
    TableColumn,
    TableHeaderCellProps,
    TableHeaderCell,
    createStringColumn,
    createNumberColumn,
    Pager,
    useSortState,
    SortContext,
} from '@the-deep/deep-ui';

import FrameworkImageButton, { Props as FrameworkImageButtonProps } from '#components/framework/FrameworkImageButton';
import {
    convertDateToIsoDateTime,
    isFiltered,
} from '#utils/common';
import { createDateColumn } from '#components/tableHelpers';
import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';
import {
    ProjectListQuery,
    ProjectListQueryVariables,
    ProjectOrderingEnum,
} from '#generated/types';
import { ORGANIZATION_FRAGMENT } from '#gqlFragments';

import ActionCell, { Props as ActionCellProps } from '../ActionCell';
import styles from './styles.css';

const PROJECT_LIST = gql`
    ${ORGANIZATION_FRAGMENT}
    query ProjectList(
        $search: String,
        $organizations: [ID!],
        $analysisFrameworks: [ID!],
        $startDate: DateTime,
        $endDate: DateTime,
        $page: Int,
        $pageSize: Int,
        $ordering: [ProjectOrderingEnum!],
        $regions: [ID!],
    ) {
        projects(
            search: $search,
            organizations: $organizations,
            analysisFrameworks: $analysisFrameworks,
            createdAtLte: $endDate,
            createdAtGte: $startDate,
            page: $page,
            pageSize: $pageSize,
            ordering: $ordering,
            regions: $regions,
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
                isRejected
                membershipPending
                organizations {
                    id
                    organization {
                        ...OrganizationGeneralResponse
                    }
                }
            }
            totalCount
        }
    }
`;
export type Project = NonNullable<NonNullable<NonNullable<ProjectListQuery['projects']>['results']>[number]>;

const defaultSorting = {
    name: 'CREATED_AT',
    direction: 'Descending',
};

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
        // FIXME: Change this after filter is changed
        // NOTE: Bring user back to page 1 if filters have changed
        setPage(1);
    }, [filters]);

    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;

    const ordering = useMemo(() => (
        validSorting.direction === 'Ascending'
            ? `ASC_${validSorting.name}`
            : `DESC_${validSorting.name}`
    ), [validSorting]);

    // FIXME: rename startDate to createdAtGte
    // FIXME: rename endDate to createdAtLte
    const variables = useMemo(() => ({
        ...filters,
        startDate: convertDateToIsoDateTime(filters?.startDate),
        endDate: convertDateToIsoDateTime(filters?.endDate, { endOfDay: true }),
        page,
        pageSize,
        ordering: [ordering as ProjectOrderingEnum],
    }), [
        page,
        pageSize,
        filters,
        ordering,
    ]);

    const {
        previousData,
        data = previousData,
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
            id: 'ANALYSIS_FRAMEWORK',
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
                isRejected: project?.isRejected,
                membershipPending: project?.membershipPending,
                isMember: !!project?.currentUserRole,
                onMemberStatusChange: refetch,
            }),
            columnWidth: 156,
        };

        return ([
            createStringColumn<Project, string>(
                'TITLE',
                'Title',
                (item) => item.title,
                {
                    sortable: true,
                },
            ),
            createStringColumn<Project, string>(
                'location',
                'Location',
                (item) => item?.regions?.map((region) => region.title)?.join(', '),
            ),
            createDateColumn<Project, string>(
                'CREATED_AT',
                'Created At',
                (item) => item?.createdAt,
                {
                    columnWidth: 116,
                    sortable: true,
                },
            ),
            frameworkColumn,
            createNumberColumn<Project, string>(
                'USER_COUNT',
                'Users',
                (item) => item?.stats?.numberOfUsers,
                {
                    columnWidth: 96,
                    sortable: true,
                },
            ),
            createNumberColumn<Project, string>(
                'LEAD_COUNT',
                'Sources',
                (item) => item?.stats?.numberOfLeads,
                {
                    columnWidth: 96,
                    sortable: true,
                },
            ),
            createStringColumn<Project, string>(
                'organizations',
                'Organizations',
                (item) => item?.organizations
                    ?.map((org) => organizationTitleSelector(org.organization))?.join(', '),
            ),
            actionsColumn,
        ]);
    }, [refetch]);

    return (
        <>
            <SortContext.Provider value={sortState}>
                <TableView
                    className={_cs(className, styles.table)}
                    columns={columns}
                    keySelector={projectKeySelector}
                    data={data?.projects?.results}
                    pending={loading}
                    filtered={isFiltered(filters)}
                    errored={false}
                    messageShown
                    messageIconShown
                    emptyMessage="No projects to show."
                />
            </SortContext.Provider>
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
