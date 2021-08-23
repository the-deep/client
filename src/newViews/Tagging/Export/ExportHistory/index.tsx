import React, { useState, useMemo, ReactElement } from 'react';
import { _cs } from '@togglecorp/fujs';
import { VscLoading } from 'react-icons/vsc';
import { IoDocument, IoDownloadOutline, IoClose, IoSearch } from 'react-icons/io5';
import { RiFileExcel2Fill, RiFileWord2Fill } from 'react-icons/ri';
import {
    Pager,
    TableView,
    TableColumn,
    Container,
    PendingMessage,
    TableHeaderCell,
    TableHeaderCellProps,
    createStringColumn,
    SortContext,
    useSortState,
    IconsProps,
    Icons,
    TextInput,
    DateRangeInput,
} from '@the-deep/deep-ui';
import {
    MultiResponse,
    Export,
} from '#typings';
import { useRequest, useLazyRequest } from '#utils/request';
import { getDateWithTimezone } from '#utils/common';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { createDateColumn } from '#newComponents/ui/tableHelpers';
import notify from '#notify';
import _ts from '#ts';

import TableActions, { Props as TableActionsProps } from './TableActions';
import Status, { Props as StatusProps } from './Status';
import styles from './styles.scss';

const statusIconMap: Record<Export['status'], ReactElement> = {
    pending: <VscLoading />,
    started: <VscLoading />,
    success: <IoDownloadOutline />,
    failure: <IoClose />,
};

const statusVariantMap: Record<Export['status'], 'default' | 'accent' | 'complement1'> = {
    pending: 'default',
    started: 'default',
    success: 'accent',
    failure: 'complement1',
};
const statusLabelMap: Record<Export['status'], string> = {
    pending: 'In queue to be exported',
    started: 'Generating the file',
    success: 'Download',
    failure: 'Failed',
};
const exportTypeIconMap: Record<Export['exportType'], ReactElement> = {
    report: <RiFileWord2Fill />, // TODO: report can be pdf or word (use specify icon)
    excel: <RiFileExcel2Fill />,
    json: <IoDocument />,
};
const maxItemsPerPage = 25;
const exportKeySelector = (d: Export) => d.id;
const defaultSorting = {
    name: 'exported_at',
    direction: 'asc',
};
interface DateRangeValue {
    startDate: string;
    endDate: string;
}

interface Props {
    projectId: number;
    className?: string;
    type: 'entries' | 'assessments';
}

function ExportHistory(props: Props) {
    const {
        className,
        projectId,
        type,
    } = props;

    const [activePage, setActivePage] = useState(1);
    const [exportedAt, setExportedAt] = useState<DateRangeValue>();
    const [searchText, setSearchText] = useState<string>();

    const debouncedSearchText = useDebouncedValue(searchText);
    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = useMemo(() => (
        validSorting.direction === 'Ascending'
            ? validSorting.name
            : `-${validSorting.name}`
    ), [validSorting]);

    const queryOptions = useMemo(() => ({
        projects: projectId,
        ordering,
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
        type: type === 'entries' ? 'entries' : 'assessments,planned_assessments',
        title: debouncedSearchText, // FIXME: filter by search text is unsupported in server
        exported_at__gte: exportedAt?.startDate && getDateWithTimezone(exportedAt.startDate),
        exported_at__lt: exportedAt?.endDate && getDateWithTimezone(exportedAt.endDate),
    }), [
        projectId,
        activePage,
        ordering,
        debouncedSearchText,
        exportedAt,
        type,
    ]);

    const {
        pending: getExportPending,
        response: exportListResponse,
        retrigger: getExportList,
    } = useRequest<MultiResponse<Export>>({
        url: 'server://exports/',
        query: queryOptions,
        method: 'GET',
        schemaName: 'userExportsGetResponse',
        shouldPoll: response => (
            (response?.results.some(v => v.status === 'pending')) ? 5000 : -1
        ),
        failureHeader: 'Export History',
    });

    const {
        pending: deleteExportPending,
        trigger: deleteExport,
    } = useLazyRequest<Export, number>({
        url: ctx => `server://exports/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            getExportList();
            notify.send({
                title: _ts('export', 'userExportsTitle'),
                type: notify.type.SUCCESS,
                message: _ts('export', 'deleteExportSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        failureHeader: _ts('export', 'userExportsTitle'),
    });

    const columns = useMemo(() => {
        const exportTypeColumn: TableColumn<
        Export, number, IconsProps, TableHeaderCellProps
        > = {
            id: 'export_type',
            title: 'Export Type',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: Icons,
            cellRendererClassName: styles.icons,
            cellRendererParams: (_, data) => ({
                children: (
                    exportTypeIconMap[data.exportType]
                ),
            }),
        };
        const statusColumn: TableColumn<
        Export, number, StatusProps, TableHeaderCellProps
        > = {
            id: 'status',
            title: 'Status',
            cellRendererClassName: styles.status,
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: Status,
            cellRendererParams: (_, data) => ({
                icon: statusIconMap[data.status],
                tagVariant: statusVariantMap[data.status],
                status: statusLabelMap[data.status],
                file: data.file,
            }),
        };
        const actionsColumn: TableColumn<
        Export, number, TableActionsProps, TableHeaderCellProps
        > = {
            id: 'actions',
            title: '',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: TableActions,
            cellRendererParams: (_, data) => ({
                id: data.id,
                onDeleteClick: deleteExport,
            }),
        };
        return ([
            exportTypeColumn,
            createDateColumn<Export, number>(
                'exported_at',
                'Exported At',
                item => item.exportedAt,
                {
                    sortable: true,
                },
            ),
            createStringColumn<Export, number>(
                'title',
                'Title',
                item => item.title,
                {
                    columnWidth: 300,
                    sortable: true,
                },
            ),
            statusColumn,
            actionsColumn,
        ]);
    }, [deleteExport]);

    const pending = getExportPending || deleteExportPending;

    return (
        <Container
            className={_cs(styles.exportHistoryContainer, className)}
            contentClassName={styles.content}
            sub
            headerClassName={styles.header}
            headerActions={(
                <>
                    <DateRangeInput
                        name="exportedAt"
                        label="Exported At"
                        value={exportedAt}
                        onChange={setExportedAt}
                        disabled={pending}
                    />
                    <TextInput
                        name="searchText"
                        icons={<IoSearch />}
                        label="Search"
                        placeholder="Search"
                        value={searchText}
                        onChange={setSearchText}
                        disabled={pending}
                    />
                </>
            )}
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={exportListResponse?.count ?? 0}
                    maxItemsPerPage={maxItemsPerPage}
                    onActivePageChange={setActivePage}
                    itemsPerPageControlHidden
                />
            )}
        >
            {pending && (<PendingMessage />)}
            <SortContext.Provider value={sortState}>
                <TableView
                    className={styles.table}
                    data={exportListResponse?.results}
                    keySelector={exportKeySelector}
                    columns={columns}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default ExportHistory;
