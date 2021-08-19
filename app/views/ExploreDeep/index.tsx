import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    TableView,
    TableColumn,
    TableHeaderCellProps,
    TableHeaderCell,
    createStringColumn,
    createNumberColumn,
} from '@the-deep/deep-ui';

import PageContent from '#components/PageContent';
import { createDateColumn } from '#components/tableHelpers';
import FrameworkImageButton, { Props as FrameworkImageButtonProps } from '#components/FrameworkImageButton';
import {
    ProjectListQuery,
    ProjectListQueryVariables,
} from '#generated/types';

import ActionCell, { Props as ActionCellProps } from './ActionCell';

import styles from './styles.css';

const PROJECT_LIST = gql`
    query ProjectList(
        $search: String,
    ) {
        projects(
            search: $search,
        ) {
            results {
                id
                title
                analysisFramework {
                    id
                    title
                }
                stats {
                    numberOfLeads
                    numberOfUsers
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

    const variables = useMemo(() => ({
        search: '',
    }), []);

    const {
        data,
        loading,
    } = useQuery<ProjectListQuery, ProjectListQueryVariables>(
        PROJECT_LIST,
        {
            variables,
        },
    );

    const columns = useMemo(() => {
        const frameworkColumn: TableColumn<
            Project, number, FrameworkImageButtonProps, TableHeaderCellProps
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
            cellRendererParams: (projectId) => ({
                projectId,
                memberStatus: 'pending',
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
                (item) => item?.regions?.map((region) => region.title)?.join(', '),
            ),
            createDateColumn<Project, string>(
                'created_at',
                'Created At',
                (item) => item?.createdAt,
            ),
            frameworkColumn,
            createNumberColumn<Project, string>(
                'members_count',
                'Users',
                (item) => item?.stats?.numberOfUsers,
            ),
            createNumberColumn<Project, string>(
                'sources_count',
                'Sources',
                (item) => item?.stats?.numberOfLeads,
            ),
            createStringColumn<Project, string>(
                'organizations',
                'Organizations',
                (item) => item?.organizations?.map((org) => org.title)?.join(', '),
            ),
            actionsColumn,
        ]);
    }, []);

    console.warn('here', loading, data);

    return (
        <PageContent className={_cs(styles.exploreDeep, className)}>
            <TableView
                columns={columns}
                keySelector={projectKeySelector}
                data={data?.projects?.results}
            />
        </PageContent>
    );
}

export default ExploreDeep;
