import React, { useCallback, useMemo, useEffect, useState } from 'react';
import produce from 'immer';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import {
    _cs,
    listToGroupList,
    mapToList,
    isDefined,
} from '@togglecorp/fujs';

import Pager from '#rscv/Pager';
import ResizableH from '#rscv/Resizable/ResizableH';
import TableOfContents from '#components/TableOfContents';
import LoadingAnimation from '#rscv/LoadingAnimation';
import List from '#rscv/List';
import ListView from '#rscv/List/ListView';
import ListItem from '#rscv/ListItem';
import Icon from '#rscg/Icon';

import { EntryFields, EntrySummary } from '#typings/entry';
import { FrameworkFields } from '#typings/framework';
import { MatrixTocElement, MultiResponse, AppState } from '#typings';

import { processEntryFilters } from '#entities/entries';
import { getMatrix1dToc, getMatrix2dToc } from '#utils/framework';
import useRequest from '#utils/request';

import {
    qualityControlViewActivePageSelector,
    qualityControlViewEntriesCountSelector,
    qualityControlViewSelectedMatrixKeySelector,

    setQualityControlViewActivePageAction,
    setQualityControlViewSelectedMatrixKeyAction,
    setQualityControlViewEntriesCountAction,
} from '#redux';

import _ts from '#ts';

import EntryCard from './EntryCard';
import EntriesStats from './EntriesStats';
import {
    FooterContainer,
    EmptyEntries,
} from '../index';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
    projectId: number;
    framework: FrameworkFields;
    entriesFilters: {};
    geoOptions: {};
    maxItemsPerPage: number;
    activePage: number;
    entriesCount: number;
    tocFilters: MatrixKeyId[];
    parentFooterRef: React.RefObject<HTMLElement>;
}

interface MatrixKeyId {
    key: string;
    id: string;
    title: string;
}

interface PropsFromDispatch {
    setTocFilters: typeof setQualityControlViewSelectedMatrixKeyAction;
    setActivePage: typeof setQualityControlViewActivePageAction;
    setEntriesCount: typeof setQualityControlViewEntriesCountAction;
}

interface EntriesWithSummaryResponse<T> extends MultiResponse<T>{
    summary: EntrySummary;
}

const keySelector = (d: MatrixTocElement) => d.key;
const idSelector = (d: MatrixTocElement) => d.id;
const labelSelector = (d: MatrixTocElement) => d.title;
const childrenSelector = (d: MatrixTocElement) => d.children;
const entryKeySelector = (d: EntryFields) => d.id;

const mapStateToProps = (state: AppState) => ({
    activePage: qualityControlViewActivePageSelector(state),
    entriesCount: qualityControlViewEntriesCountSelector(state),
    tocFilters: qualityControlViewSelectedMatrixKeySelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    setActivePage: params => dispatch(setQualityControlViewActivePageAction(params)),
    setEntriesCount: params => dispatch(setQualityControlViewEntriesCountAction(params)),
    setTocFilters: params => dispatch(setQualityControlViewSelectedMatrixKeyAction(params)),
});

type Props = ComponentProps & PropsFromDispatch;

