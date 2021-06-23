import React, { ReactNode, useMemo, useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

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
    Link,
    LinkProps,
    Checkbox,
    CheckboxProps,
} from '@the-deep/deep-ui';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { VscLoading } from 'react-icons/vsc';
import { MultiResponse, Lead } from '#typings';
import { useRequest } from '#utils/request';
import _ts from '#ts';

import Actions, { Props as ActionsProps } from './Actions';

import styles from './styles.scss';

const leadsKeySelector: (d: Lead) => number = d => d.id;

const statusIconMap: Record<Lead['status'], ReactNode> = {
    pending: <VscLoading />,
    validated: <IoCheckmarkCircleOutline />,
    processed: null,
};
const statusVariantMap: Record<Lead['status'], 'complement2' | 'accent' | 'complement1'> = {
    pending: 'complement2',
    validated: 'accent',
    processed: 'complement1',
};
const statusLabelMap: Record<Lead['status'], string> = {
    pending: 'In Progress',
    validated: 'Validated',
    processed: 'Tagged',
};

const maxItemsPerPage = 10;

interface Props {
    className?: string;
    activeProject: number;
}

function SourcesTable(props: Props) {
    const {
        className,
        activeProject,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const leadsRequestQuery = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
    }), [activePage]);

    const leadsRequestBody = useMemo(() => ({
        project: activeProject,
    }), [activeProject]);

    const {
        pending: leadsGetPending,
        response: leadsResponse,
        retrigger: getLeads,
    } = useRequest<MultiResponse<Lead>>({
        url: 'server://v2/leads/filter/',
        query: leadsRequestQuery,
        method: 'POST',
        body: leadsRequestBody,
        failureHeader: _ts('projectEdit', 'frameworkDetails'),
    });

    const handlePageChange = useCallback((page: number) => {
        setActivePage(page);
        getLeads();
        setSelectedIds([]);
    }, [getLeads]);

    const handleSelectAll = useCallback((value: boolean) => {
        if (value) {
            const ids = leadsResponse?.results.map(v => v.id) ?? [];
            setSelectedIds(ids);
        } else {
            setSelectedIds([]);
        }
    }, [leadsResponse]);

    const handleSelection = useCallback((value: boolean, name: number) => {
        if (value) {
            setSelectedIds(ids => ([...ids, name]));
        } else {
            setSelectedIds(ids => ids.filter(v => v !== name));
        }
    }, []);

    const handleEdit = useCallback(() => {
        console.warn('handleEdit', handleEdit);
    }, []);

    const columns = useMemo(() => {
        const selectColumn: TableColumn<
            Lead, number, CheckboxProps<number>, CheckboxProps<number>
        > = {
            id: 'select',
            title: '',
            headerCellRenderer: Checkbox,
            headerCellRendererParams: {
                value: selectedIds.length === leadsResponse?.results.length,
                label: `${selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}`,
                onChange: handleSelectAll,
                indeterminate: !(selectedIds.length === leadsResponse?.results.length
                || selectedIds.length === 0),
            },
            cellRenderer: Checkbox,
            cellRendererParams: (_, data) => ({
                name: data.id,
                value: selectedIds.some(v => v === data.id),
                onChange: handleSelection,
            }),

        };
        const statusColumn: TableColumn<
            Lead, number, TagProps, TableHeaderCellProps
        > = {
            id: 'status',
            title: 'Status',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRendererClassName: styles.status,
            cellRenderer: Tag,
            cellRendererParams: (_, data) => ({
                actions: statusIconMap[data.status],
                variant: statusVariantMap[data.status],
                children: statusLabelMap[data.status],
            }),
        };
        const createdAtColumn: TableColumn<
            Lead, number, DateOutputProps, TableHeaderCellProps
        > = {
            id: 'createdAt',
            title: 'Created At',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: DateOutput,
            cellRendererParams: (_, data) => ({
                value: data.createdAt,
            }),
        };
        const publishedOnColumn: TableColumn<
            Lead, number, DateOutputProps, TableHeaderCellProps
        > = {
            id: 'publishedOn',
            title: 'Publishing Date',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: DateOutput,
            cellRendererParams: (_, data) => ({
                value: data.publishedOn,
            }),
        };
        const publisherColumn: TableColumn<
            Lead, number, LinkProps, TableHeaderCellProps
        > = {
            id: 'sourceDetail',
            title: 'Publisher',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: Link,
            cellRendererParams: (_, data) => ({
                children: data.sourceDetail.title,
                to: '#', // TODO use provided url
            }),
        };
        const actionsColumn: TableColumn<
            Lead, number, ActionsProps<number>, TableHeaderCellProps
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
                onEditClick: handleEdit,
            }),
        };
        return ([
            selectColumn,
            statusColumn,
            createdAtColumn,
            createStringColumn<Lead, number>(
                'title',
                'Title',
                item => item?.title,
            ),
            createStringColumn<Lead, number>(
                'pageCount',
                'Pages',
                item => `${item?.pageCount} ${item?.pageCount > 1 ? 'pages' : 'page'}`,
            ),
            publisherColumn,
            createStringColumn<Lead, number>(
                'authorsDetail',
                'Authors',
                item => item?.authorsDetail.map(v => v.title).join(','),
            ),
            publishedOnColumn,
            createStringColumn<Lead, number>(
                'createdByName',
                'Added By',
                item => item?.createdByName,
            ),
            createStringColumn<Lead, number>(
                'assigneeDetails',
                'Assignee',
                item => item?.assigneeDetails.displayName,
            ),
            createStringColumn<Lead, number>(
                'priorityDisplay',
                'Priority',
                item => item?.priorityDisplay,
            ),
            actionsColumn,
        ]);
    }, [handleSelectAll, handleSelection, leadsResponse, selectedIds, handleEdit]);

    return (
        <Container
            className={_cs(styles.sourcesTableContainer, className)}
            contentClassName={styles.content}
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={leadsResponse?.count ?? 0}
                    maxItemsPerPage={maxItemsPerPage}
                    onActivePageChange={handlePageChange}
                    itemsPerPageControlHidden
                />
            )}
        >
            {leadsGetPending && (<PendingMessage />)}
            <Table
                data={leadsResponse?.results}
                keySelector={leadsKeySelector}
                columns={columns}
            />
        </Container>
    );
}

export default SourcesTable;
