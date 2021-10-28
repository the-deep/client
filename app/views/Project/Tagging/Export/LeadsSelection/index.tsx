import React, { useCallback, useState, useMemo } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
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
import { useQuery, gql } from '@apollo/client';

import {
    ProjectSourcesQuery,
    ProjectSourcesQueryVariables,
    SourceFilterOptionsQueryVariables,
} from '#generated/types';
import SourcesFilter from '../../Sources/SourcesFilter';
import styles from './styles.css';

type Project = NonNullable<ProjectSourcesQuery['project']>;
type Lead = NonNullable<NonNullable<NonNullable<Project['leads']>['results']>[number]>;

const defaultSorting = {
    name: 'createdAt',
    direction: 'Ascending',
};

function leadsKeySelector(d: Lead) {
    return d.id;
}
const maxItemsPerPage = 10;

export const PROJECT_LEADS = gql`
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
        $customFilters: LeadCustomFilterEnum,
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

interface Props {
    className?: string;
    projectId: string;
    filterOnlyUnprotected: boolean; // TODO handle this
    hasAssessment?: boolean; // TODO handle this
    onSelectLeadChange: (values: string[]) => void;
    selectedLeads: string[];
    selectAll: boolean;
    onSelectAllChange: (v: boolean) => void;
    filterValues: Omit<SourceFilterOptionsQueryVariables, 'projectId'>;
    onFilterApply: (value: Omit<SourceFilterOptionsQueryVariables, 'projectId'>) => void;
}

function LeadsSelection(props: Props) {
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
        hasAssessment, // TODO If hasAssessment don't show entry filters
    } = props;

    console.warn('filterOnlyUnprotected', filterOnlyUnprotected, hasAssessment);
    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = validSorting.direction === 'Ascending'
        ? validSorting.name
        : `-${validSorting.name}`;

    const [activePage, setActivePage] = useState<number>(1);

    const variables = useMemo(
        (): ProjectSourcesQueryVariables | undefined => (
            (projectId) ? {
                ...filterValues,
                projectId,
                page: activePage,
                pageSize: maxItemsPerPage,
                ordering,
            } : undefined
        ),
        [projectId, activePage, ordering, filterValues],
    );

    const {
        data: projectSourcesResponse,
        loading: projectSourcesPending,
    } = useQuery<ProjectSourcesQuery, ProjectSourcesQueryVariables>(
        PROJECT_LEADS,
        {
            skip: isNotDefined(variables),
            variables,
        },
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
            id: 'createdAt',
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
            id: 'publishedOn',
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
                'title',
                'Title',
                (item) => item?.title,
                {
                    sortable: true,
                    columnClassName: styles.titleColumn,
                },
            ),
            createStringColumn<Lead, string>(
                'source',
                'Publisher',
                (item) => item?.source?.title ?? item?.source?.mergedAs?.title,
                {
                    sortable: true,
                    columnWidth: 160,
                },
            ),
            createStringColumn<Lead, string>(
                'authors',
                'Authors',
                (item) => item?.authors?.map((v) => v.title ?? v.mergedAs?.title).join(','),
                {
                    sortable: false,
                    columnWidth: 144,
                },
            ),
            publishedOnColumn,
            createNumberColumn<Lead, string>(
                'entriesCounts',
                'No of entries',
                (item) => item?.entriesCounts?.total,
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
                onFilterApply={onFilterApply}
                projectId={projectId}
            />
            <div className={styles.tableContainer}>
                {projectSourcesPending && (<PendingMessage />)}
                <SortContext.Provider value={sortState}>
                    <Table
                        data={projectSourcesResponse?.project?.leads?.results}
                        keySelector={leadsKeySelector}
                        columns={columns}
                        variant="large"
                    />
                </SortContext.Provider>
            </div>
            <Pager
                className={styles.footer}
                activePage={activePage}
                itemsCount={projectSourcesResponse?.project?.leads?.totalCount ?? 0}
                maxItemsPerPage={maxItemsPerPage}
                onActivePageChange={setActivePage}
                itemsPerPageControlHidden
            />
        </div>
    );
}

export default LeadsSelection;
