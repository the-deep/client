import React, { useCallback, useMemo } from 'react';

import Icon from '#rscg/Icon';
import FormattedDate from '#rscv/FormattedDate';
import RawTable from '#rscv/RawTable';
import TableHeader from '#rscv/TableHeader';
import Spinner from '#rsu/../v2/View/Spinner';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import PrimaryConfirmButton from '#rsca/ConfirmButton/PrimaryConfirmButton';

import { mimeTypeToIconMap } from '#entities/lead';
import _ts from '#ts';

import { Export } from '#typings';
import { Header } from '#rscv/Table';

import styles from './styles.scss';

interface Props {
    exports: Export[];
    setSelectedExport: (key: number) => void;
    selectedExport?: number;
    pending: boolean;
    activeSort: string;
    setActiveSort: (sort: string) => void;

    handleExportDelete?: (id: number) => void;
    deletePending?: boolean;
    deleteExportId?: number;

    handleExportArchive?: (id: number, value: boolean) => void;
    archivePending?: boolean;
    isArchived?: boolean;
    archiveExportId?: number;

    handleExportCancel?: (id: number) => void;
    cancelPending?: boolean;
    cancelExportId?: number;
}

const tableKeyExtractor = (d: Export) => d.id;

function ExportsTable(props: Props) {
    const {
        exports,
        setSelectedExport,
        selectedExport,
        pending,
        activeSort,
        setActiveSort,

        handleExportDelete,
        deleteExportId,
        deletePending,

        handleExportArchive,
        archiveExportId,
        archivePending,

        handleExportCancel,
        cancelExportId,
        cancelPending,

        isArchived,
    } = props;

    const headers: Header<Export>[] = useMemo(() => ([
        {
            key: 'mime-type',
            label: _ts('export', 'documentTypeHeaderLabel'),
            order: 1,
            modifier: (row) => {
                const icon = mimeTypeToIconMap[row.mimeType] || 'documentText';
                const url = row.file;
                return (
                    <div className="icon-wrapper">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <Icon name={icon} />
                        </a>
                    </div>
                );
            },
        },
        {
            key: 'exported_at',
            label: _ts('export', 'exportedAtHeaderLabel'),
            order: 2,
            sortable: true,
            modifier: row => (
                <FormattedDate
                    value={row.exportedAt}
                    mode="dd-MM-yyyy hh:mm"
                />
            ),
        },
        {
            key: 'type',
            label: _ts('export', 'exportTypeHeaderLabel'),
            order: 3,
            sortable: true,
        },
        {
            key: 'title',
            label: _ts('export', 'exportTitleHeaderLabel'),
            order: 4,
            sortable: true,
        },
        {
            key: 'file',
            label: _ts('export', 'exportActionsLabel'),
            order: 5,
            modifier: (row) => {
                if (row.status === 'started') {
                    return (
                        <div className={styles.actions}>
                            <div className={styles.loadingAnimation}>
                                <div className={styles.label}>
                                    {_ts('export', 'startedStatusLabel')}
                                </div>
                                <Spinner small />
                            </div>
                            {handleExportCancel && (
                                <DangerConfirmButton
                                    onClick={() => handleExportCancel(row.id)}
                                    disabled={row.id === cancelExportId && cancelPending}
                                    title={_ts('export', 'exportCancelLabel')}
                                    confirmationMessage={_ts('export', 'exportCancelConfirmationMessage')}
                                    transparent
                                >
                                    {_ts('export', 'exportCancelLabel')}
                                </DangerConfirmButton>
                            )}
                        </div>
                    );
                } else if (row.status === 'pending') {
                    return (
                        <div className={styles.actions}>
                            <div className={styles.loadingAnimation}>
                                <div className={styles.label}>
                                    {_ts('export', 'toBeStartedTitle')}
                                </div>
                                <Spinner small />
                            </div>
                            {handleExportCancel && (
                                <DangerConfirmButton
                                    onClick={() => handleExportCancel(row.id)}
                                    disabled={row.id === cancelExportId && cancelPending}
                                    title={_ts('export', 'exportCancelLabel')}
                                    confirmationMessage={_ts('export', 'exportCancelConfirmationMessage')}
                                    transparent
                                >
                                    {_ts('export', 'exportCancelLabel')}
                                </DangerConfirmButton>
                            )}
                        </div>
                    );
                } else if (row.status === 'failure' || !row.file) {
                    return (
                        <div className={styles.actions}>
                            <Icon
                                className={styles.fileError}
                                name="error"
                            />
                            {handleExportDelete && (
                                <DangerConfirmButton
                                    onClick={() => handleExportDelete(row.id)}
                                    disabled={row.id === deleteExportId && deletePending}
                                    title={_ts('export', 'exportDeleteLabel')}
                                    confirmationMessage={_ts('export', 'exportDeleteConfirmationMessage')}
                                    transparent
                                >
                                    {_ts('export', 'exportDeleteLabel')}
                                </DangerConfirmButton>
                            )}
                        </div>
                    );
                }
                return (
                    <div className={styles.actions}>
                        <a
                            href={row.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.downloadButton}
                        >
                            <Icon
                                className={styles.icon}
                                name="download"
                            />
                            {_ts('export', 'downloadButtonTitle')}
                        </a>
                        {handleExportArchive && (
                            isArchived ? (
                                <PrimaryConfirmButton
                                    onClick={() => handleExportArchive(row.id, false)}
                                    disabled={row.id === archiveExportId && archivePending}
                                    title={_ts('export', 'exportUnArchiveLabel')}
                                    confirmationMessage={_ts('export', 'exportUnArchiveConfirmationMessage')}
                                    transparent
                                >
                                    {_ts('export', 'exportUnArchiveLabel')}
                                </PrimaryConfirmButton>
                            ) : (
                                <PrimaryConfirmButton
                                    onClick={() => handleExportArchive(row.id, true)}
                                    disabled={row.id === archiveExportId && archivePending}
                                    title={_ts('export', 'exportArchiveLabel')}
                                    confirmationMessage={_ts('export', 'exportArchiveConfirmationMessage')}
                                    transparent
                                >
                                    {_ts('export', 'exportArchiveLabel')}
                                </PrimaryConfirmButton>
                            )
                        )}
                        {handleExportDelete && (
                            <DangerConfirmButton
                                onClick={() => handleExportDelete(row.id)}
                                disabled={row.id === deleteExportId && deletePending}
                                title={_ts('export', 'exportDeleteLabel')}
                                confirmationMessage={_ts('export', 'exportDeleteConfirmationMessage')}
                                transparent
                            >
                                {_ts('export', 'exportDeleteLabel')}
                            </DangerConfirmButton>
                        )}
                    </div>
                );
            },
        },
    ]), [
        isArchived,
        deleteExportId,
        deletePending,
        handleExportDelete,
        cancelExportId,
        cancelPending,
        handleExportCancel,
        archiveExportId,
        archivePending,
        handleExportArchive,
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

        return (
            <TableHeader
                label={headerData.label}
                sortOrder={sortOrder}
                sortable={headerData.sortable}
            />
        );
    }, [activeSort]);

    const handleTableHeaderClick = useCallback(
        (key) => {
            const headerData = headers.find(h => h.key === key);
            // prevent click on 'actions' column
            if (!headerData || !headerData.sortable) {
                return;
            }

            let tmpActiveSort = activeSort;

            const isAsc = tmpActiveSort.charAt(0) !== '-';

            const isCurrentHeaderSorted = tmpActiveSort === key
                || (tmpActiveSort.substr(1) === key && !isAsc);

            if (isCurrentHeaderSorted) {
                tmpActiveSort = isAsc ? `-${key}` : key;
            } else {
                tmpActiveSort = headerData.defaultSortOrder === 'dsc' ? `-${key}` : key;
            }

            setActiveSort(tmpActiveSort);
        }, [headers, activeSort, setActiveSort],
    );

    const handleBodyClick = useCallback((key, column) => {
        if (column !== 'action' && column !== 'file') {
            setSelectedExport(key);
        }
    }, [setSelectedExport]);

    return (
        <RawTable
            className={styles.table}
            data={exports}
            dataModifier={dataModifier}
            headerModifier={headerModifier}
            headers={headers}
            onHeaderClick={handleTableHeaderClick}
            onBodyClick={handleBodyClick}
            keySelector={tableKeyExtractor}
            pending={pending}
            highlightRowKey={selectedExport}
        />
    );
}

export default ExportsTable;
