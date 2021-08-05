import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import AccentButton from '#rsca/Button/AccentButton';
import FormattedDate from '#rscv/FormattedDate';
import RawTable from '#rscv/RawTable';
import Pager from '#rscv/Pager';
import TableHeader from '#rscv/TableHeader';
import { getCombinedLeadFilters } from '#entities/lead';
import { useRequest } from '#utils/request';

import _ts from '#ts';
import {
    FilterFields,
    Lead,
    MultiResponse,
    WidgetElement,
    GeoOptions,
    ProjectDetails,
} from '#typings';
import { Header } from '#rscv/Table';

import { FaramValues } from '../ExportSelection';
import FilterForm from './FilterForm';
import styles from './styles.scss';

interface ComponentProps {
    pending?: boolean;
    projectId: number;
    filterOnlyUnprotected: boolean;
    className?: string;
    entriesFilters?: FilterFields[];
    entriesWidgets?: WidgetElement<unknown>[];
    projectRegions?: ProjectDetails['regions'];
    entriesGeoOptions?: GeoOptions;
    hasAssessment?: boolean;
    onSelectLeadChange: (values: number[]) => void;
    selectedLeads: number[];
    selectAll: boolean;
    onSelectAllChange: (v: boolean) => void;
    filterValues: FaramValues;
    handleFilterValuesChange: (filter: FaramValues) => void;
}

const leadKeyExtractor = (d: Lead) => d.id;
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
        selectedLeads,
        onSelectLeadChange,
        selectAll,
        onSelectAllChange,
        filterValues,
        handleFilterValuesChange,
        pending,
    } = props;

    const [activeSort, setActiveSort] = useState<string>('-created_at');
    const [activePage, setActivePage] = useState<number>(1);
    const [filterOptionsPending, setFilterOptionsPending] = useState(true);

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
        ordering: activeSort,
        project: [projectId],
        ...sanitizedFilters,
    }), [
        activeSort,
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
        skip: pending || filterOptionsPending,
        body: leadsRequestBody,
        failureHeader: _ts('export', 'leadsLabel'),
    });

    const isDisabled = leadsResponse?.results.length === 0;

    const handleSelectLeadChange = useCallback((key: number, value: boolean) => {
        if (value) {
            onSelectLeadChange([...selectedLeads, key]);
        } else {
            onSelectLeadChange(selectedLeads.filter(v => v !== key));
        }
    }, [onSelectLeadChange, selectedLeads]);

    const handleSelectAllChange = useCallback(() => {
        onSelectAllChange(!selectAll);
        onSelectLeadChange([]);
    }, [onSelectAllChange, onSelectLeadChange, selectAll]);

    const headers: Header<Lead>[] = useMemo(() => ([
        {
            key: 'select',
            label: '',
            order: 1,
            sortable: false,
            modifier: (d: Lead) => {
                const key = leadKeyExtractor(d);
                const isSelected = selectedLeads.some(v => v === key);

                let title: string;
                let icon: string;
                if (selectAll) {
                    title = !isSelected
                        ? _ts('export.leadsTable', 'unselectLeadTitle')
                        : _ts('export.leadsTable', 'selectLeadTitle');
                    icon = !isSelected
                        ? 'checkbox'
                        : 'checkboxOutlineBlank';
                } else {
                    title = isSelected
                        ? _ts('export.leadsTable', 'unselectLeadTitle')
                        : _ts('export.leadsTable', 'selectLeadTitle');

                    icon = isSelected
                        ? 'checkbox'
                        : 'checkboxOutlineBlank';
                }

                return (
                    <AccentButton
                        title={title}
                        iconName={icon}
                        onClick={() => handleSelectLeadChange(key, !isSelected)}
                        smallVerticalPadding
                        transparent
                    />
                );
            },
        },
        {
            key: 'created_at',
            label: _ts('export', 'createdAtLabel'),
            order: 2,
            sortable: true,
            modifier: (row: Lead) => (
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
        },
        {
            key: 'source',
            label: _ts('export', 'sourceDetailLabel'),
            order: 4,
            sortable: true,
            modifier: (a: Lead) => a?.sourceDetail?.title,
        },
        {
            key: 'authorsDetail',
            label: _ts('export', 'authoursDetailLabel'),
            order: 5,
            sortable: false,
            modifier: (d: Lead) => d?.authorsDetail.map(a => a.title).join(', '),
        },
        {
            key: 'published_on',
            label: _ts('export', 'publishedOnLabel'),
            order: 6,
            sortable: true,
            modifier: (row: Lead) => row.publishedOn,
        },
        {
            key: 'filtered_entries_count',
            label: _ts('export', 'entriesCountLabel'),
            order: 7,
            sortable: true,
            modifier: (row: Lead) => row.filteredEntriesCount,
        },
    ]), [
        handleSelectLeadChange,
        selectedLeads,
        selectAll,
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
        if (headerData.key === 'select') {
            const title = !selectAll
                ? _ts('export.leadsTable', 'unselectAllLeadsTitle')
                : _ts('export.leadsTable', 'selectAllLeadsTitle');

            const icon = selectAll
                ? 'checkbox'
                : 'checkboxOutlineBlank';

            return (
                <AccentButton
                    className={styles.selectAllCheckbox}
                    title={title}
                    iconName={icon}
                    onClick={handleSelectAllChange}
                    smallVerticalPadding
                    transparent
                    disabled={isDisabled}
                />
            );
        }
        return (
            <TableHeader
                label={headerData.label}
                sortOrder={sortOrder}
                sortable={headerData.sortable}
            />
        );
    }, [activeSort, handleSelectAllChange, isDisabled, selectAll]);

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
                onChange={handleFilterValuesChange}
                setFiltersPending={setFilterOptionsPending}
                hasAssessment={hasAssessment}
            />
            <RawTable
                data={leadsResponse?.results ?? []}
                dataModifier={dataModifier}
                headerModifier={headerModifier}
                headers={headers}
                onHeaderClick={handleTableHeaderClick}
                keySelector={leadKeyExtractor}
                className={styles.table}
                pending={leadsPending && (leadsResponse?.results ?? []).length < 1}
            />
            <Pager
                activePage={activePage}
                className={styles.pager}
                itemsCount={leadsResponse?.count}
                maxItemsPerPage={maxItemsPerPage}
                onPageClick={setActivePage}
                showItemsPerPageChange={false}
            />
        </div>
    );
}

export default LeadsSelection;
