import React, { ReactNode, useMemo, useState, useCallback } from 'react';
import {
    _cs,
    listToMap,
    unique,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    Checkbox,
    CheckboxProps,
    Container,
    DateOutput,
    DateOutputProps,
    Kraken,
    Link,
    Pager,
    SortContext,
    TableView,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
    Tag,
    TagProps,
    createStringColumn,
    useAlert,
    useBooleanState,
    useSortState,
    useRowExpansion,
    RowExpansionContext,
} from '@the-deep/deep-ui';
import {
    useMutation,
    useQuery,
    gql,
} from '@apollo/client';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { VscLoading } from 'react-icons/vsc';

import {
    ProjectSourcesQuery,
    ProjectSourcesQueryVariables,
    DeleteLeadMutation,
    DeleteLeadMutationVariables,
} from '#generated/types';
import _ts from '#ts';
import { useLazyRequest } from '#base/utils/restRequest';
import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';
import ProgressLine, { Props as ProgressLineProps } from '#components/ProgressLine';
import {
    calcPercent,
    isFiltered,
} from '#utils/common';

import { transformSourcesFilterToEntriesFilter } from '../utils';
import { getProjectSourcesQueryVariables } from '../SourcesFilter';
import {
    PartialFormType as PartialFilterFormType,
    FormType as FilterFormType,
} from '../SourcesFilter/schema';
import { Lead } from './types';
import Actions, { Props as ActionsProps } from './Actions';
import LeadEditModal from '../LeadEditModal';
import BulkActions from './BulkActions';
import EntryList from './EntryList';

import styles from './styles.css';

function sourcesKeySelector(d: Lead) {
    return d.id;
}

const statusIconMap: { [key in Lead['status']]: ReactNode } = {
    NOT_TAGGED: null,
    IN_PROGRESS: <VscLoading />,
    TAGGED: <IoCheckmarkCircleOutline />,
};

const statusVariantMap: Record<Lead['status'], 'default' | 'gradient1' | 'complement1'> = {
    NOT_TAGGED: 'default',
    IN_PROGRESS: 'gradient1',
    TAGGED: 'complement1',
};

const maxItemsPerPage = 10;

const defaultSorting = {
    name: 'createdAt',
    direction: 'Ascending',
};

export const PROJECT_SOURCES = gql`
    query ProjectSources(
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $ordering: String,
        $assignees: [ID!],
        $authoringOrganizationTypes: [ID!],
        $confidentiality: LeadConfidentialityEnum,
        $createdAtGte: DateTime,
        $createdAtLte: DateTime,
        $emmEntities: String,
        $emmKeywords: String,
        $emmRiskFactors: String,
        $exists: LeadExistsEnum,
        $priorities: [LeadPriorityEnum!],
        $publishedOnGte: Date,
        $publishedOnLte: Date,
        $search: String,
        $statuses: [LeadStatusEnum!],
        $entriesFilterData: LeadEntriesFilterData,
        $customFilters: LeadCustomFilterEnum,
    ) {
        project(id: $projectId) {
            id
            leads (
                page: $page,
                pageSize: $pageSize,
                ordering: $ordering,
                assignees: $assignees,
                authoringOrganizationTypes: $authoringOrganizationTypes,
                confidentiality: $confidentiality,
                createdAtGte: $createdAtGte,
                createdAtLte: $createdAtLte,
                emmEntities: $emmEntities,
                emmKeywords: $emmKeywords,
                emmRiskFactors: $emmRiskFactors,
                exists: $exists,
                priorities: $priorities,
                publishedOnGte: $publishedOnGte,
                publishedOnLte: $publishedOnLte,
                search: $search,
                statuses: $statuses,
                entriesFilterData: $entriesFilterData,
                customFilters: $customFilters,
            ) {
                totalCount
                page
                pageSize
                results {
                    id
                    confidentiality
                    clientId
                    status
                    statusDisplay
                    createdAt
                    title
                    publishedOn
                    priority
                    priorityDisplay
                    assessmentId
                    createdBy {
                        id
                        displayName
                    }
                    project
                    authors {
                        id
                        title
                        mergedAs {
                            id
                            title
                        }
                    }
                    assignee {
                        id
                        displayName
                    }
                    source {
                        mergedAs {
                            id
                            title
                        }
                        id
                        url
                        title
                    }
                    entriesCounts {
                        controlled
                        total
                    }
                    leadPreview {
                        pageCount
                    }
                    isAssessmentLead
                }
            }
        }
    }
`;

