import React, { useState, useMemo, ReactElement, useCallback } from 'react';
import { _cs, isNotDefined, isDefined } from '@togglecorp/fujs';
import { VscLoading } from 'react-icons/vsc';
import { IoDownloadOutline, IoClose, IoSearch } from 'react-icons/io5';
import { RiFileExcel2Fill, RiFileWord2Fill } from 'react-icons/ri';
import { AiOutlineRedo, AiOutlineFileText } from 'react-icons/ai';
import { FaFilePdf } from 'react-icons/fa';
import {
    Pager,
    TableView,
    TableColumn,
    useAlert,
    Container,
    PendingMessage,
    TableHeaderCell,
    TableHeaderCellProps,
    createStringColumn,
    SortContext,
    useSortState,
    IconsProps,
    Kraken,
    Icons,
    TextInput,
    DateRangeInput,
} from '@the-deep/deep-ui';
import { useQuery, gql, useMutation } from '@apollo/client';

import {
    ProjectExportsQuery,
    ProjectExportsQueryVariables,
    ExportDataTypeEnum,
    DeleteExportMutation,
    DeleteExportMutationVariables,
} from '#generated/types';
import {
    convertDateToIsoDateTime,
} from '#utils/common';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { createDateColumn } from '#components/tableHelpers';
import LeadPreview from '#components/lead/LeadPreview';

import _ts from '#ts';

import TableActions, { Props as TableActionsProps } from './TableActions';
import Status, { Props as StatusProps } from './Status';
import styles from './styles.css';

type ExportItem = NonNullable<NonNullable<NonNullable<NonNullable<ProjectExportsQuery['project']>['exports']>>['results']>[number];

const statusIconMap: Record<ExportItem['status'], ReactElement> = {
    PENDING: <VscLoading />,
    STARTED: <VscLoading />,
    SUCCESS: <IoDownloadOutline />,
    FAILURE: <IoClose />,
    CANCELED: <AiOutlineRedo />,
};
const statusVariantMap: Record<ExportItem['status'], 'default' | 'accent' | 'complement1' | 'complement2'> = {
    PENDING: 'default',
    STARTED: 'default',
    SUCCESS: 'accent',
    FAILURE: 'complement1',
    CANCELED: 'complement2',
};
const statusLabelMap: Record<ExportItem['status'], string> = {
    PENDING: 'In queue to be exported',
    STARTED: 'Generating the file',
    SUCCESS: 'Download',
    FAILURE: 'Failed',
    CANCELED: 'Canceled',
};
const exportFormatIconMap: Record<ExportItem['format'], ReactElement> = {
    DOCX: <RiFileWord2Fill className={styles.word} />,
    PDF: <FaFilePdf className={styles.pdf} />,
    XLSX: <RiFileExcel2Fill className={styles.excel} />,
    JSON: <AiOutlineFileText className={styles.json} />,
};
const maxItemsPerPage = 25;
const pollInterval = 5000;
const defaultSorting = {
    name: 'exportedAt',
    direction: 'asc',
};

function exportKeySelector(d: ExportItem) {
    return d.id;
}

interface DateRangeValue {
    startDate: string;
    endDate: string;
}

const PROJECT_EXPORTS = gql`
    query ProjectExports(
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $ordering: String,
        $exportedAtGte: DateTime,
        $exportedAtLte: DateTime,
        $search: String,
        $type: [ExportDataTypeEnum!],
    ) {
        project(id: $projectId) {
            id
            exports (
                page: $page,
                pageSize: $pageSize,
                ordering: $ordering,
                exportedAtGte: $exportedAtGte,
                exportedAtLte: $exportedAtLte,
                search: $search,
                type: $type,
            ) {
                totalCount
                page
                pageSize
                results {
                    id
                    title
                    exportType
                    exportedAt
                    status
                    format
                    file {
                        name
                        url
                    }
                }
            }
        }
    }
`;

const DELETE_EXPORT = gql`
    mutation DeleteExport(
        $projectId: ID!,
        $exportId: ID!,
    ) {
        project(id: $projectId) {
            id
            exportDelete(id: $exportId) {
                ok
                errors
            }
        }
    }
`;

const debounceTime = 500;

interface Props {
    projectId: string;
    className?: string;
    type: ExportDataTypeEnum[];
}

