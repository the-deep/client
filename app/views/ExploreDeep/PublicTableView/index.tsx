import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { _cs } from '@togglecorp/fujs';
import {
    TableView,
    Footer,
    createStringColumn,
    createNumberColumn,
    Pager,
    useSortState,
    SortContext,
} from '@the-deep/deep-ui';

import {
    PublicProjectListQuery,
    PublicProjectListQueryVariables,
} from '#generated/types';
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
        $ordering: String,
        $regions: [ID!],
    ) {
        publicProjects(
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

const defaultSorting = {
    name: 'title',
    direction: 'Ascending',
};

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

    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = useMemo(() => (
        validSorting.direction === 'Ascending'
            ? validSorting.name
            : `-${validSorting.name}`
    ), [validSorting]);

    // FIXME: rename startDate to createdAtGte
    // FIXME: rename endDate to createdAtLte
    const variables = useMemo(() => ({
        ...filters,
        startDate: convertDateToIsoDateTime(filters?.startDate),
        endDate: convertDateToIsoDateTime(filters?.endDate, { endOfDay: true }),
        page,
        pageSize,
        ordering,
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
    } = useQuery<PublicProjectListQuery, PublicProjectListQueryVariables>(
        PROJECT_LIST,
        {
            variables,
        },
    );

    const columns = useMemo(() => ([
        createStringColumn<Project, string>(
            'title',
            'Title',
            (item) => item.title,
            {
                sortable: true,
            },
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
                sortable: true,
            },
        ),
        createStringColumn<Project, string>(
            'framework',
            'Analytical Framework',
            (item) => item?.analysisFrameworkTitle,
            {
                sortable: true,
            },
        ),
        createNumberColumn<Project, string>(
            'number_of_users',
            'Users',
            (item) => item?.numberOfUsers,
            {
                columnWidth: 96,
                sortable: true,
            },
        ),
        createNumberColumn<Project, string>(
            'sources_count',
            'Sources',
            (item) => item?.numberOfLeads,
            {
                columnWidth: 96,
                // sortable: true,
                // TODO: to be uncommented after fixed in the server
            },
        ),
        createStringColumn<Project, string>(
            'organizations',
            'Organizations',
            (item) => item?.organizationsTitle,
            {
                sortable: true,
            },
        ),
    ]), []);

    return (
        <>
            <SortContext.Provider value={sortState}>
                <TableView
                    className={_cs(className, styles.table)}
                    columns={columns}
                    keySelector={projectKeySelector}
                    data={data?.publicProjects?.results}
                    filtered={isFiltered(filters)}
                    pending={loading}
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