interface SourceLinkProps {
    title?: string;
    link?: string;
}

function SourceLink(props: SourceLinkProps) {
    const {
        link,
        title,
    } = props;

    if (!link) {
        return (
            <div>{title}</div>
        );
    }

    return (
        <Link
            to={link}
        >
            {title}
        </Link>
    );
}

const DELETE_LEAD = gql`
    mutation DeleteLead(
        $projectId: ID!,
        $leadId: ID!,
    ) {
        project(id: $projectId) {
            id
            leadDelete(id: $leadId) {
                ok
                errors
            }
        }
    }
`;

interface Props {
    className?: string;
    projectId: string;
    filters: PartialFilterFormType;
}

function SourcesTable(props: Props) {
    const {
        className,
        projectId,
        filters: rawFilters,
    } = props;

    const filters = useMemo(() => (
        getProjectSourcesQueryVariables(
            rawFilters as Omit<FilterFormType, 'projectId'>,
        )
    ), [rawFilters]);

    const [activePage, setActivePage] = useState<number>(1);
    const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
    const [leadToEdit, setLeadToEdit] = useState<string | undefined>();
    const alert = useAlert();

    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = validSorting.direction === 'Ascending'
        ? validSorting.name
        : `-${validSorting.name}`;

    const variables = useMemo(
        (): ProjectSourcesQueryVariables | undefined => {
            if (!projectId) {
                return undefined;
            }
            return ({
                ...filters,
                projectId,
                page: activePage,
                pageSize: maxItemsPerPage,
                ordering,
            });
        },
        [projectId, activePage, ordering, filters],
    );

    const {
        previousData,
        data: projectSourcesResponse = previousData,
        loading: projectSourcesPending,
        refetch: getProjectSources,
    } = useQuery<ProjectSourcesQuery, ProjectSourcesQueryVariables>(
        PROJECT_SOURCES,
        {
            skip: isNotDefined(variables),
            variables,
        },
    );

    const [
        deleteLead,
        {
            loading: leadDeletePending,
        },
    ] = useMutation<DeleteLeadMutation, DeleteLeadMutationVariables>(
        DELETE_LEAD,
        {
            onCompleted: (response) => {
                if (response?.project?.leadDelete?.ok) {
                    alert.show(
                        'Successfully deleted lead.',
                        {
                            variant: 'success',
                        },
                    );
                    getProjectSources();
                } else {
                    alert.show(
                        'Failed to delete lead.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to delete lead.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const sourcesResponse = projectSourcesResponse?.project?.leads;
    const sources = sourcesResponse?.results;

    const handlePageChange = useCallback((page: number) => {
        setActivePage(page);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedLeads([]);
    }, []);

    const handleSelectAll = useCallback((value: boolean) => {
        setSelectedLeads((oldLeads) => {
            if (value) {
                return unique([...oldLeads, ...sources ?? []], (d) => d.id);
            }
            const idMap = listToMap(sources ?? [], (d) => d.id, () => true);
            return oldLeads.filter((d) => !idMap[d.id]);
        });
    }, [sources]);

    const handleSelection = useCallback((value: boolean, lead: Lead) => {
        if (value) {
            setSelectedLeads((oldSelectedLeads) => ([...oldSelectedLeads, lead]));
        } else {
            setSelectedLeads((oldSelectedLeads) => (
                oldSelectedLeads.filter((v) => v.id !== lead.id)
            ));
        }
    }, []);

    const entriesFilter = useMemo(() => transformSourcesFilterToEntriesFilter(filters), [filters]);

    const [
        rowModifier,
        expandedRowKey,
        setExpandedRowKey,
    ] = useRowExpansion<Lead, string>(
        ({ datum }) => {
            if ((datum?.entriesCounts?.total ?? 0) > 0) {
                return (
                    <EntryList
                        key={datum.id}
                        leadId={datum.id}
                        projectId={datum.project}
                        filters={entriesFilter}
                        getProjectSources={getProjectSources}
                    />
                );
            }
            return null;
        },
        {
            expandedRowClassName: styles.expandedRow,
            expandedCellClassName: styles.expandedCell,
            expansionCellClassName: styles.expansionCell,
            expansionRowClassName: styles.expansionRow,
        },
    );

    const [
        showSingleSourceModal,
        setShowSingleSourceModalTrue,
        setShowSingleSourceModalFalse,
    ] = useBooleanState(false);

    const handleDelete = useCallback(
        (leadId: string) => {
            deleteLead({
                variables: {
                    projectId,
                    leadId,
                },
            });
        },
        [projectId, deleteLead],
    );

    const handleEdit = useCallback((leadId: string) => {
        setLeadToEdit(leadId);
        setShowSingleSourceModalTrue();
    }, [setShowSingleSourceModalTrue]);

    const {
        pending: bulkDeletePending,
        trigger: bulkLeadDeleteTrigger,
    } = useLazyRequest<unknown, string[]>({
        url: `server://project/${projectId}/leads/bulk-delete/`,
        method: 'POST',
        body: (ctx) => ({ leads: ctx }),
        onSuccess: () => {
            alert.show(
                'Sources deleted successfully!',
                { variant: 'success' },
            );
            setSelectedLeads([]);
            getProjectSources();
        },
        failureMessage: 'Failed to delete leads.',
    });

    const columns = useMemo(() => {
        const selectedLeadsMap = listToMap(selectedLeads, (d) => d.id, () => true);
        const selectAllCheckValue = sources?.some((d) => selectedLeadsMap[d.id]);

        const selectColumn: TableColumn<
            Lead, string, CheckboxProps<string>, CheckboxProps<string>
        > = {
            id: 'select',
            title: '',
            headerCellRenderer: Checkbox,
            headerCellRendererParams: {
                value: selectAllCheckValue,
                // label: selectedLeads.length > 0
                // ? _ts('sourcesTable', 'selectedNumberOfSources',
                // { noOfSources: selectedLeads.length }) : _ts('sourcesTable', 'selectAll'),
                onChange: handleSelectAll,
                indeterminate: !(selectedLeads.length === sources?.length
                || selectedLeads.length === 0),
            },
            cellRenderer: Checkbox,
            cellRendererParams: (_, data) => ({
                name: data.id,
                value: selectedLeads.some((v) => v.id === data.id),
                onChange: (newVal) => handleSelection(newVal, data),
            }),
            columnWidth: 48,
        };
        const statusColumn: TableColumn<
            Lead, string, TagProps, TableHeaderCellProps
        > = {
            id: 'status',
            title: _ts('sourcesTable', 'status'),
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRendererClassName: styles.status,
            cellRenderer: Tag,
            cellRendererParams: (_, data) => ({
                actions: statusIconMap[data.status],
                variant: statusVariantMap[data.status],
                children: data.statusDisplay,
            }),
            columnWidth: 190,
        };
        const createdAtColumn: TableColumn<
            Lead, string, DateOutputProps, TableHeaderCellProps
        > = {
            id: 'createdAt',
            title: _ts('sourcesTable', 'createdAt'),
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: DateOutput,
            cellRendererParams: (_, data) => ({
                value: data.createdAt,
            }),
            columnWidth: 128,
        };
        const publishedOnColumn: TableColumn<
            Lead, string, DateOutputProps, TableHeaderCellProps
        > = {
            id: 'publishedOn',
            title: _ts('sourcesTable', 'publishingDate'),
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: DateOutput,
            cellRendererParams: (_, data) => ({
                value: data.publishedOn,
            }),
            columnWidth: 144,
        };
        const publisherColumn: TableColumn<
            Lead, string, SourceLinkProps, TableHeaderCellProps
        > = {
            id: 'source',
            title: _ts('sourcesTable', 'publisher'),
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: SourceLink,
            cellRendererParams: (_, data) => ({
                title: data.source ? organizationTitleSelector(data.source) : undefined,
                link: data.source?.url,
            }),
            columnWidth: 160,
        };
        const percentControlledColumn: TableColumn<
            Lead, string, ProgressLineProps, TableHeaderCellProps
        > = {
            id: 'percentControlled',
            title: '% Controlled',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: ProgressLine,
            cellRendererParams: (_, data) => ({
                progress: calcPercent(
                    data.entriesCounts?.controlled,
                    data.entriesCounts?.total,
                ) ?? 0,
                size: 'small',
                hideInfoCircle: true,
            }),
        };
        const actionsColumn: TableColumn<
            Lead, string, ActionsProps<string>, TableHeaderCellProps
        > = {
            id: 'actions',
            title: '',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: Actions,
            cellRendererParams: (_, data) => ({
                id: data.id,
                title: data.title,
                onEditClick: handleEdit,
                onDeleteClick: handleDelete,
                entriesCount: data.entriesCounts?.total ?? 0,
                isAssessmentLead: data.isAssessmentLead,
            }),
            columnWidth: 196,
        };
        return ([
            selectColumn,
            statusColumn,
            createdAtColumn,
            createStringColumn<Lead, string>(
                'title',
                _ts('sourcesTable', 'titleLabel'),
                (item) => item.title,
                {
                    sortable: true,
                    columnClassName: styles.titleColumn,
                },
            ),
            createStringColumn<Lead, string>(
                'pageCount',
                _ts('sourcesTable', 'pages'),
                (item) => {
                    if (!item.leadPreview?.pageCount) {
                        return '-';
                    }
                    return `${item.leadPreview.pageCount} ${item.leadPreview.pageCount > 1 ? 'pages' : 'page'}`;
                },
                {
                    columnWidth: 96,
                },
            ),
            publisherColumn,
            createStringColumn<Lead, string>(
                'authors',
                _ts('sourcesTable', 'authors'),
                (item) => item.authors?.map(organizationTitleSelector).join(', '),
                {
                    sortable: false,
                    columnWidth: 144,
                },
            ),
            publishedOnColumn,
            createStringColumn<Lead, string>(
                'createdBy',
                _ts('sourcesTable', 'addedBy'),
                (item) => item.createdBy?.displayName,
                {
                    sortable: true,
                    columnWidth: 144,
                },
            ),
            createStringColumn<Lead, string>(
                'assignee',
                _ts('sourcesTable', 'assignee'),
                (item) => item.assignee?.displayName,
                {
                    sortable: true,
                    columnWidth: 144,
                },
            ),
            createStringColumn<Lead, string>(
                'priority',
                _ts('sourcesTable', 'priority'),
                (item) => item.priorityDisplay,
                {
                    sortable: true,
                    columnWidth: 96,
                },
            ),
            percentControlledColumn,
            actionsColumn,
        ]);
    }, [
        handleSelectAll,
        handleSelection,
        sources,
        selectedLeads,
        handleEdit,
        handleDelete,
    ]);

    const handleSourceSaveSuccess = useCallback(() => {
        setShowSingleSourceModalFalse();
    }, [setShowSingleSourceModalFalse]);

    const pending = projectSourcesPending || bulkDeletePending || leadDeletePending;

    return (
        <>
            <Container
                className={_cs(styles.sourcesTableContainer, className)}
                contentClassName={styles.content}
                footerActions={(
                    <Pager
                        activePage={activePage}
                        itemsCount={sourcesResponse?.totalCount ?? 0}
                        maxItemsPerPage={maxItemsPerPage}
                        onActivePageChange={handlePageChange}
                        itemsPerPageControlHidden
                    />
                )}
            >
                <RowExpansionContext.Provider
                    value={{ expandedRowKey, setExpandedRowKey }}
                >
                    <SortContext.Provider value={sortState}>
                        <TableView
                            className={styles.table}
                            data={sources}
                            keySelector={sourcesKeySelector}
                            rowClassName={styles.tableRow}
                            columns={columns}
                            rowModifier={rowModifier}
                            variant="large"
                            pending={pending}
                            filtered={isFiltered(entriesFilter)}
                            errored={false}
                            filteredEmptyMessage="No matching sources found."
                            filteredEmptyIcon={(
                                <Kraken
                                    size="large"
                                    variant="search"
                                />
                            )}
                            emptyMessage="No sources found."
                            emptyIcon={(
                                <Kraken
                                    size="large"
                                    variant="sleep"
                                />
                            )}
                            messageShown
                            messageIconShown
                        />
                    </SortContext.Provider>
                </RowExpansionContext.Provider>
                {showSingleSourceModal && (
                    <LeadEditModal
                        leadId={String(leadToEdit)}
                        projectId={String(projectId)}
                        onClose={setShowSingleSourceModalFalse}
                        onLeadSaveSuccess={handleSourceSaveSuccess}
                    />
                )}
            </Container>
            {(selectedLeads.length > 0 && !bulkDeletePending) && (
                <BulkActions
                    selectedLeads={selectedLeads}
                    activeProject={projectId}
                    onRemoveClick={bulkLeadDeleteTrigger}
                    onClearSelection={clearSelection}
                />
            )}
        </>
    );
}

export default SourcesTable;
