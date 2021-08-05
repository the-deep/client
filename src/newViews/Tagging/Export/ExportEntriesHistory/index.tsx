import React, { useMemo, useCallback } from 'react';

import {
    PendingMessage,
    TableView,
    TableColumn,
    TableHeaderCellProps,
    TableHeaderCell,
    createStringColumn,
} from '@the-deep/deep-ui';

import { useRequest } from '#utils/request';
import {
    Export,
    MultiResponse,
} from '#typings';
import ActionCell, {
    Props as ActionCellProps,
} from '#newComponents/ui/EditDeleteActionCell';
import { createDateColumn } from '#newComponents/ui/tableHelpers';
import _ts from '#ts';

import styles from './styles.scss';

const exportEntriesKeySelector = (d: Export) => d.id;
function ExportEntriesHistory() {
    const exportEntriesHistoryQuery = useMemo(() => ({}), []);

    const {
        pending: getEntriesExportHistoryPending,
        response: entriesExportHistoryResponse,
    } = useRequest<MultiResponse<Export>>({
        url: 'server://exports/',
        query: exportEntriesHistoryQuery,
        method: 'GET',
        onSuccess: () => { console.warn('Success'); },
    });

    const handleEditExport = useCallback(() => {}, []);
    const handleDeleteExport = useCallback(() => {}, []);

    const exportColumns = useMemo(() => {
        const actionColumn: TableColumn<
            Export,
            number,
            ActionCellProps<number>,
            TableHeaderCellProps
        > = {
            id: 'action',
            title: _ts('export', 'actionLabel'),
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: ActionCell,
            cellRendererParams: (key, data) => ({
                exportedAt: data.exportedAt,
                exportTitle: data.title,
                itemKey: key,
                onEditClick: handleEditExport,
                onDeleteClick: handleDeleteExport,
                editButtonTitle: _ts('export', 'editExportLabel'),
                deleteButtonTitle: _ts('export', 'deleteExportLabel'),
                deleteConfirmationMessage: _ts('export', 'deleteExportConfirmMessage'),
            }),
        };

        return ([
            createDateColumn<Export, number>(
                'exportedAt',
                _ts('export', 'exportedAtLabel'),
                item => item.exportedAt,
            ),
            createStringColumn<Export, number>(
                'name',
                _ts('export', 'titleLabel'),
                item => item.title,
            ),
            actionColumn,
        ]);
    }, [handleEditExport, handleDeleteExport]);

    return (
        <div>
            {getEntriesExportHistoryPending && <PendingMessage />}
            <TableView
                className={styles.expandedTable}
                columns={exportColumns}
                keySelector={exportEntriesKeySelector}
                data={entriesExportHistoryResponse?.results}
            />
            This is Export Entries History
        </div>
    );
}

export default ExportEntriesHistory;
