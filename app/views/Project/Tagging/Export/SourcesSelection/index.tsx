import React, { useCallback, useState, useMemo } from 'react';
import {
    _cs,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import {
    DateOutput,
    Pager,
    TableView,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
    createStringColumn,
    DateOutputProps,
    SortContext,
    useSortState,
    Checkbox,
    CheckboxProps,
} from '@the-deep/deep-ui';
import { EntriesAsList } from '@togglecorp/toggle-form';
import { useQuery, gql } from '@apollo/client';

import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';
import {
    LeadOrderingEnum,
    ProjectSourceListQuery,
    ProjectSourceListQueryVariables,
} from '#generated/types';
import { isFiltered } from '#utils/common';
import SourcesFilter, { getProjectSourcesQueryVariables } from '../../Sources/SourcesFilter';
import { PartialFormType, FormType as FilterFormType } from '../../Sources/SourcesFilter/schema';
import styles from './styles.css';

type Project = NonNullable<ProjectSourceListQuery['project']>;
type Lead = NonNullable<NonNullable<NonNullable<Project['leads']>['results']>[number]>;

const defaultSorting = {
    name: 'CREATED_AT',
    direction: 'Descending',
};

function leadsKeySelector(d: Lead) {
    return d.id;
}
const maxItemsPerPage = 10;

const PROJECT_LEADS = gql`
    query ProjectSourceList(
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $ordering: [LeadOrderingEnum!],
        $assignees: [ID!],
        $createdBy: [ID!],
        $authoringOrganizationTypes: [ID!],
        $confidentiality: LeadConfidentialityEnum,
        $createdAtGte: DateTime,
        $createdAtLte: DateTime,
        $emmEntities: String,
        $emmKeywords: String,
        $emmRiskFactors: String,
        $priorities: [LeadPriorityEnum!],
        $publishedOnGte: Date,
        $publishedOnLte: Date,
        $search: String,
        $statuses: [LeadStatusEnum!],
        $sourceOrganizations: [ID!],
        $authorOrganizations: [ID!],
        $entriesFilterData: LeadEntriesFilterData,
        $hasEntries: Boolean,
        $hasAssessment: Boolean,
    ) {
        project(id: $projectId) {
            id
            leads (
                page: $page,
                pageSize: $pageSize,
                ordering: $ordering,
                assignees: $assignees,
                createdBy: $createdBy,
                authoringOrganizationTypes: $authoringOrganizationTypes,
                confidentiality: $confidentiality,
                createdAtGte: $createdAtGte,
                createdAtLte: $createdAtLte,
                emmEntities: $emmEntities,
                emmKeywords: $emmKeywords,
                emmRiskFactors: $emmRiskFactors,
                priorities: $priorities,
                publishedOnGte: $publishedOnGte,
                publishedOnLte: $publishedOnLte,
                search: $search,
                statuses: $statuses,
                sourceOrganizations: $sourceOrganizations,
                authorOrganizations: $authorOrganizations,
                entriesFilterData: $entriesFilterData,
                hasEntries: $hasEntries,
                hasAssessment: $hasAssessment,
            ) {
                totalCount
                page
                pageSize
                results {
                    id
                    clientId
                    createdAt
                    title
                    publishedOn
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
                    entriesCount {
                        total
                    }
                    filteredEntriesCount
                    leadPreview {
                        pageCount
                    }
                    isAssessmentLead
                }
            }
        }
    }
`;

interface Props {
    className?: string;
    projectId: string;
    filterOnlyUnprotected: boolean;
    hasAssessment?: boolean;
    onSelectLeadChange: (values: string[]) => void;
    selectedLeads: string[];
    selectAll: boolean;
    onSelectAllChange: (v: boolean) => void;
    filterValues: PartialFormType;
    onFilterApply: (...entries: EntriesAsList<PartialFormType>) => void;
}

function SourcesSelection(props: Props) {
    const {
        projectId,
        className,
        selectedLeads,
        onSelectLeadChange,
        selectAll,
        onSelectAllChange,
        filterValues,
        onFilterApply,
        filterOnlyUnprotected,
        hasAssessment = false,
    } = props;

    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = validSorting.direction === 'Ascending'
        ? `ASC_${validSorting.name}`
        : `DESC_${validSorting.name}`;

    const [activePage, setActivePage] = useState<number>(1);

    const filters = useMemo(() => (
        getProjectSourcesQueryVariables(filterValues as Omit<FilterFormType, 'projectId'>)
    ), [filterValues]);

    const variables = useMemo(
        (): ProjectSourceListQueryVariables | undefined => (
            (projectId) ? {
                ...filters,
                projectId,
                page: activePage,
                pageSize: maxItemsPerPage,
                ordering: [ordering as LeadOrderingEnum],
            } : undefined
        ),
        [projectId, activePage, ordering, filters],
    );

    const {
        previousData,
        data: projectSourcesResponse = previousData,
        loading: projectSourcesPending,
    } = useQuery<ProjectSourceListQuery, ProjectSourceListQueryVariables>(
        PROJECT_LEADS,
        {
            skip: isNotDefined(variables),
            variables,
        },
    );

    const handleSourcesFiltersValueChange = useCallback(
        (...value: EntriesAsList<PartialFormType>) => {
            setActivePage(1);
            onFilterApply(...value);
        },
        [onFilterApply, setActivePage],
    );

    const handleSelectAll = useCallback((value: boolean) => {
        onSelectAllChange(value);
        onSelectLeadChange([]);
    }, [onSelectAllChange, onSelectLeadChange]);

    const handleSelection = useCallback((_: boolean, id: string) => {
        const isSelected = selectedLeads.includes(id);
        if (isSelected) {
            onSelectLeadChange(selectedLeads.filter((v) => v !== id));
        } else {
            onSelectLeadChange([...selectedLeads, id]);
        }
    }, [onSelectLeadChange, selectedLeads]);

    const columns = useMemo(() => {
        const selectColumn: TableColumn<
        Lead, string, CheckboxProps<string>, CheckboxProps<string>
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
        Lead, string, DateOutputProps, TableHeaderCellProps
        > = {
            id: 'CREATED_AT',
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
        Lead, string, DateOutputProps, TableHeaderCellProps
        > = {
            id: 'PUBLISHED_ON',
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
            createStringColumn<Lead, string>(
                'TITLE',
                'Title',
                (item) => item?.title,
                {
                    sortable: true,
                    columnClassName: styles.titleColumn,
                },
            ),
            createStringColumn<Lead, string>(
                'SOURCE',
                'Publisher',
                (item) => (item.source ? organizationTitleSelector(item.source) : undefined),
                {
                    sortable: true,
                    columnWidth: 160,
                },
            ),
            createStringColumn<Lead, string>(
                'authors',
                'Authors',
                (item) => item?.authors?.map((v) => organizationTitleSelector(v)).filter(isDefined).join(','),
                {
                    sortable: false,
                    columnWidth: 144,
                },
            ),
            publishedOnColumn,
            createStringColumn<Lead, string>(
                'ENTRIES_COUNT',
                'No of entries',
                (item) => {
                    if (isDefined(item.filteredEntriesCount)) {
                        return `${item.filteredEntriesCount}/${item.entriesCount?.total}`;
                    }
                    return item.entriesCount?.total?.toString();
                },
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
            <SourcesFilter
                className={styles.sourceEntryFilter}
                onChange={handleSourcesFiltersValueChange}
                projectId={projectId}
                filterOnlyUnprotected={filterOnlyUnprotected}
                value={filterValues}
                hideEntriesFilter={hasAssessment}
            />
            <div className={styles.tableContainer}>
                <SortContext.Provider value={sortState}>
                    <TableView
                        data={projectSourcesResponse?.project?.leads?.results}
                        pending={projectSourcesPending}
                        errored={false}
                        filtered={isFiltered(filterValues)}
                        emptyMessage="Looks like there are no sources that match your filtering criteria."
                        keySelector={leadsKeySelector}
                        columns={columns}
                        variant="large"
                        messageShown
                        messageIconShown
                        filteredEmptyMessage="No matching sources found."
                    />
                </SortContext.Provider>
                <Pager
                    className={styles.footer}
                    activePage={activePage}
                    itemsCount={projectSourcesResponse?.project?.leads?.totalCount ?? 0}
                    maxItemsPerPage={maxItemsPerPage}
                    onActivePageChange={setActivePage}
                    itemsPerPageControlHidden
                />
            </div>
        </div>
    );
}

export default SourcesSelection;
