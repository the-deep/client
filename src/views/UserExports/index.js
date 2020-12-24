import PropTypes from 'prop-types';
import React, { useCallback, useState, useMemo } from 'react';
import { connect } from 'react-redux';

import {
    isNotDefined,
    compareString,
    compareDate,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Page from '#rscv/Page';
import Pager from '#rscv/Pager';
import FormattedDate from '#rscv/FormattedDate';
import RawTable from '#rscv/RawTable';
import TableHeader from '#rscv/TableHeader';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    projectIdFromRouteSelector,
} from '#redux';
import { mimeTypeToIconMap } from '#entities/lead';
import notify from '#notify';
import _ts from '#ts';
import ExportPreview from '#components/other/ExportPreview';
import useRequest from '#utils/request';

import styles from './styles.scss';

const emptyList = [];

const propTypes = {
    projectId: PropTypes.number,
};

const defaultProps = {
    projectId: undefined,
};

const mapStateToProps = state => ({
    projectId: projectIdFromRouteSelector(state),
});

const tableKeyExtractor = d => d.id;

const maxItemsPerPage = 25;

function UserExports(props) {
    const { projectId } = props;

    const [userExports, setUserExports] = useState();
    const [selectedExport, setSelectedExport] = useState();
    const [exportCount, setExportCount] = useState(0);
    const [activeSort, setActiveSort] = useState('-exported_at');
    const [activePage, setActivePage] = useState(1);
    const [
        pending,
        ,
        ,
    ] = useRequest({
        url: 'server://exports/',
        query: {
            project: projectId,
            ordering: activeSort,
            is_preview: false,
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        method: 'GET',
        autoTrigger: true,
        shouldPoll: (response) => {
            const isPending = response?.results.some(e => e.status === 'pending' || e.status === 'started');
            if (isPending) {
                return 5000;
            }
            return -1;
        },
        schemaName: 'userExportsGetResponse',
        onSuccess: (response) => {
            setUserExports(response.results);
            setExportCount(response.count);
        },
        onFailure: () => {
            notify.send({
                title: _ts('export', 'userExportsTitle'),
                type: notify.type.ERROR,
                message: _ts('export', 'userExportsFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
    });

    const headers = useMemo(() => ([
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
                    date={row.exportedAt}
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
    ]), []);

    const dataModifier = useCallback(
        (data, columnKey) => {
            const header = headers.find(d => d.key === columnKey);
            if (header.modifier) {
                return header.modifier(data);
            }
            return data[columnKey];
        }, [headers],
    );

    const headerModifier = useCallback((headerData) => {
        let sortOrder = '';
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

    return (
        <Page
            className={styles.userExports}
            headerClassName={styles.header}
            header={
                <>
                    <h2 className={styles.heading}>
                        {_ts('export', 'userExportsHeader')}
                    </h2>
                </>
            }
            mainContentClassName={styles.mainContent}
            mainContent={
                <>
                    { (pending && isNotDefined(userExports)) && <LoadingAnimation /> }
                    <div className={styles.tableContainer}>
                        <RawTable
                            data={userExports || emptyList}
                            dataModifier={dataModifier}
                            headerModifier={headerModifier}
                            headers={headers}
                            onHeaderClick={handleTableHeaderClick}
                            keySelector={tableKeyExtractor}
                            className={styles.table}
                            pending={pending && isNotDefined(userExports)}
                            onBodyClick={setSelectedExport}
                            highlightRowKey={selectedExport}
                        />
                    </div>
                    <ExportPreview
                        key={selectedExport}
                        className={styles.preview}
                        exportId={selectedExport}
                    />
                </>
            }
            footerClassName={styles.footer}
            footer={
                <Pager
                    activePage={activePage}
                    className={styles.pager}
                    itemsCount={exportCount}
                    maxItemsPerPage={maxItemsPerPage}
                    onPageClick={setActivePage}
                    showItemsPerPageChange={false}
                />
            }
        />
    );
}

UserExports.propTypes = propTypes;
UserExports.defaultProps = defaultProps;

export default connect(mapStateToProps)(UserExports);
