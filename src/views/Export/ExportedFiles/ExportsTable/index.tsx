import React, { useCallback, useMemo } from 'react';

import {
    compareString,
    compareDate,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import FormattedDate from '#rscv/FormattedDate';
import RawTable from '#rscv/RawTable';
import TableHeader from '#rscv/TableHeader';
import LoadingAnimation from '#rscv/LoadingAnimation';
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
    handleExportUnArchive?: (id: number) => void;
    unarchiveExportId?: number;
    isArchived?: boolean;
    archiveExportId?: number;
}

const tableKeyExtractor = (d: Export) => d.id;

const defaultHeaders: Header<Export>[] = [
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
        comparator: (a, b) => compareDate(a.exportedAt, b.exportedAt),
        modifier: row => (
            <FormattedDate
                value={row.exportedAt}
                mode="dd-MM-yyyy hh:mm"
            />
        ),
    },
    {
        key: 'title',
        label: _ts('export', 'exportTitleHeaderLabel'),
        order: 3,
        sortable: true,
        comparator: (a, b) => compareString(a.title, b.title),
    },
    {
        key: 'status',
        label: _ts('export', 'statusHeaderLabel'),
        order: 4,
        sortable: true,
        comparator: (a, b) => (
            compareString(a.status, b.status)
        ),
        modifier: (row) => {
            if (row.status === 'pending') {
                return _ts('export', 'pendingStatusLabel');
            } else if (row.status === 'started') {
                return _ts('export', 'startedStatusLabel');
            } else if (row.status === 'failure') {
                return _ts('export', 'errorStatusLabel');
            } else if (row.status === 'success') {
                return _ts('export', 'completedStatusLabel');
            }
            return '';
        },
    },
    {
        key: 'type',
        label: _ts('export', 'exportTypeHeaderLabel'),
        order: 5,
        sortable: true,
        comparator: (a, b) => (
            compareString(a.type, b.type) || compareString(a.title, b.title)
        ),
    },
    {
        key: 'file',
        label: _ts('export', 'exportDownloadHeaderLabel'),
        order: 6,
        modifier: (row) => {
            if (row.status === 'started') {
                return (
                    <div className={styles.loadingAnimation}>
                        <LoadingAnimation />
                    </div>
                );
            } else if (row.status === 'pending') {
                return (
                    <div className="to-be-started">
                        <Icon
                            name="history"
                            title={_ts('export', 'toBeStartedTitle')}
                        />
                    </div>
                );
            } else if (row.status === 'failure' || !row.file) {
                return (
                    <div className="file-error">
                        <Icon name="error" />
                    </div>
                );
            }
            return (
                <a
                    href={row.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-download"
                >
                    <Icon name="download" />
                </a>
            );
        },
    },
];

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
        isArchived,
    } = props;

    const headers: Header<Export>[] = useMemo(() => {
        const newHeaders = [...defaultHeaders];
        if (handleExportDelete || handleExportArchive) {
            newHeaders.push({
                key: 'action',
                label: _ts('export', 'exportActionsLabel'),
                order: 6,
                sortable: false,
                modifier: row => (
                    <>
                        {handleExportArchive && (
                            isArchived ? (
                                <PrimaryConfirmButton
                                    onClick={() => handleExportArchive(row.id, false)}
                                    iconName="unarchive"
                                    disabled={row.id === archiveExportId && archivePending}
                                    title={_ts('export', 'exportUnArchiveLabel')}
                                    confirmationMessage={_ts('export', 'exportUnArchiveConfirmationMessage')}
                                    transparent
                                />
                            ) : (
                                <PrimaryConfirmButton
                                    onClick={() => handleExportArchive(row.id, true)}
                                    iconName="archiveBlock"
                                    disabled={row.id === archiveExportId && archivePending}
                                    title={_ts('export', 'exportArchiveLabel')}
                                    confirmationMessage={_ts('export', 'exportArchiveConfirmationMessage')}
                                    transparent
                                />
                            )
                        )}
                        {handleExportDelete && (
                            <DangerConfirmButton
                                onClick={() => handleExportDelete(row.id)}
                                iconName="delete"
                                disabled={row.id === deleteExportId && deletePending}
                                title={_ts('export', 'exportDeleteLabel')}
                                confirmationMessage={_ts('export', 'exportDeleteConfirmationMessage')}
                                transparent
                            />
                        )}
                    </>
                ),
            });
        }
        return newHeaders;
    }, [
        isArchived,
        deleteExportId,
        deletePending,
        handleExportDelete,
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
