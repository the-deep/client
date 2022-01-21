import React, { useMemo, useState, useContext } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    Container,
    TableView,
    TableColumn,
    TableHeaderCellProps,
    TableHeaderCell,
    Kraken,
    createStringColumn,
    Pager,
} from '@the-deep/deep-ui';

import ProjectContext from '#base/context/ProjectContext';
import { createDateColumn } from '#components/tableHelpers';
import {
    convertDateToIsoDateTime,
    isFiltered,
} from '#utils/common';
import {
    AssessmentListQuery,
    AssessmentListQueryVariables,
} from '#generated/types';
import ActionCell, { Props as ActionCellProps } from './ActionCell';

import AssessmentFilterForm from './AssessmentFilterForm';

import styles from './styles.css';

const ASSESSMENT_LIST = gql`
    query AssessmentList(
        $search: String,
        $startDate: DateTime,
        $endDate: DateTime,
        $page: Int,
        $pageSize: Int,
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            id
            assessments (
                search: $search,
                createdAtLte: $endDate,
                createdAtGte: $startDate,
                page: $page,
                pageSize: $pageSize,
            ) {
                results {
                    id
                    lead {
                        id
                        title
                    }
                    leadGroup {
                        id
                        title
                    }
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

export type Assessment = NonNullable<NonNullable<NonNullable<NonNullable<AssessmentListQuery['project']>['assessments']>['results']>[number]>;
const assessmentKeySelector = (assessment: Assessment) => assessment.id;

interface Props {
    className?: string;
}

function Assessments(props: Props) {
    const {
        className,
    } = props;

    const [filters, setFilters] = useState<Omit<AssessmentListQueryVariables, 'projectId'> | undefined>(undefined);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(25);

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
        previousData,
        data = previousData,
        loading,
        refetch,
    } = useQuery<AssessmentListQuery, AssessmentListQueryVariables>(
        ASSESSMENT_LIST,
        {
            skip: !project,
            variables,
        },
    );

    const canEditEntry = project?.allowedPermissions.includes('UPDATE_ENTRY');

    const columns = useMemo(() => {
        const actionColumn: TableColumn<
            Assessment, string, ActionCellProps, TableHeaderCellProps
        > = {
            id: 'action',
            title: 'Actions',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: ActionCell,
            cellRendererParams: (assessmentId, assessment) => ({
                assessmentId,
                projectId: project?.id,
                leadId: assessment.lead?.id,
                leadGroupId: assessment.leadGroup?.id,
                onDeleteSuccess: refetch,
                disabled: !canEditEntry,
            }),
        };

        return ([
            createStringColumn<Assessment, string>(
                'title',
                'Title',
                (item) => item.lead?.title ?? item.leadGroup?.title,
            ),
            createStringColumn<Assessment, string>(
                'type',
                'Type',
                (item) => (item.lead?.id ? 'Source' : 'Source Group'),
            ),
            createStringColumn<Assessment, string>(
                'created_by',
                'Created By',
                (item) => item.createdBy?.displayName,
            ),
            createDateColumn<Assessment, string>(
                'created_at',
                'Created At',
                (item) => item.createdAt,
                {
                    columnWidth: 116,
                },
            ),
            actionColumn,
        ]);
    }, [canEditEntry, refetch, project?.id]);

    return (
        <Container
            className={_cs(styles.assessments, className)}
            heading="All Assessment Sources"
            headerClassName={styles.header}
            contentClassName={styles.content}
            footerClassName={styles.footer}
            headerDescription={(
                <AssessmentFilterForm
                    filters={filters}
                    onFiltersChange={setFilters}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={(data?.project?.assessments?.totalCount) ?? 0}
                    maxItemsPerPage={pageSize}
                    onActivePageChange={setPage}
                    onItemsPerPageChange={setPageSize}
                />
            )}
        >
            <TableView
                className={styles.table}
                columns={columns}
                keySelector={assessmentKeySelector}
                data={data?.project?.assessments?.results}
                pending={loading}
                filtered={isFiltered(filters)}
                errored={false}
                filteredEmptyMessage="No matching assessments found."
                filteredEmptyIcon={(
                    <Kraken
                        variant="coffee"
                        size="large"
                    />
                )}
                rowClassName={styles.tableRow}
                emptyMessage="No assessments found."
                emptyIcon={(
                    <Kraken
                        size="large"
                        variant="coffee"
                    />
                )}
                messageShown
                messageIconShown
            />
        </Container>
    );
}

export default Assessments;
