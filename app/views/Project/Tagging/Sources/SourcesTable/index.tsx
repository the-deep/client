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
    Link,
    LinkProps,
    Pager,
    PendingMessage,
    SortContext,
    Table,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
    Tag,
    TagProps,
    createStringColumn,
    useBooleanState,
    useSortState,
    useRowExpansion,
    RowExpansionContext,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { VscLoading } from 'react-icons/vsc';

import {
    ProjectSourcesQuery,
    ProjectSourcesQueryVariables,
    OrganizationType,
} from '#generated/types';
import _ts from '#ts';

import { Lead } from './types';
import Actions, { Props as ActionsProps } from './Actions';
import LeadEditModal from '../LeadEditModal';
import BulkActions from './BulkActions';
import EntryList from './EntryList';
import styles from './styles.css';

const sourcesKeySelector: (d: Lead) => string = (d) => d.id;

const statusIconMap: Record<Lead['status'], ReactNode> = {
    PENDING: <VscLoading />,
    VALIDATED: <IoCheckmarkCircleOutline />,
    PROCESSED: null,
};

const statusVariantMap: Record<Lead['status'], 'complement2' | 'accent' | 'complement1'> = {
    PENDING: 'complement2',
    VALIDATED: 'accent',
    PROCESSED: 'complement1',
};

const maxItemsPerPage = 10;

const defaultSorting = {
    name: 'created_at',
    direction: 'asc',
};

interface Props {
    className?: string;
    projectId: string;
    filters: Omit<ProjectSourcesQueryVariables, 'projectId'>;
}

export const PROJECT_ENTRIES = gql`
    query ProjectSources(
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $ordering: String,
        $assignees: [ID!],
        $authoringOrganizationTypes: [ID!],
        $confidentiality: LeadConfidentialityEnum,
        $createdAt_Gte: DateTime,
        $createdAt_Lt: DateTime,
        $emmEntities: String,
        $emmKeywords: String,
        $emmRiskFactors: String,
        $exists: LeadExistsEnum,
        $priorities: [LeadPriorityEnum!],
        $publishedOn_Gte: Date,
        $publishedOn_Lt: Date,
        $search: String,
        $statuses: [LeadStatusEnum!],
        $entriesFilterData: LeadEntriesFilterData,
    ) {
        project(id: $projectId) {
            leads (
                page: $page,
                pageSize: $pageSize,
                ordering: $ordering,
                assignees: $assignees,
                authoringOrganizationTypes: $authoringOrganizationTypes,
                confidentiality: $confidentiality,
                createdAt_Gte: $createdAt_Gte,
                createdAt_Lt: $createdAt_Lt,
                emmEntities: $emmEntities,
                emmKeywords: $emmKeywords,
                emmRiskFactors: $emmRiskFactors,
                exists: $exists,
                priorities: $priorities,
                publishedOn_Gte: $publishedOn_Gte,
                publishedOn_Lt: $publishedOn_Lt,
                search: $search,
                statuses: $statuses,
                entriesFilterData: $entriesFilterData,
            ) {
                totalCount
                page
                pageSize
                results {
                    id

                    confidentiality
                    clientId
                    status
                    createdAt
                    title
                    publishedOn
                    priority
                    createdBy {
                        id
                        displayName
                    }
                    project {
                        id
                    }
                    authors {
                        id
                        title
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
                }
            }
        }
    }
`;