function ExportHistory(props: Props) {
    const {
        className,
        projectId,
        type,
    } = props;

    const [selectedExport, setSelectedExport] = useState<ExportItem>();
    const [activePage, setActivePage] = useState(1);
    const [exportedAt, setExportedAt] = useState<DateRangeValue>();
    const [searchText, setSearchText] = useState<string>();
    const debouncedSearchText = useDebouncedValue(searchText, debounceTime);

    const alert = useAlert();
    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = useMemo(() => (
        validSorting.direction === 'Ascending'
            ? validSorting.name
            : `-${validSorting.name}`
    ), [validSorting]);

    const variables = useMemo(
        (): ProjectExportsQueryVariables | undefined => (
            (projectId) ? {
                projectId,
                page: activePage,
                pageSize: maxItemsPerPage,
                ordering,
                exportedAtGte: convertDateToIsoDateTime(exportedAt?.startDate),
                exportedAtLte: convertDateToIsoDateTime(
                    exportedAt?.endDate,
                    { endOfDay: true },
                ),
                search: debouncedSearchText,
                type,
            } : undefined
        ),
        [
            projectId,
            activePage,
            ordering,
            type,
            exportedAt,
            debouncedSearchText,
        ],
    );

    const {
        previousData,
        data: projectExportsResponse = previousData,
        loading: projectExportsPending,
        refetch: getProjectExports,
        startPolling,
        stopPolling,
    } = useQuery<ProjectExportsQuery, ProjectExportsQueryVariables>(
        PROJECT_EXPORTS,
        {
            skip: isNotDefined(variables),
            variables,
            onCompleted: (response) => {
                if (response.project?.exports?.results?.some((v) => (
                    v.status === 'PENDING'
                    || v.status === 'STARTED'
                ))) {
                    startPolling(pollInterval);
                } else {
                    stopPolling();
                }
            },
        },
    );

    const [
        deleteExport,
        {
            loading: deleteExportPending,
        },
    ] = useMutation<DeleteExportMutation, DeleteExportMutationVariables>(
        DELETE_EXPORT,
        {
            onCompleted: (response) => {
                if (response?.project?.exportDelete?.ok) {
                    alert.show(
                        _ts('export', 'deleteExportSuccess'),
                        { variant: 'success' },
                    );
                    getProjectExports();
                } else {
                    alert.show(
                        'Failed to delete export.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: (gqlError) => {
                alert.show(
                    gqlError.message,
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const handleDeleteExport = useCallback((data: ExportItem) => {
        if (data.id === selectedExport?.id) {
            setSelectedExport(undefined);
        }
        deleteExport({
            variables: {
                projectId,
                exportId: data.id,
            },
        });
    }, [deleteExport, projectId, selectedExport]);

    const columns = useMemo(() => {
        const exportTypeColumn: TableColumn<
        ExportItem, string, IconsProps, TableHeaderCellProps
        > = {
            id: 'format',
            title: 'Export Type',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: Icons,
            cellRendererClassName: styles.icons,
            columnWidth: '120px',
            cellRendererParams: (_, data) => ({
                children: (
                    exportFormatIconMap[data.format]
                ),
            }),
        };
        const statusColumn: TableColumn<
        ExportItem, string, StatusProps, TableHeaderCellProps
        > = {
            id: 'status',
            title: 'Status',
            cellRendererClassName: styles.status,
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: Status,
            columnWidth: '164px',
            cellRendererParams: (_, data) => ({
                icon: statusIconMap[data.status],
                tagVariant: statusVariantMap[data.status],
                status: statusLabelMap[data.status],
                file: data.file?.url,
                children: data.file?.name,
            }),
        };
        const actionsColumn: TableColumn<
        ExportItem, string, TableActionsProps, TableHeaderCellProps
        > = {
            id: 'actions',
            title: '',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: TableActions,
            columnWidth: '120px',
            cellRendererParams: (_, data) => ({
                viewDisabled: data.status === 'PENDING' || data.status === 'STARTED' || data.id === selectedExport?.id,
                data,
                onDeleteClick: handleDeleteExport,
                onViewExportClick: setSelectedExport,
            }),
        };
        return ([
            exportTypeColumn,
            createDateColumn<ExportItem, string>(
                'exportedAt',
                'Exported At',
                (item) => item.exportedAt,
                {
                    sortable: true,
                    columnWidth: '120px',
                },
            ),
            createStringColumn<ExportItem, string>(
                'title',
                'Title',
                (item) => item.title,
                {
                    columnWidth: '240px',
                    sortable: true,
                },
            ),
            statusColumn,
            actionsColumn,
        ]);
    }, [handleDeleteExport, selectedExport]);

    const pending = deleteExportPending;

    return (
        <Container
            className={_cs(styles.exportHistoryContainer, className)}
            contentClassName={styles.content}
            headerIcons={(
                <div className={styles.headerIcons}>
                    <TextInput
                        name="searchText"
                        autoFocus
                        icons={<IoSearch />}
                        label="Search"
                        placeholder="Search"
                        value={searchText}
                        onChange={setSearchText}
                    />
                    <DateRangeInput
                        name="exportedAt"
                        label="Exported At"
                        value={exportedAt}
                        onChange={setExportedAt}
                    />
                </div>
            )}
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={projectExportsResponse?.project?.exports?.totalCount ?? 0}
                    maxItemsPerPage={maxItemsPerPage}
                    onActivePageChange={setActivePage}
                    itemsPerPageControlHidden
                />
            )}
        >
            {pending && (<PendingMessage />)}
            <SortContext.Provider value={sortState}>
                <TableView
                    className={styles.tableView}
                    emptyMessage="Looks like you don't have any exports."
                    data={projectExportsResponse?.project?.exports?.results}
                    keySelector={exportKeySelector}
                    columns={columns}
                    pending={projectExportsPending}
                    errored={false}
                    filtered={isDefined(debouncedSearchText) || isDefined(exportedAt)}
                    filteredEmptyMessage="No matching exports found."
                    filteredEmptyIcon={(
                        <Kraken
                            variant="coffee"
                            size="large"
                        />
                    )}
                    emptyIcon={(
                        <Kraken
                            variant="coffee"
                            size="large"
                        />
                    )}
                    messageShown
                    messageIconShown
                />
            </SortContext.Provider>
            <Container
                className={styles.exportPreview}
                headingSize="small"
                heading="Preview"
                spacing="none"
                headerClassName={styles.header}
                headingClassName={styles.heading}
                contentClassName={styles.mainContent}
            >
                {isDefined(selectedExport?.file?.url) ? (
                    <LeadPreview
                        className={styles.preview}
                        url={selectedExport?.file?.url}
                    />
                ) : (
                    <div className={styles.label}>
                        {selectedExport?.file ? 'Preview not available.' : 'Select an export to preview it.'}
                    </div>
                )}
            </Container>
        </Container>
    );
}

export default ExportHistory;
