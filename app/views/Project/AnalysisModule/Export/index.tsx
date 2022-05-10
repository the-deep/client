import React, { useState, useCallback, ReactElement, useMemo, useEffect } from 'react';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';
import { VscLoading } from 'react-icons/vsc';
import { IoDownloadOutline, IoClose, IoSearch } from 'react-icons/io5';
import { useQuery, useMutation } from '@apollo/client';

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
    Tabs,
    ContainerCard,
} from '@the-deep/deep-ui';
import {
    AiOutlineRedo,
    AiFillFilePdf,
    AiFillFileExcel,
    AiFillFileWord,
    AiFillFileText,
} from 'react-icons/ai';
import {
    convertDateToIsoDateTime,
} from '#utils/common';
import { createDateColumn } from '#components/tableHelpers';
import ProjectContext from '#base/context/ProjectContext';
import { useModalState } from '#hooks/stateManagement';
import {
    ProjectExportsQuery,
    ProjectExportsQueryVariables,
    ExportDataTypeEnum,
    DeleteExportMutation,
    DeleteExportMutationVariables,
} from '#generated/types';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { PROJECT_EXPORTS, DELETE_EXPORT } from '../../Tagging/Export/ExportHistory/queries';
import _ts from '#ts';
import TableActions, { Props as TableActionsProps } from './TableActions';
import Status, { Props as StatusProps } from './Status';

import styles from './styles.css';

type ExportItem = NonNullable<NonNullable<NonNullable<NonNullable<ProjectExportsQuery['project']>['exports']>>['results']>[number];
type ExportType = 'export-entry-history' | 'export-assessment-history';

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
    DOCX: <AiFillFileWord title="Word export" className={styles.icon} />,
    PDF: <AiFillFilePdf title="PDF export" className={styles.icon} />,
    XLSX: <AiFillFileExcel title="Excel export" className={styles.icon} />,
    JSON: <AiFillFileText title="JSON export" className={styles.icon} />,
};
const maxItemsPerPage = 25;
const defaultSorting = {
    name: 'exportedAt',
    direction: 'Descending',
};
function exportKeySelector(d: ExportItem) {
    return d.id;
}

interface DateRangeValue {
    startDate: string;
    endDate: string;
}
const debounceTime = 500;

interface Props {
    projectId: string;
    className?: string;
    type: ExportDataTypeEnum[];
}

function Export(props: Props) {
    const {
        className,
        projectId,
        type,
    } = props;
    const { project } = React.useContext(ProjectContext);
    const activeProject = project ? project.id : undefined;
    const [activeTab, setActiveTab] = useState<ExportType | undefined>('export-entry-history');

    const [
        newExportModalShown,
        showCreateNewExportModal,
        hideCreateNewExportModal,
    ] = useModalState(false);

    const [
        newAssessmentModalShown,
        showNewAssessmentModal,
        hideNewAssessmentModal,
    ] = useModalState(false);

    const [selectedExport, setSelectedExport] = useState<ExportItem>();
    const [activePage, setActivePage] = useState(1);
    const [exportedAt, setExportedAt] = useState<DateRangeValue>();
    const [searchText, setSearchText] = useState<string>();
    // FIXME: we can safely remove useDebouncedValue if we are using TextInput from deep-ui
    const debouncedSearchText = useDebouncedValue(searchText, debounceTime);

    const handleSetSearchText = useCallback((search: string | undefined) => {
        setSearchText(search);
        setActivePage(1);
    }, []);

    const handleSetExportedAt = useCallback((date: DateRangeValue | undefined) => {
        setExportedAt(date);
        setActivePage(1);
    }, []);

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
                if ((response.project?.exports?.totalCount ?? 0) < (activePage * maxItemsPerPage)) {
                    setActivePage(1);
                }
            },
        },
    );

    // FIXME: memoize this
    const exports = projectExportsResponse?.project?.exports?.results;
    const shouldPoll = exports?.some(
        (v) => (v.status === 'PENDING' || v.status === 'STARTED'),
    );

    useEffect(
        () => {
            if (shouldPoll) {
                startPolling(5000);
            } else {
                stopPolling();
            }
        },
        [shouldPoll, startPolling, stopPolling],
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
            onError: () => {
                alert.show(
                    'Failed to delete export.',
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
                viewDisabled: data.status === 'PENDING'
                    || data.status === 'STARTED'
                    || data.status === 'FAILURE'
                    || data.id === selectedExport?.id,
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
                    format: 'dd MMM, yyyy hh:mm aaa',
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
            className={_cs(styles.exportHistoryContainer)}
            headingSize="extraSmall"
            headerClassName={styles.header}
            heading="Export History"
            headingContainerClassName={styles.actionButtons}
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
                        onChange={handleSetSearchText}
                    />
                    <DateRangeInput
                        name="exportedAt"
                        label="Exported At"
                        value={exportedAt}
                        onChange={handleSetExportedAt}
                    />
                </div>
            )}
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={5}
                    maxItemsPerPage={10}
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
                    data={undefined}
                    keySelector={exportKeySelector}
                    columns={[]}
                    pending={pending}
                    errored={false}
                    filtered={isDefined(debouncedSearchText) || isDefined(exportedAt)}
                    filteredEmptyMessage="No matching exports found."
                    filteredEmptyIcon={(
                        <Kraken
                            variant="search"
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
            />
        </Container>
    );
}

export default Export;
