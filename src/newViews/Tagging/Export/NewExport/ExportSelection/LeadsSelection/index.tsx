import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    DateOutput,
    Pager,
    Table,
    TableColumn,
    PendingMessage,
    TableHeaderCell,
    TableHeaderCellProps,
    createStringColumn,
    createNumberColumn,
    DateOutputProps,
    Link,
    LinkProps,
    SortContext,
    useSortState,
    Checkbox,
    CheckboxProps,
} from '@the-deep/deep-ui';

import { getCombinedLeadFilters } from '#entities/lead';
import { useRequest } from '#utils/request';
import _ts from '#ts';
import {
    FilterFields,
    Lead,
    MultiResponse,
    WidgetElement,
    GeoOptions,
    EntryOptions,
} from '#typings';

import { SourceEntryFilter } from '../types';
import CombinedSourceEntryFilterForm from './CombinedSourceEntryFilterForm';
import styles from './styles.scss';

const defaultSorting = {
    name: 'created_at',
    direction: 'asc',
};

const leadsKeySelector: (d: Lead) => number = d => d.id;
const maxItemsPerPage = 10;

interface Props {
    className?: string;
    pending?: boolean;
    projectId: number;
    filterOnlyUnprotected: boolean;
    entriesFilters?: FilterFields[];
    entriesWidgets?: WidgetElement<unknown>[];
    entriesGeoOptions?: GeoOptions;
    entryOptions?: EntryOptions;
    hasAssessment?: boolean;
    onSelectLeadChange: (values: number[]) => void;
    selectedLeads: number[];
    selectAll: boolean;
    onSelectAllChange: (v: boolean) => void;
    filterValues: SourceEntryFilter;
    onFilterApply: (values: SourceEntryFilter) => void;
}


function LeadsSelection(props: Props) {
    const {
        projectId,
        className,
        filterOnlyUnprotected,
        entriesFilters,
        entriesWidgets,
        entryOptions,
        entriesGeoOptions,
        hasAssessment,
        selectedLeads,
        onSelectLeadChange,
        selectAll,
        onSelectAllChange,
        filterValues,
        onFilterApply,
        pending,
    } = props;

    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = validSorting.direction === 'Ascending'
        ? validSorting.name
        : `-${validSorting.name}`;

    const [activePage, setActivePage] = useState<number>(1);

    const sanitizedFilters = useMemo(() => {
        interface ProcessedFilters {
            'entries_filter': ([string] | string)[];
            [key: string]: [string] | string | ([string] | string)[];
        }
        const processedFilters: ProcessedFilters = getCombinedLeadFilters(
            filterValues,
            entriesWidgets,
            entriesGeoOptions,
        );
        // Unprotected filter is sent to request to fetch leads
        // if user cannot create export for confidential documents
        if (hasAssessment) {
            processedFilters.exists = 'assessment_exists';
        }
        if (filterOnlyUnprotected) {
            processedFilters.confidentiality = ['unprotected'];
        }

        return processedFilters;
    }, [
        filterOnlyUnprotected,
        filterValues,
        hasAssessment,
        entriesGeoOptions,
        entriesWidgets,
    ]);

    const leadsRequestBody = useMemo(() => ({
        custom_filters: !hasAssessment ? 'exclude_empty_filtered_entries' : '',
        ordering,
        project: [projectId],
        ...sanitizedFilters,
    }), [
        ordering,
        projectId,
        sanitizedFilters,
        hasAssessment,
    ]);

    const leadsRequestQuery = useMemo(
        () => ({
            fields: [
                'id',
                'title',
                'created_at',
                'published_on',
                'entries_count',
                'filtered_entries_count',
                'source_detail',
                'authors_detail',
            ],
            project: projectId,
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        }),
        [activePage, projectId],
    );

    const {
        pending: leadsPending,
        response: leadsResponse,
    } = useRequest<MultiResponse<Lead>>({
        url: 'server://v2/leads/filter/',
        method: 'POST',
        query: leadsRequestQuery,
        skip: pending,
        body: leadsRequestBody,
        failureHeader: _ts('export', 'leadsLabel'),
    });

    const handleSelectAll = useCallback((value: boolean) => {
        onSelectAllChange(value);
        onSelectLeadChange([]);
    }, [onSelectAllChange, onSelectLeadChange]);

    const handleSelection = useCallback((value: boolean, lead: Lead) => {
        if (value) {
            onSelectLeadChange([...selectedLeads, lead.id]);
        } else {
            onSelectLeadChange(selectedLeads.filter(v => v !== lead.id));
        }
    }, [onSelectLeadChange, selectedLeads]);

    const columns = useMemo(() => {
        const selectColumn: TableColumn<
        Lead, number, CheckboxProps<number>, CheckboxProps<number>
        > = {
            id: 'select',
            title: '',
            headerCellRenderer: Checkbox,
            headerCellRendererParams: {
                value: selectAll,
                onChange: handleSelectAll,
            },
            cellRenderer: Checkbox,
            cellRendererParams: (_, data) => {
                const isSelected = selectedLeads.includes(data.id);
                return {
                    name: data.id,
                    value: selectAll ? !isSelected : isSelected,
                    onChange: () => handleSelection(!isSelected, data),
                };
            },
            columnWidth: 48,
        };
        const createdAtColumn: TableColumn<
        Lead, number, DateOutputProps, TableHeaderCellProps
        > = {
            id: 'created_at',
            title: 'Created at',
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
        const publisherColumn: TableColumn<
        Lead, number, LinkProps, TableHeaderCellProps
        > = {
            id: 'source',
            title: 'Publisher',
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
        const publishedOnColumn: TableColumn<
        Lead, number, DateOutputProps, TableHeaderCellProps
        > = {
            id: 'published_on',
            title: 'Published Date',
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

        return ([
            selectColumn,
            createdAtColumn,
            createStringColumn<Lead, number>(
                'title',
                'Title',
                item => item?.title,
                {
                    sortable: true,
                    columnClassName: styles.titleColumn,
                },
            ),
            publisherColumn,
            createStringColumn<Lead, number>(
                'authorsDetail',
                'Authors',
                item => item?.authorsDetail.map(v => v.title).join(','),
                {
                    sortable: false,
                    columnWidth: 144,
                },
            ),
            publishedOnColumn,
            createNumberColumn<Lead, number>(
                'filtered_entries_count',
                'No of entries',
                item => item?.entriesCount,
                {
                    sortable: true,
                },
            ),
        ]);
    }, [
        handleSelectAll,
        handleSelection,
        selectedLeads,
        selectAll,
    ]);

    return (
        <div className={_cs(className, styles.leadsSelection)}>
            <CombinedSourceEntryFilterForm
                className={styles.sourceEntryFilter}
                onFilterApply={onFilterApply}
                filters={entriesFilters}
                widgets={entriesWidgets}
                entryOptions={entryOptions}
                projectId={projectId}
            />
            <div className={styles.tableContainer}>
                {leadsPending && (<PendingMessage />)}
                <SortContext.Provider value={sortState}>
                    <Table
                        data={leadsResponse?.results}
                        keySelector={leadsKeySelector}
                        columns={columns}
                        variant="large"
                    />
                </SortContext.Provider>
            </div>
            <Pager
                activePage={activePage}
                itemsCount={leadsResponse?.count ?? 0}
                maxItemsPerPage={maxItemsPerPage}
                onActivePageChange={setActivePage}
                itemsPerPageControlHidden
            />
        </div>
    );
}

export default LeadsSelection;
