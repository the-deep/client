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
} from '@the-deep/deep-ui';

import {
    PublicProjectListQuery,
    PublicProjectListQueryVariables,
} from '#generated/types';
import FrameworkImageButton, { Props as FrameworkImageButtonProps } from '#components/framework/FrameworkImageButton';
import {
    convertDateToIsoDateTime,
    isFiltered,
} from '#utils/common';
import { createDateColumn } from '#components/tableHelpers';

import styles from './styles.css';

const PROJECT_LIST = gql`
    query PublicProjectList(
        $search: String,
        $organizations: [ID!],
        $analysisFrameworks: [ID!],
        $startDate: DateTime,
        $endDate: DateTime,
        $page: Int,
        $pageSize: Int,

    ) {
        publicProjects(
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
                regionsTitle
                analysisFrameworkTitle
                analysisFrameworkPreviewImage
                numberOfLeads
                numberOfUsers
                organizationsTitle
            }
            totalCount
        }
    }
`;
export type Project = NonNullable<NonNullable<NonNullable<PublicProjectListQuery['publicProjects']>['results']>[number]>;

const projectKeySelector = (p: Project) => p.id;

interface Props {
    className?: string;
    filters: PublicProjectListQueryVariables | undefined;
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
        previousData,
        data = previousData,
        loading,
    } = useQuery<PublicProjectListQuery, PublicProjectListQueryVariables>(
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
                label: project?.analysisFrameworkTitle ?? undefined,
                image: project?.analysisFrameworkPreviewImage ?? undefined,
            }),
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
                (item) => item?.regionsTitle,
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
                (item) => item?.numberOfUsers,
                {
                    columnWidth: 96,
                },
            ),
            createNumberColumn<Project, string>(
                'sources_count',
                'Sources',
                (item) => item?.numberOfLeads,
                {
                    columnWidth: 96,
                },
            ),
            createStringColumn<Project, string>(
                'organizations',
                'Organizations',
                (item) => item?.organizationsTitle,
            ),
        ]);
    }, []);

    return (
        <>
            <TableView
                className={_cs(className, styles.table)}
                columns={columns}
                keySelector={projectKeySelector}
                data={data?.publicProjects?.results}
                filtered={isFiltered(filters)}
                pending={loading}
                messageShown
                messageIconShown
                emptyMessage="No projects to show."
            />
            <Footer
                actions={(
                    <Pager
                        activePage={page}
                        itemsCount={(data?.publicProjects?.totalCount) ?? 0}
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
