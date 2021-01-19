import React, { useEffect, useCallback, useState, useMemo } from 'react';
import produce from 'immer';
import {
    compareString,
    compareNumber,
    compareDate,
    _cs,
} from '@togglecorp/fujs';

import AccentButton from '#rsca/Button/AccentButton';
import FormattedDate from '#rscv/FormattedDate';
import RawTable from '#rscv/RawTable';
import Pager from '#rscv/Pager';
import TableHeader from '#rscv/TableHeader';
import { getCombinedLeadFilters } from '#entities/lead';
import useRequest from '#utils/request';

import _ts from '#ts';
import {
    FilterFields,
    Lead,
    MultiResponse,
    WidgetElement,
    FaramValues,
    GeoOptions,
} from '#typings';
import { notifyOnFailure } from '#utils/requestNotify';
import { Header } from '#rscv/Table';

import FilterForm from './FilterForm';
import styles from './styles.scss';

export interface SelectedLead extends Lead {
    selected: boolean;
}

interface ComponentProps {
    pending?: boolean;
    projectId: number;
    filterOnlyUnprotected: boolean;
    className?: string;
    entriesFilters?: FilterFields[];
    entriesWidgets?: WidgetElement<unknown>[];
    projectRegions?: unknown[];
    entriesGeoOptions?: GeoOptions;
    hasAssessment?: boolean;
    setSelectedLeads: (v: number[]) => void;
}

const leadKeyExtractor = (d: SelectedLead) => d.id;
const maxItemsPerPage = 10;

