import React, { useCallback, useState, useMemo } from 'react';

import ScrollTabs from '#rscv/ScrollTabs';
import TabTitle from '#components/general/TabTitle';
import MultiViewContainer from '#rscv/MultiViewContainer';
import Pager from '#rscv/Pager';

import {
    MultiResponse,
    Export,
    ExportStatus,
} from '#types';
import notify from '#notify';
import _ts from '#ts';
import ExportPreview from '#components/other/ExportPreview';
import { useRequest, useLazyRequest } from '#utils/request';

import ExportsTable from './ExportsTable';
import styles from './styles.scss';

interface Props {
    projectId: number;
}

const maxItemsPerPage = 25;

type TabElement = 'pending' | 'recent' | 'archived';

const tabs: { [key in TabElement]: string} = {
    pending: _ts('export', 'exporstInProgressLabel'),
    recent: _ts('export', 'recentExportsLabel'),
    archived: _ts('export', 'archivedExportsLabel'),
};

const tabExportStatus: { [key in TabElement]: ExportStatus[]} = {
    pending: ['started', 'pending'],
    recent: ['success', 'failure'],
    archived: ['success'],
};

function ExportedFiles(props: Props) {
    const { projectId } = props;

    const [activeTab, setActiveTab] = useState<TabElement>('pending');
    const [activeSort, setActiveSort] = useState('-exported_at');
    const [activePage, setActivePage] = useState(1);
    const [userExports, setUserExports] = useState<Export[]>([]);
    const [exportCount, setExportCount] = useState<number>(0);
    const [selectedExport, setSelectedExport] = useState<number>();
    const [archiveStatus, setArchiveStatus] = useState<boolean>();

    const isArchived = useMemo(() => activeTab === 'archived', [activeTab]);

    const {
        pending,
        retrigger: getExport,
    } = useRequest<MultiResponse<Export>>({
        url: 'server://exports/',
        query: {
            project: projectId,
            ordering: activeSort,
            is_archived: isArchived,
            status: tabExportStatus[activeTab],
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        method: 'GET',
        schemaName: 'userExportsGetResponse',
        onSuccess: (response) => {
            setUserExports(response.results);
            setExportCount(response.count);
        },
        shouldPoll: response => (
            (activeTab === 'pending' && response?.count && response.count > 0) ? 5000 : -1
        ),
        failureHeader: _ts('export', 'userExportsTitle'),
    });

    const {
        pending: deletePending,
        trigger: deleteExport,
        context: deleteExportId,
    } = useLazyRequest<unknown, number>({
        url: ctx => `server://exports/${ctx}/`,
        method: 'DELETE',
        onSuccess: (_, ctx) => {
            getExport();
            setExportCount(oldCount => oldCount - 1);
            if (ctx === selectedExport) {
                setSelectedExport(undefined);
            }
            notify.send({
                title: _ts('export', 'userExportsTitle'),
                type: notify.type.SUCCESS,
                message: _ts('export', 'deleteExportSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        failureHeader: _ts('export', 'userExportsTitle'),
    });

    const {
        pending: cancelPending,
        trigger: cancelExport,
        context: cancelExportId,
    } = useLazyRequest<unknown, number>({
        url: ctx => `server://exports/${ctx}/cancel/`,
        method: 'POST',
        body: {},
        onSuccess: (_, ctx) => {
            getExport();
            setExportCount(oldCount => oldCount - 1);
            if (ctx === selectedExport) {
                setSelectedExport(undefined);
            }
            notify.send({
                title: _ts('export', 'userExportsTitle'),
                type: notify.type.SUCCESS,
                message: _ts('export', 'cancelExportSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        failureHeader: _ts('export', 'userExportsTitle'),
    });


    const {
        pending: archivePending,
        trigger: changeArchiveStatus,
        context: archiveExportId,
    } = useLazyRequest<unknown, number>({
        url: ctx => `server://exports/${ctx}/`,
        method: 'PATCH',
        body: { is_archived: archiveStatus },
        onSuccess: (_, ctx) => {
            getExport();
            setExportCount(oldCount => oldCount - 1);
            if (ctx === selectedExport) {
                setSelectedExport(undefined);
            }
            notify.send({
                title: _ts('export', 'userExportsTitle'),
                type: notify.type.SUCCESS,
                message: archiveStatus ? _ts('export', 'archiveExportSuccess') :
                    _ts('export', 'unArchiveExportSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        failureHeader: _ts('export', 'userExportsTitle'),
    });

    const handleExportDelete = deleteExport;
    const handleExportCancel = cancelExport;

    const handleExportArchive = useCallback((id: number, value: boolean) => {
        setArchiveStatus(value);
        changeArchiveStatus(id);
    }, [changeArchiveStatus]);

    const handleTabChange = useCallback((tab: TabElement) => {
        setUserExports([]);
        setExportCount(0);
        setSelectedExport(undefined);
        setActivePage(1);
        setActiveTab(tab);
    }, []);

    const views = useMemo(() => (
        {
            pending: {
                component: () => (
                    <ExportsTable
                        exports={userExports}
                        pending={pending && exportCount < 1}
                        selectedExport={selectedExport}
                        setSelectedExport={setSelectedExport}
                        activeSort={activeSort}
                        setActiveSort={setActiveSort}
                        cancelExportId={cancelExportId}
                        handleExportCancel={handleExportCancel}
                        cancelPending={cancelPending}
                    />
                ),
                lazyMount: true,
                wrapContainer: true,
            },
            recent: {
                component: () => (
                    <ExportsTable
                        exports={userExports}
                        pending={pending && exportCount < 1}
                        selectedExport={selectedExport}
                        setSelectedExport={setSelectedExport}
                        activeSort={activeSort}
                        setActiveSort={setActiveSort}
                        deleteExportId={deleteExportId}
                        handleExportDelete={handleExportDelete}
                        deletePending={deletePending}
                        archiveExportId={archiveExportId}
                        handleExportArchive={handleExportArchive}
                        archivePending={archivePending}
                    />
                ),
                lazyMount: true,
                wrapContainer: true,
            },
            archived: {
                component: () => (
                    <ExportsTable
                        exports={userExports}
                        pending={pending && exportCount < 1}
                        selectedExport={selectedExport}
                        setSelectedExport={setSelectedExport}
                        activeSort={activeSort}
                        archiveExportId={archiveExportId}
                        isArchived={isArchived}
                        setActiveSort={setActiveSort}
                        handleExportArchive={handleExportArchive}
                    />
                ),
                lazyMount: true,
                wrapContainer: true,
            },
        }
    ), [
        exportCount,
        activeSort,
        archiveExportId,
        archivePending,
        cancelExportId,
        cancelPending,
        deleteExportId,
        deletePending,
        handleExportArchive,
        handleExportCancel,
        handleExportDelete,
        isArchived,
        selectedExport,
        userExports,
        pending,
    ]);

    const tabRendererParams = useCallback((_: TabElement, title: string) => ({
        title,
    }), []);

    return (
        <div className={styles.exportedFiles}>
            <ScrollTabs
                className={styles.header}
                tabs={tabs}
                active={activeTab}
                renderer={TabTitle}
                onClick={handleTabChange}
                rendererParams={tabRendererParams}
            />
            <div className={styles.mainContent}>
                <div className={styles.leftContent}>
                    <MultiViewContainer
                        containerClassName={styles.left}
                        views={views}
                        active={activeTab}
                    />
                    <footer className={styles.footer}>
                        <Pager
                            activePage={activePage}
                            itemsCount={exportCount}
                            maxItemsPerPage={maxItemsPerPage}
                            onPageClick={setActivePage}
                            showItemsPerPageChange={false}
                        />
                    </footer>
                </div>
                <ExportPreview
                    key={selectedExport}
                    className={styles.preview}
                    exportId={selectedExport}
                />
            </div>
        </div>
    );
}

export default ExportedFiles;