function SourcesTable(props: Props) {
    const {
        className,
        projectId,
        filters,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [selectedSources, setSelectedSources] = useState<Lead[]>([]);
    const [leadToEdit, setLeadToEdit] = useState<string | undefined>();

    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = validSorting.direction === 'Ascending'
        ? validSorting.name
        : `-${validSorting.name}`;

    const variables = useMemo(
        (): ProjectSourcesQueryVariables | undefined => (
            (projectId) ? {
                projectId,
                page: activePage,
                pageSize: maxItemsPerPage,
                ordering,
                ...filters as Omit<ProjectSourcesQueryVariables, 'projectId' | 'page' | 'pageSize' | 'ordering'>,
            } : undefined
        ),
        [projectId, activePage, ordering, filters],
    );

    const {
        data: projectSourcesResponse,
        loading: projectSourcesPending,
    } = useQuery<ProjectSourcesQuery, ProjectSourcesQueryVariables>(
        PROJECT_ENTRIES,
        {
            skip: isNotDefined(variables),
            variables,
        },
    );

    const sourcesResponse = projectSourcesResponse?.project?.leads;
    const sources = sourcesResponse?.results;

    const handlePageChange = useCallback((page: number) => {
        setActivePage(page);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedSources([]);
    }, []);

    const handleBulkSourcesRemoveSuccess = useCallback(() => {
        setSelectedSources([]);
    }, []);

    const handleSelectAll = useCallback((value: boolean) => {
        setSelectedSources((oldSources) => {
            if (value) {
                return unique([...oldSources, ...sources ?? []], (d) => d.id);
            }
            const idMap = listToMap(sources ?? [], (d) => d.id, () => true);
            return oldSources.filter((d) => !idMap[d.id]);
        });
    }, [sources]);

    const handleSelection = useCallback((value: boolean, lead: Lead) => {
        if (value) {
            setSelectedSources((oldSelectedSources) => ([...oldSelectedSources, lead]));
        } else {
            setSelectedSources((oldSelectedSources) => (
                oldSelectedSources.filter((v) => v.id !== lead.id)
            ));
        }
    }, []);

    const [
        rowModifier,
        expandedRowKey,
        setExpandedRowKey,
    ] = useRowExpansion<Lead, string>(
        ({ datum }) => (
            <EntryList
                leadId={datum.id}
                projectId={datum.project.id}
            />
        ),
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

    // eslint-disable-next-line
    const handleDelete = useCallback((_: string) => {}, []); //FIXME handle delete action later

    const handleEdit = useCallback((leadId: string) => {
        setLeadToEdit(leadId);
        setShowSingleSourceModalTrue();
    }, [setShowSingleSourceModalTrue]);

    const columns = useMemo(() => {
        const selectedSourcesMap = listToMap(selectedSources, (d) => d.id, () => true);
        const selectAllCheckValue = sources?.some((d) => selectedSourcesMap[d.id]);

        const selectColumn: TableColumn<
            Lead, string, CheckboxProps<string>, CheckboxProps<string>
        > = {
            id: 'select',
            title: '',
            headerCellRenderer: Checkbox,
            headerCellRendererParams: {
                value: selectAllCheckValue,
                // label: selectedSources.length > 0
                // ? _ts('sourcesTable', 'selectedNumberOfSources',
                // { noOfSources: selectedSources.length }) : _ts('sourcesTable', 'selectAll'),
                onChange: handleSelectAll,
                indeterminate: !(selectedSources.length === sources?.length
                || selectedSources.length === 0),
            },
            cellRenderer: Checkbox,
            cellRendererParams: (_, data) => ({
                name: data.id,
                value: selectedSources.some((v) => v.id === data.id),
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
                actions: data.entriesCount === 0 ? undefined : statusIconMap[data.status],
                variant: data.entriesCount === 0 ? 'default' : statusVariantMap[data.status],
                children: data.entriesCount === 0 ? 'Not Tagged' : data.status,
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
            Lead, string, LinkProps, TableHeaderCellProps
        > = {
            id: 'source',
            title: _ts('sourcesTable', 'publisher'),
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: Link,
            cellRendererParams: (_, data) => ({
                children: data.source?.title,
                to: data.source?.url ?? '#',
            }),
            columnWidth: 160,
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
                onEditClick: handleEdit,
                onDeleteClick: handleDelete,
                entriesCount: 100, // FIXME use real value
                projectId: data.project.id,
                isAssessmentLead: false, // FIXME use real value
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
            createStringColumn<Lead, string>( // FIXME no value from graphql server
                'pageCount',
                _ts('sourcesTable', 'pages'),
                (item) => {
                    if (!item.pageCount) {
                        return '-';
                    }
                    return `${item?.pageCount} ${item?.pageCount > 1 ? 'pages' : 'page'}`;
                },
                {
                    sortable: true,
                    columnWidth: 96,
                },
            ),
            publisherColumn,
            createStringColumn<Lead, string>(
                'authors',
                _ts('sourcesTable', 'authors'),
                (item) => item.authors?.map((v: Pick<OrganizationType, 'title'>) => v.title).join(', '),
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
                (item) => item.priority,
                {
                    sortable: true,
                    columnWidth: 96,
                },
            ),
            actionsColumn,
        ]);
    }, [
        handleSelectAll,
        handleSelection,
        sources,
        selectedSources,
        handleEdit,
        handleDelete,
    ]);

    const handleSourceSaveSuccess = useCallback(() => {
        setShowSingleSourceModalFalse();
    }, [setShowSingleSourceModalFalse]);

    const pending = projectSourcesPending;

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
                {pending && (<PendingMessage />)}
                <RowExpansionContext.Provider
                    value={{ expandedRowKey, setExpandedRowKey }}
                >
                    <SortContext.Provider value={sortState}>
                        <Table
                            className={styles.table}
                            data={sources}
                            keySelector={sourcesKeySelector}
                            rowClassName={styles.tableRow}
                            columns={columns}
                            rowModifier={rowModifier}
                            variant="large"
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
            {selectedSources.length > 0 && (
                <BulkActions
                    selectedLeads={selectedSources}
                    activeProject={projectId}
                    onRemoveSuccess={handleBulkSourcesRemoveSuccess}
                    onClearSelection={clearSelection}
                />
            )}
        </>
    );
}

export default SourcesTable;
