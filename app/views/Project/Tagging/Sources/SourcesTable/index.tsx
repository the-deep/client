import React, { useEffect, ReactNode, useMemo, useState, useCallback } from 'react';
import {
    _cs,
    listToMap,
    unique,
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
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { VscLoading } from 'react-icons/vsc';

import { useRequest, useLazyRequest } from '#base/utils/restRequest';
import { MultiResponse, Lead } from '#types';
import _ts from '#ts';

import Actions, { Props as ActionsProps } from './Actions';
import { FilterFormType as Filters, getFiltersForRequest } from '../utils';
import LeadEditModal from '../LeadEditModal';
import BulkActions from './BulkActions';
import EntryList from './EntryList';

import styles from './styles.css';

const leadsKeySelector: (d: Lead) => number = (d) => d.id;

const statusIconMap: Record<Lead['status'], ReactNode> = {
    pending: <VscLoading />,
    validated: <IoCheckmarkCircleOutline />,
    processed: null,
};
const statusVariantMap: Record<Lead['status'], 'complement2' | 'accent' | 'complement1'> = {
    pending: 'complement2',
    validated: 'accent',
    processed: 'complement1',
};
const statusLabelMap: Record<Lead['status'], string> = {
    pending: 'In Progress',
    validated: 'Validated',
    processed: 'Tagged',
};

const maxItemsPerPage = 10;

const defaultSorting = {
    name: 'created_at',
    direction: 'asc',
};

interface Props {
    className?: string;
    projectId: number;
    filters?: Filters;
    refreshTimestamp: number | undefined;
}

function SourcesTable(props: Props) {
    const {
        className,
        projectId,
        filters,
        refreshTimestamp,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);

    const leadsRequestQuery = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
    }), [activePage]);

    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = validSorting.direction === 'Ascending'
        ? validSorting.name
        : `-${validSorting.name}`;

    const leadsRequestBody = useMemo(() => ({
        ...getFiltersForRequest(filters),
        project: projectId,
        ordering,
    }), [projectId, filters, ordering]);

    const {
        pending: leadsGetPending,
        response: leadsResponse,
        retrigger: getLeads,
    } = useRequest<MultiResponse<Lead>>({
        url: 'server://v2/leads/filter/',
        query: leadsRequestQuery,
        method: 'POST',
        body: leadsRequestBody,
        failureHeader: _ts('sourcesTable', 'title'),
        preserveResponse: true,
    });

    const {
        pending: leadDeletePending,
        trigger: deleteLead,
    } = useLazyRequest<unknown, number>({
        url: (ctx) => `server://leads/${ctx}/`,
        method: 'DELETE',
        onSuccess: (_, ctx) => {
            getLeads();
            setSelectedLeads((oldLeads) => oldLeads.filter((lead) => lead.id !== ctx));
        },
        failureHeader: _ts('sourcesTable', 'title'),
    });

    useEffect(() => {
        getLeads();
    }, [refreshTimestamp, getLeads]);

    const handlePageChange = useCallback((page: number) => {
        setActivePage(page);
        getLeads();
    }, [getLeads]);

    const clearSelection = useCallback(() => {
        setSelectedLeads([]);
    }, []);

    const handleBulkLeadsRemoveSuccess = useCallback(() => {
        setSelectedLeads([]);
        getLeads();
    }, [getLeads]);

    const handleSelectAll = useCallback((value: boolean) => {
        setSelectedLeads((oldLeads) => {
            const leads = leadsResponse?.results ?? [];
            if (value) {
                return unique([...oldLeads, ...leads], (d) => d.id);
            }
            const idMap = listToMap(leads, (d) => d.id, () => true);
            return oldLeads.filter((d) => !idMap[d.id]);
        });
    }, [leadsResponse]);

    const handleSelection = useCallback((value: boolean, lead: Lead) => {
        if (value) {
            setSelectedLeads((leads) => ([...leads, lead]));
        } else {
            setSelectedLeads((leads) => leads.filter((v) => v.id !== lead.id));
        }
    }, []);

    const [leadToEdit, setLeadToEdit] = useState<number | undefined>();

    const [
        rowModifier,
        expandedRowKey,
        setExpandedRowKey,
    ] = useRowExpansion<Lead, number>(
        ({ datum }) => (
            <EntryList leadId={datum.id} projectId={datum.project} />
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

    const handleDelete = useCallback((leadId: number) => {
        deleteLead(leadId);
    }, [deleteLead]);

    const handleEdit = useCallback((leadId: number) => {
        setLeadToEdit(leadId);
        setShowSingleSourceModalTrue();
    }, [setShowSingleSourceModalTrue]);

    const columns = useMemo(() => {
        const selectedLeadsMap = listToMap(selectedLeads, (d) => d.id, () => true);
        const selectAllCheckValue = leadsResponse?.results?.some((d) => selectedLeadsMap[d.id]);

        const selectColumn: TableColumn<
            Lead, number, CheckboxProps<number>, CheckboxProps<number>
        > = {
            id: 'select',
            title: '',
            headerCellRenderer: Checkbox,
            headerCellRendererParams: {
                value: selectAllCheckValue,
                // label: selectedLeads.length > 0
                // ? _ts('sourcesTable', 'selectedNumberOfLeads',
                // { noOfLeads: selectedLeads.length }) : _ts('sourcesTable', 'selectAll'),
                onChange: handleSelectAll,
                indeterminate: !(selectedLeads.length === leadsResponse?.results.length
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
            Lead, number, TagProps, TableHeaderCellProps
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
                children: statusLabelMap[data.status],
            }),
            columnWidth: 160,
        };
        const createdAtColumn: TableColumn<
            Lead, number, DateOutputProps, TableHeaderCellProps
        > = {
            id: 'created_at',
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
            Lead, number, DateOutputProps, TableHeaderCellProps
        > = {
            id: 'published_on',
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
            Lead, number, LinkProps, TableHeaderCellProps
        > = {
            id: 'source',
            title: _ts('sourcesTable', 'publisher'),
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: Link,
            cellRendererParams: (_, data) => ({
                children: data.sourceDetail?.title ?? data.sourceRaw,
                to: '#', // TODO use provided url
            }),
            columnWidth: 160,
        };
        const actionsColumn: TableColumn<
            Lead, number, ActionsProps<number>, TableHeaderCellProps
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
                entriesCount: data.entriesCount,
                projectId,
            }),
            columnWidth: 196,
        };
        return ([
            selectColumn,
            statusColumn,
            createdAtColumn,
            createStringColumn<Lead, number>(
                'title',
                _ts('sourcesTable', 'titleLabel'),
                (item) => item?.title,
                {
                    sortable: true,
                    columnClassName: styles.titleColumn,
                },
            ),
            createStringColumn<Lead, number>(
                'page_count',
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
            createStringColumn<Lead, number>(
                'authorsDetail',
                _ts('sourcesTable', 'authors'),
                (item) => item?.authorsDetail.map((v) => v.title).join(','),
                {
                    sortable: false,
                    columnWidth: 144,
                },
            ),
            publishedOnColumn,
            createStringColumn<Lead, number>(
                'created_by',
                _ts('sourcesTable', 'addedBy'),
                (item) => item?.createdByName,
                {
                    sortable: true,
                    columnWidth: 144,
                },
            ),
            createStringColumn<Lead, number>(
                'assignee',
                _ts('sourcesTable', 'assignee'),
                (item) => item?.assigneeDetails?.displayName,
                {
                    sortable: true,
                    columnWidth: 144,
                },
            ),
            createStringColumn<Lead, number>(
                'priority',
                _ts('sourcesTable', 'priority'),
                (item) => item?.priorityDisplay,
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
        leadsResponse,
        selectedLeads,
        handleEdit,
        handleDelete,
        projectId,
    ]);

    const handleLeadSaveSuccess = useCallback(() => {
        getLeads();
        setShowSingleSourceModalFalse();
    }, [getLeads, setShowSingleSourceModalFalse]);

    const pending = leadsGetPending || leadDeletePending;

    return (
        <>
            <Container
                className={_cs(styles.sourcesTableContainer, className)}
                contentClassName={styles.content}
                footerActions={(
                    <Pager
                        activePage={activePage}
                        itemsCount={leadsResponse?.count ?? 0}
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
                            data={leadsResponse?.results}
                            keySelector={leadsKeySelector}
                            columns={columns}
                            rowModifier={rowModifier}
                            variant="large"
                        />
                    </SortContext.Provider>
                </RowExpansionContext.Provider>
                {showSingleSourceModal && (
                    <LeadEditModal
                        leadId={leadToEdit}
                        projectId={projectId}
                        onClose={setShowSingleSourceModalFalse}
                        onLeadSaveSuccess={handleLeadSaveSuccess}
                    />
                )}
            </Container>
            {selectedLeads.length > 0 && (
                <BulkActions
                    selectedLeads={selectedLeads}
                    activeProject={projectId}
                    onRemoveSuccess={handleBulkLeadsRemoveSuccess}
                    onClearSelection={clearSelection}
                />
            )}
        </>
    );
}

export default SourcesTable;
