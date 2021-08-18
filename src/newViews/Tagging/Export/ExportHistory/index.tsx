import React, { useState, useMemo, ReactElement, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { VscLoading } from 'react-icons/vsc';
import { IoDownloadOutline, IoClose } from 'react-icons/io5';
import {
    Pager,
    Table,
    TableColumn,
    Container,
    PendingMessage,
    TableHeaderCell,
    TableHeaderCellProps,
    createStringColumn,
    Tag,
    TagProps,
    DateOutput,
    DateOutputProps,
    SortContext,
    useSortState,
    IconsProps,
    Icons,
} from '@the-deep/deep-ui';
import {
    MultiResponse,
    Export,
} from '#typings';
import { useRequest } from '#utils/request';

import wordIcon from '#resources/img/word.svg';
import excelIcon from '#resources/img/excel.svg';
import pdfIcon from '#resources/img/pdf.svg';
import jsonIcon from '#resources/img/json.svg';

import Actions, { Props as ActionsProps } from './Actions';
import Filter, { FormType } from './Filter';
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
    word: wordIcon,
    excel: excelIcon,
    pdf: pdfIcon,
    json: jsonIcon,
};
const maxItemsPerPage = 25;
const exportKeySelector = (d: Export) => d.id;
const defaultSorting = {
    name: 'exported_at',
    direction: 'asc',
};

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
    const [, setFilters] = useState<FormType | undefined>(); // TODO: add filters when availabe

    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = validSorting.direction === 'Ascending'
        ? validSorting.name
        : `-${validSorting.name}`;

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

    const handleClone = useCallback((exportId: number) => { // TODO: add implementation later
        console.warn('handleClone', exportId);
    }, []);

    const columns = useMemo(() => {
        const exportTypeColumn: TableColumn<
            Export, number, IconsProps, TableHeaderCellProps
        > = {
            id: 'exportType',
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
        const exportedAtColumn: TableColumn<
            Export, number, DateOutputProps, TableHeaderCellProps
        > = {
            id: 'exportedAt',
            title: 'Exported At',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: true,
            },
            cellRenderer: DateOutput,
            cellRendererParams: (_, data) => ({
                value: data.exportedAt,
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
                sortable: false,
            },

            cellRenderer: Tag,
            cellRendererParams: (_, data) => ({
                actions: statusIconMap[data.status],
                variant: statusVariantMap[data.status],
                children: statusLabelMap[data.status],
            }),
        };
        const actionsColumn: TableColumn<
            Export, number, ActionsProps<number>, TableHeaderCellProps
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
                onCloneClick: handleClone,
                onDeleteClick: handleDelete,
            }),
        };
        return ([
            exportTypeColumn,
            exportedAtColumn,
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
    }, [handleClone, handleDelete]);

    return (
        <Container
            className={_cs(styles.exportHistoryContainer, className)}
            contentClassName={styles.content}
            sub
            headerClassName={styles.header}
            headerActions={(
                <Filter
                    disabled={pending}
                    onFilterApply={setFilters}
                />
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
                <Table
                    className={styles.table}
                    data={exportListResponse?.results}
                    keySelector={exportKeySelector}
                    columns={columns}
                    variant="large"
                />
            </SortContext.Provider>
        </Container>
    );
}

export default ExportHistory;
