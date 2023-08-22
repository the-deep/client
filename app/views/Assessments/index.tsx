import React,
{
    useMemo,
    useState,
    useContext,
} from 'react';
import {
    useQuery,
    gql,
} from '@apollo/client';
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
import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';
import ActionCell,
{
    Props as ActionCellProps,
} from './ActionCell';

import AssessmentFilterForm from './AssessmentFilterForm';

import styles from './styles.css';

const ASSESSMENT_LIST = gql`
    query AssessmentList(
        $search: String,
        $createdAtGte: DateTime,
        $createdAtLte: DateTime,
        $page: Int,
        $pageSize: Int,
        $projectId: ID!,
        $publicationDateLte: Date,
        $publicationDateGte: Date,
        $createdBy: [ID],
    ) {
        project(id: $projectId) {
            id
            assessmentRegistries (
                search: $search,
                createdAtLte: $createdAtLte,
                createdAtGte: $createdAtGte,
                page: $page,
                pageSize: $pageSize,
                publicationDateLte: $publicationDateLte,
                publicationDateGte: $publicationDateGte,
                createdBy: $createdBy,
            ) {
                totalCount
                results {
                    id
                    clientId
                    publicationDate
                    detailsTypeDisplay
                    createdAt
                    createdBy {
                        displayName
                    }
                    lead {
                        title
                        id
                        authors {
                            title
                            id
                        }
                    }
                }
            }
        }
    }
`;

export type Assessment = NonNullable<NonNullable<NonNullable<NonNullable<AssessmentListQuery['project']>['assessmentRegistries']>['results']>[number]>;
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

    const variables = useMemo(
        () => (
            project ? ({
                ...filters,
                createdAtLte: convertDateToIsoDateTime(filters?.createdAtLte),
                createdAtGte: convertDateToIsoDateTime(filters?.createdAtGte, { endOfDay: true }),
                publicationDateLte: filters?.publicationDateLte,
                publicationDateGte: filters?.publicationDateGte,
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
            cellRendererParams: (assessmentId) => ({
                assessmentId,
                projectId: project?.id,
                onDeleteSuccess: refetch,
                disabled: !canEditEntry,
            }),
        };

        return ([
            createStringColumn<Assessment, string>(
                'title',
                'Title',
                (item) => item.lead.title,
            ),
            createStringColumn<Assessment, string>(
                'author',
                'Author',
                (item) => item.lead.authors?.map(organizationTitleSelector).join(', '),
                {
                    sortable: false,
                },
            ),
            createDateColumn<Assessment, string>(
                'publication_date',
                'Publication date',
                (item) => item?.publicationDate ?? '',
            ),
            createDateColumn<Assessment, string>(
                'created_at',
                'Creation date',
                (item) => item?.createdAt,
            ),
            createStringColumn<Assessment, string>(
                'created_by',
                'Created By',
                (item) => item?.createdBy?.displayName,
            ),
            createStringColumn<Assessment, string>(
                'assessment_type',
                'Assessment type',
                (item) => item?.detailsTypeDisplay,
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
                    projectId={project?.id}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={(data?.project?.assessmentRegistries?.totalCount) ?? 0}
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
                data={data?.project?.assessmentRegistries?.results}
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