function LeadsSelection(props: ComponentProps) {
    const {
        projectId,
        className,
        filterOnlyUnprotected,
        entriesFilters,
        entriesWidgets,
        projectRegions,
        entriesGeoOptions,
        hasAssessment,
        setSelectedLeads,
    } = props;

    const [leads, setLeads] = useState<SelectedLead[]>([]);
    const [leadsCount, setLeadsCount] = useState<number>(0);
    const [activeSort, setActiveSort] = useState<string>('-created_at');
    const [activePage, setActivePage] = useState<number>(1);
    const [filterValues, onFilterChange] = useState<FaramValues>({});

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
        custom_filters: 'exclude_empty_filtered_entries',
        project: [projectId],
        ...sanitizedFilters,
    }), [projectId, sanitizedFilters]);

    const [
        pending,
    ] = useRequest<MultiResponse<Lead>>({
        url: 'server://v2/leads/filter/',
        method: 'POST',
        query: {
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
            ordering: activeSort,
            is_preview: false,
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        autoTrigger: true,
        body: leadsRequestBody,
        onSuccess: (response) => {
            const newLeads: SelectedLead[] = [];
            (response.results || []).forEach((l) => {
                newLeads.push({
                    selected: true,
                    ...l,
                });
            });
            setLeadsCount(response.count);
            setLeads(newLeads);
        },
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('export', 'leadsLabel'))({ error: errorBody });
        },
    });

    const areSomeNotSelected = leads.some(l => !l.selected);
    const isDisabled = leads.length === 0;

    const handleSelectLeadChange = useCallback((key: number, value: boolean) => {
        setLeads((oldLeads) => {
            const newLeads = produce(oldLeads, (safeLeads) => {
                const index = safeLeads.findIndex(d => d.id === key);
                if (index !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeLeads[index].selected = value;
                }
            });
            return newLeads;
        });
    }, []);

    const handleSelectAllLeads = useCallback((selectAll: boolean) => (
        setLeads((oldLeads) => {
            const newLeads = oldLeads.map(l => ({
                ...l,
                selected: selectAll,
            }));
            return newLeads;
        })
    ), []);

    const headers: Header<Lead>[] = useMemo(() => ([
        {
            key: 'select',
            labelModifier: () => {
                const title = areSomeNotSelected
                    ? _ts('export.leadsTable', 'selectAllLeadsTitle')
                    : _ts('export.leadsTable', 'unselectAllLeadsTitle');

                const icon = areSomeNotSelected
                    ? 'checkboxOutlineBlank'
                    : 'checkbox';

                return (
                    <AccentButton
                        className={styles.selectAllCheckbox}
                        title={title}
                        iconName={icon}
                        onClick={() => handleSelectAllLeads(areSomeNotSelected)}
                        smallVerticalPadding
                        transparent
                        disabled={isDisabled}
                    />
                );
            },
            order: 1,
            sortable: false,
            modifier: (d: SelectedLead) => {
                const key = leadKeyExtractor(d);

                const title = !d.selected
                    ? _ts('export.leadsTable', 'selectLeadTitle')
                    : _ts('export.leadsTable', 'unselectLeadTitle');

                const icon = !d.selected
                    ? 'checkboxOutlineBlank'
                    : 'checkbox';

                return (
                    <AccentButton
                        title={title}
                        iconName={icon}
                        onClick={() => handleSelectLeadChange(key, !d.selected)}
                        smallVerticalPadding
                        transparent
                    />
                );
            },
        },
        {
            key: 'createdAt',
            label: _ts('export', 'createdAtLabel'),
            order: 2,
            sortable: true,
            comparator: (a: SelectedLead, b: SelectedLead) => (
                compareDate(a.createdAt, b.createdAt) ||
                compareString(a.title, b.title)
            ),
            modifier: (row: SelectedLead) => (
                <FormattedDate
                    value={row.createdAt}
                    mode="dd-MM-yyyy hh:mm"
                />
            ),
        },
        {
            key: 'title',
            label: _ts('export', 'titleLabel'),
            order: 3,
            sortable: true,
            comparator: (a: SelectedLead, b: SelectedLead) => compareString(a.title, b.title),
        },
        {
            key: 'sourceDetail',
            label: _ts('export', 'sourceDetailLabel'),
            order: 4,
            sortable: true,
            modifier: (a: SelectedLead) => a?.sourceDetail?.title,
            comparator: (a: SelectedLead, b: SelectedLead) =>
                compareString(a?.sourceDetail?.title, b?.sourceDetail?.title) ||
                compareString(a.title, b.title),
        },
        {
            key: 'authorsDetail',
            label: _ts('export', 'authoursDetailLabel'),
            order: 5,
            sortable: false,
            modifier: (d: SelectedLead) => d?.authorsDetail.map(a => a.title).join(', '),
        },
        {
            key: 'publishedOn',
            label: _ts('export', 'publishedOnLabel'),
            order: 6,
            sortable: true,
            comparator: (a: SelectedLead, b: SelectedLead) => (
                compareDate(a.publishedOn, b.publishedOn) ||
                compareString(a.title, b.title)
            ),
        },
        {
            key: 'filteredEntriesCount',
            label: _ts('export', 'entriesCountLabel'),
            order: 7,
            sortable: true,
            comparator: (a: SelectedLead, b: SelectedLead) => (
                compareNumber(a.entriesCount, b.entriesCount) ||
                compareString(a.title, b.title)
            ),
        },
    ]), [
        handleSelectLeadChange,
        handleSelectAllLeads,
        areSomeNotSelected,
        isDisabled,
    ]);

    const dataModifier = useCallback(
        (data, columnKey) => {
            const header = headers.find(d => d.key === columnKey);
            if (header?.modifier) {
                return header.modifier(data);
            }
            return data[columnKey];
        }, [headers],
    );

    const headerModifier = useCallback((headerData) => {
        let sortOrder: 'asc' | 'dsc' | undefined;
        if (activeSort === headerData.key) {
            sortOrder = 'asc';
        } else if (activeSort === `-${headerData.key}`) {
            sortOrder = 'dsc';
        }
        return (
            <TableHeader
                label={headerData.label}
                sortOrder={sortOrder}
                sortable={headerData.sortable}
            />
        );
    }, [activeSort]);

    const handleTableHeaderClick = useCallback(
        (key) => {
            const headerData = headers.find(h => h.key === key);
            // prevent click on 'actions' column
            if (!headerData || !headerData.sortable) {
                return;
            }

            let tmpActiveSort = activeSort;

            const isAsc = tmpActiveSort?.charAt(0) !== '-';

            const isCurrentHeaderSorted = tmpActiveSort === key
                || (tmpActiveSort?.substr(1) === key && !isAsc);

            if (isCurrentHeaderSorted) {
                tmpActiveSort = isAsc ? `-${key}` : key;
            } else {
                tmpActiveSort = headerData.defaultSortOrder === 'dsc' ? `-${key}` : key;
            }

            setActiveSort(tmpActiveSort);
        }, [headers, activeSort, setActiveSort],
    );

    useEffect(() => {
        setSelectedLeads(leads.filter(v => v.selected).map(v => v.id));
    }, [setSelectedLeads, leads]);

    return (
        <div className={_cs(className, styles.leadsTable)}>
            <FilterForm
                projectId={projectId}
                filterOnlyUnprotected={filterOnlyUnprotected}
                filterValues={filterValues}
                entriesFilters={entriesFilters}
                entriesWidgets={entriesWidgets}
                geoOptions={entriesGeoOptions}
                regions={projectRegions}
                onChange={onFilterChange}
                hasAssessment={hasAssessment}
            />
            <RawTable
                data={leads}
                dataModifier={dataModifier}
                headerModifier={headerModifier}
                headers={headers}
                onHeaderClick={handleTableHeaderClick}
                keySelector={leadKeyExtractor}
                className={styles.table}
                pending={pending && leads.length < 1}
            />
            <Pager
                activePage={activePage}
                className={styles.pager}
                itemsCount={leadsCount}
                maxItemsPerPage={maxItemsPerPage}
                onPageClick={setActivePage}
                showItemsPerPageChange={false}
            />
        </div>
    );
}

export default LeadsSelection;
