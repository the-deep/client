import React, { useCallback, useState, useMemo } from 'react';

import ScrollTabs from '#rscv/ScrollTabs';
import TabTitle from '#components/general/TabTitle';
import MultiViewContainer from '#rscv/MultiViewContainer';
import Page from '#rscv/Page';
import Pager from '#rscv/Pager';

import {
    MultiResponse,
    Export,
    ExportStatus,
} from '#typings';
import notify from '#notify';
import _ts from '#ts';
import ExportPreview from '#components/other/ExportPreview';
import useRequest from '#utils/request';

import ExportsTable from './ExportsTable';
import styles from './styles.scss';

interface Props {
    projectId: number;
}

const maxItemsPerPage = 5;

type TabElement = 'pending' | 'recent' | 'archived';
const tabs: { [key in TabElement]: string} = {
    pending: 'Downloads in progres',
    recent: 'Recent downloads',
    archived: 'Archive',
};

const tabExportStatus: { [key in TabElement]: ExportStatus} = {
    pending: 'pending',
    recent: 'success',
    archived: 'success',
};

function ExportedFiles(props: Props) {
    const { projectId } = props;

    const [activeTab, setActiveTab] = useState<TabElement>('pending');
    const [activeSort, setActiveSort] = useState('-exported_at');
    const [activePage, setActivePage] = useState(1);
    const [userExports, setUserExports] = useState<Export[]>([]);
    const [exportCount, setExportCount] = useState<number>(0);
    const [selectedExport, setSelectedExport] = useState<number>();
    const [deleteExportId, setDeleteExportId] = useState<number>();
    const [archiveExportId, setArchiveExportId] = useState<number>();

    const status = useMemo(() => tabExportStatus[activeTab], [activeTab]);
    const isArchived = useMemo(() => activeTab === 'archived', [activeTab]);

    const [
        pending,
        ,
        ,
        getExport,
    ] = useRequest<MultiResponse<Export>>({
        url: 'server://exports/',
        query: {
            project: projectId,
            ordering: activeSort,
            is_preview: false,
            is_archived: isArchived,
            status,
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        method: 'GET',
        autoTrigger: true,
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

    const [
        deletePending,
        ,
        ,
        deleteExport,
    ] = useRequest({
        url: `server://exports/${deleteExportId}/`,
        method: 'DELETE',
        onSuccess: () => {
            getExport();
            setExportCount(oldCount => oldCount - 1);
            if (deleteExportId === selectedExport) {
                setSelectedExport(undefined);
            }
            notify.send({
                title: _ts('export', 'userExportsTitle'),
                type: notify.type.SUCCESS,
                message: _ts('export', 'deleteExportSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        autoTrigger: false,
        onFailure: () => {
            notify.send({
                title: _ts('export', 'userExportsTitle'),
                type: notify.type.ERROR,
                message: _ts('export', 'deleteExportFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
    });

    const [
        archivePending,
        ,
        ,
        archiveExport,
    ] = useRequest({
        url: `server://exports/${archiveExportId}/`,
        method: 'PATCH',
        body: { is_archived: true },
        onSuccess: () => {
            getExport();
            setExportCount(oldCount => oldCount - 1);
            if (archiveExportId === selectedExport) {
                setSelectedExport(undefined);
            }
            notify.send({
                title: _ts('export', 'userExportsTitle'),
                type: notify.type.SUCCESS,
                message: _ts('export', 'archiveExportSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        autoTrigger: false,
        onFailure: () => {
            notify.send({
                title: _ts('export', 'userExportsTitle'),
                type: notify.type.ERROR,
                message: _ts('export', 'archiveExportFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
    });

    const handleExportDelete = useCallback((id) => {
        setDeleteExportId(id);
        deleteExport();
    }, [deleteExport]);

    const handleExportArchive = useCallback((id) => {
        setArchiveExportId(id);
        archiveExport();
    }, [archiveExport]);

    const handleTabChange = useCallback((tab: TabElement) => {
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
                        pending={pending}
                        selectedExport={selectedExport}
                        setSelectedExport={setSelectedExport}
                        activeSort={activeSort}
                        setActiveSort={setActiveSort}
                    />
                ),
                lazyMount: true,
                wrapContainer: true,
            },
            recent: {
                component: () => (
                    <ExportsTable
                        exports={userExports}
                        pending={pending}
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
                        pending={pending}
                        selectedExport={selectedExport}
                        setSelectedExport={setSelectedExport}
                        activeSort={activeSort}
                        setActiveSort={setActiveSort}
                    />
                ),
                lazyMount: true,
                wrapContainer: true,
            },
        }
    ), [
        pending,
        selectedExport,
        userExports,
        activeSort,
        deleteExportId,
        deletePending,
        handleExportDelete,
        archivePending,
        archiveExportId,
        handleExportArchive,
    ]);

    const tabRendererParams = useCallback((_: TabElement, title: string) => ({
        title,
    }), []);

    return (
        <Page
            className={styles.exportedFiles}
            headerClassName={styles.header}
            header={
                <ScrollTabs
                    tabs={tabs}
                    active={activeTab}
                    renderer={TabTitle}
                    onClick={handleTabChange}
                    rendererParams={tabRendererParams}
                />
            }
            mainContentClassName={styles.mainContent}
            mainContent={
                <>
                    <MultiViewContainer
                        containerClassName={styles.left}
                        views={views}
                        active={activeTab}
                    />
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

export default ExportedFiles;
