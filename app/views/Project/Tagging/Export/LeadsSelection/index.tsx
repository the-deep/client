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
    SortContext,
    useSortState,
    Checkbox,
    CheckboxProps,
} from '@the-deep/deep-ui';

import { useRequest } from '#base/utils/restRequest';
import _ts from '#ts';
import {
    FilterFields,
    Lead,
    MultiResponse,
    WidgetElement,
    EntryOptions,
} from '#types';

import { SourceEntryFilter } from '../types';
import CombinedSourceEntryFilterForm from './CombinedSourceEntryFilterForm';
import styles from './styles.css';

const defaultSorting = {
    name: 'created_at',
    direction: 'asc',
};

const leadsKeySelector: (d: Lead) => number = (d) => d.id;
const maxItemsPerPage = 10;

interface Props {
    className?: string;
    pending?: boolean;
    projectId: number;
    filterOnlyUnprotected: boolean;
    entriesFilters?: FilterFields[];
    entriesWidgets?: WidgetElement<unknown>[];
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

    const leadsRequestBody = useMemo(() => ({
        custom_filters: !hasAssessment ? 'exclude_empty_filtered_entries' : '',
        ordering,
        project: [projectId],
        ...filterValues,
        exits: hasAssessment ? 'assessment_exists' : undefined,
        confidentiality: filterOnlyUnprotected ? ['unprotected'] : undefined,
    }), [
        ordering,
        projectId,
        filterValues,
        hasAssessment,
        filterOnlyUnprotected,
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

    const handleSelection = useCallback((_: boolean, id: number) => {
        const isSelected = selectedLeads.includes(id);
        if (isSelected) {
            onSelectLeadChange(selectedLeads.filter((v) => v !== id));
        } else {
            onSelectLeadChange([...selectedLeads, id]);
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
                    onChange: handleSelection,
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
                (item) => item?.title,
                {
                    sortable: true,
                    columnClassName: styles.titleColumn,
                },
            ),
            createStringColumn<Lead, number>(
                'source',
                'Publisher',
                (item) => item?.sourceDetail?.title ?? item?.sourceRaw,
                {
                    sortable: true,
                    columnWidth: 160,
                },
            ),
            createStringColumn<Lead, number>(
                'authorsDetail',
                'Authors',
                (item) => item?.authorsDetail.map((v) => v.title).join(','),
                {
                    sortable: false,
                    columnWidth: 144,
                },
            ),
            publishedOnColumn,
            createNumberColumn<Lead, number>(
                'filtered_entries_count',
                'No of entries',
                (item) => item?.entriesCount,
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
                hasAssessment={hasAssessment}
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
                className={styles.footer}
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
