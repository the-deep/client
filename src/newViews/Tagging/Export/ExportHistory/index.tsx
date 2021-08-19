import React, { useState, useMemo, ReactElement, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { VscLoading } from 'react-icons/vsc';
import { IoDownloadOutline, IoClose, IoSearch } from 'react-icons/io5';
import {
    Pager,
    TableView,
    TableColumn,
    Container,
    PendingMessage,
    TableHeaderCell,
    TableHeaderCellProps,
    createStringColumn,
    Tag,
    TagProps,
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
import { useRequest } from '#utils/request';
import { getDateWithTimezone } from '#utils/common';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { createDateColumn } from '#newComponents/ui/tableHelpers';

import wordIcon from '#resources/img/word.svg';
import excelIcon from '#resources/img/excel.svg';
import jsonIcon from '#resources/img/json.svg';

import Actions, { Props as ActionsProps } from './Actions';
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
const exportTypeIconMap: Record<Export['exportType'], string> = {
    report: wordIcon, // TODO: report can be pdf or word (use specify icon)
    excel: excelIcon,
    json: jsonIcon,
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
}

function ExportHistory(props: Props) {
    const {
        className,
        projectId,
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

    const {
        pending,
        response: exportListResponse,
    } = useRequest<MultiResponse<Export>>({
        url: 'server://exports/',
        query: {
            project: projectId,
            ordering,
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
            title: debouncedSearchText, // FIXME: filter by search text is unsupported in server
            exported_at__gte: exportedAt?.startDate && getDateWithTimezone(exportedAt.startDate),
            exported_at__lt: exportedAt?.endDate && getDateWithTimezone(exportedAt.endDate),
        },
        method: 'GET',
        schemaName: 'userExportsGetResponse',
        shouldPoll: response => (
            (response?.results.some(v => v.status === 'pending')) ? 5000 : -1
        ),
        failureHeader: 'Export History',
    });

    const handleDelete = useCallback((exportId: number) => { // TODO: add implementation later
        console.warn('handleDelete', exportId);
    }, []);

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
                    <img
                        className={styles.image}
                        src={exportTypeIconMap[data.exportType]}
                        alt={data.exportType}
                    />),
            }),
        };
        const statusColumn: TableColumn<
        Export, number, TagProps, TableHeaderCellProps
        > = {
            id: 'status',
            title: 'Status',
            cellRendererClassName: styles.status,
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: Tag,
            cellRendererParams: (_, data) => ({
                actions: statusIconMap[data.status],
                variant: statusVariantMap[data.status],
                children: statusLabelMap[data.status],
            }),
        };
        const actionsColumn: TableColumn<
        Export, number, ActionsProps, TableHeaderCellProps
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
                onDeleteClick: handleDelete,
            }),
        };
        return ([
            exportTypeColumn,
            createDateColumn<Export, number>(
                'exported_at',
                'Exported At',
                item => item.exportedAt,
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
    }, [handleDelete]);

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