function QualityControl(props: Props) {
    const {
        className,
        framework,
        projectId,
        geoOptions,
        entriesFilters,
        maxItemsPerPage,
        activePage,
        setActivePage,
        tocFilters,
        setTocFilters,
        entriesCount,
        setEntriesCount,
        parentFooterRef,
    } = props;

    const matrixToc = useMemo(
        () => [
            ...getMatrix1dToc(framework),
            ...getMatrix2dToc(framework),
        ],
        [framework],
    );

    const [entries, setEntries] = useState<EntryFields[]>([]);
    const [deletedEntries, setDeletedEntries] = useState<{[key: string]: boolean}>({});
    const [stats, setStats] = useState<EntrySummary | undefined>();

    const requestFilters = useMemo(() => {
        const projectFilter = ['project', projectId];
        const processedFilters = processEntryFilters(
            entriesFilters,
            framework,
            geoOptions,
            true,
        );
        const groupedSelections = listToGroupList(
            tocFilters,
            v => keySelector(v),
            v => idSelector(v),
        );
        const processedTocFilters = mapToList(
            groupedSelections,
            (d, k) => ([
                `${k}__and`,
                d,
            ]),
        );

        const filters = [
            ...processedFilters,
            ...processedTocFilters,
            projectFilter,
        ];

        return ({
            filters: filters.filter(isDefined),
        });
    },
    [
        entriesFilters,
        framework,
        geoOptions,
        tocFilters,
        projectId,
    ]);

    const [
        pending,
        ,
        ,
        getEntries,
    ] = useRequest<EntriesWithSummaryResponse<EntryFields>>({
        url: 'server://entries/filter/',
        query: {
            calculate_summary: 1,
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        body: requestFilters as object,
        method: 'POST',
        onSuccess: (response) => {
            setEntries(response.results);
            setStats(response.summary);
            setEntriesCount({ count: response.count });
        },
    });

    const [
        ,
        ,
        ,
        getEntriesWithStats,
    ] = useRequest<EntriesWithSummaryResponse<EntryFields>>({
        url: 'server://entries/filter/',
        query: {
            calculate_summary: 1,
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        body: requestFilters as object,
        method: 'POST',
        onSuccess: (response) => {
            setStats(response.summary);
        },
    });

    useEffect(
        getEntries,
        [
            projectId,
            activePage,
            requestFilters,
        ],
    );

    const handleEntryEdit = useCallback((updatedEntry) => {
        setEntries(oldEntries => (
            produce(oldEntries, (safeEntries) => {
                const selectedIndex = safeEntries.findIndex(entry => entry.id === updatedEntry.id);
                if (selectedIndex !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeEntries[selectedIndex] = {
                        ...updatedEntry,
                        lead: safeEntries[selectedIndex].lead,
                    };
                }
            })
        ));
        getEntriesWithStats();
    }, [getEntriesWithStats, setEntries]);
    const handleVerificationChange = getEntriesWithStats;
    const handleLeadEdit = useCallback((updatedLead) => {
        getEntriesWithStats();
        setEntries(oldEntries => (
            produce(oldEntries, (safeEntries) => {
                safeEntries.forEach((entry) => {
                    if (entry.lead?.id === updatedLead.id) {
                        // eslint-disable-next-line no-param-reassign
                        entry.lead = updatedLead;
                    }
                });
            })
        ));
    }, [getEntriesWithStats, setEntries]);

    const handleEntryDelete = useCallback((entryId) => {
        getEntriesWithStats();
        setDeletedEntries(oldDeletedEntries => ({ ...oldDeletedEntries, [entryId]: true }));
    }, [setDeletedEntries, getEntriesWithStats]);

    const handleSelection = useCallback((value) => {
        setTocFilters({ tocFilters: value });
    }, [setTocFilters]);

    const handlePageClick = useCallback((value) => {
        setActivePage({ activePage: value });
    }, [setActivePage]);

    const entryCardRendererParams = useCallback((_, data) => ({
        entry: { ...data, lead: data.lead.id },
        lead: data.lead,
        framework,
        isDeleted: deletedEntries[data.id],
        onDelete: handleEntryDelete,
        onLeadChange: handleLeadEdit,
        onEntryChange: handleEntryEdit,
        onVerificationChange: handleVerificationChange,
        className: styles.card,
    }),
    [
        handleLeadEdit,
        handleEntryEdit,
        deletedEntries,
        framework,
        handleEntryDelete,
        handleVerificationChange,
    ]);

    const tocFilterRendererParams = useCallback((_: string, data: MatrixKeyId) => ({
        value: labelSelector(data),
    }), []);

    return (
        <div className={_cs(className, styles.qualityControl)}>
            <EntriesStats
                className={styles.stats}
                stats={stats}
            />
            <ResizableH
                className={styles.resizableContainer}
                leftContainerClassName={styles.left}
                leftChild={(
                    <div className={styles.frameworkSelection}>
                        <header className={styles.header}>
                            <h3 className={styles.heading}>
                                {_ts('entries.qualityControl', 'tableOfContentHeading')}
                            </h3>
                        </header>
                        <TableOfContents
                            className={styles.content}
                            options={matrixToc}
                            idSelector={idSelector}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            childrenSelector={childrenSelector}
                            onChange={handleSelection}
                            value={tocFilters}
                            defaultCollapseLevel={5}
                            multiple
                        />
                    </div>
                )}
                rightContainerClassName={styles.right}
                rightChild={(
                    <>
                        { pending && <LoadingAnimation /> }
                        <h3 className={styles.tocFilterList}>
                            <Icon
                                className={styles.infoIcon}
                                name="info"
                            />
                            {tocFilters.length > 0
                                ? _ts('entries.qualityControl', 'selectedTocFilters')
                                : _ts('entries.qualityControl', 'noSelectedTocFilters')
                            }
                            {tocFilters.length > 0 && (
                                <ListView
                                    className={styles.tocFilterNames}
                                    data={tocFilters}
                                    keySelector={idSelector}
                                    renderer={ListItem}
                                    rendererParams={tocFilterRendererParams}
                                />
                            )}
                        </h3>
                        <div className={styles.entryList}>
                            { (entries && entries.length > 0) ? (
                                <List
                                    data={entries}
                                    keySelector={entryKeySelector}
                                    renderer={EntryCard}
                                    rendererParams={entryCardRendererParams}
                                />
                            ) : (
                                <EmptyEntries
                                    projectId={projectId}
                                    entriesFilters={entriesFilters}
                                    tocFilters={tocFilters}
                                />
                            )}
                        </div>
                    </>
                )}
            />
            <FooterContainer parentFooterRef={parentFooterRef}>
                <Pager
                    activePage={activePage}
                    itemsCount={entriesCount}
                    maxItemsPerPage={maxItemsPerPage}
                    onPageClick={handlePageClick}
                    showItemsPerPageChange={false}
                />
            </FooterContainer>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(QualityControl);
