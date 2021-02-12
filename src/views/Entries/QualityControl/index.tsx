import React, { useCallback, useMemo, useEffect, useState } from 'react';
import produce from 'immer';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import {
    _cs,
    mapToList,
    isDefined,
    listToGroupList,
    mapToMap,
    listToMap,
} from '@togglecorp/fujs';

import Pager from '#rscv/Pager';
import TableOfContents from '#components/TableOfContents';
import LoadingAnimation from '#rscv/LoadingAnimation';
import List from '#rscv/List';
import ListView from '#rscv/List/ListView';
import Icon from '#rscg/Icon';
import SelectInput from '#rsci/SelectInput';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { EntryFields, EntrySummary, TocCountMap } from '#typings/entry';
import { FrameworkFields } from '#typings/framework';
import { MatrixTocElement, MultiResponse, AppState } from '#typings';

import { processEntryFilters } from '#entities/entries';
import { getMatrix1dToc, getMatrix2dToc } from '#utils/framework';
import { flatten } from '#utils/common';
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

import Chip from './Chip';
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

interface MatrixKeyId extends MatrixTocElement {
    key: string;
}

interface PropsFromDispatch {
    setTocFilters: typeof setQualityControlViewSelectedMatrixKeyAction;
    setActivePage: typeof setQualityControlViewActivePageAction;
    setEntriesCount: typeof setQualityControlViewEntriesCountAction;
}

interface EntriesWithSummaryResponse<T> extends MultiResponse<T>{
    summary: EntrySummary;
}

const tocFilterKeySelector = (d: MatrixKeyId) => d.key;
const tocFilterIdSelector = (d: MatrixKeyId) => d.id;
const keySelector = (d: MatrixTocElement) => d.key;
const idSelector = (d: MatrixTocElement) => d.uniqueId;
const labelSelector = (d: MatrixTocElement) => d.title;
const verifiedCountSelector = (d: MatrixTocElement) => d.verified;
const unverifiedCountSelector = (d: MatrixTocElement) => d.unverified;
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

interface CollapseLevel {
    min: number;
    max: number;
}

const collapseLevel: CollapseLevel = {
    min: 0,
    max: 5,
};

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

    const [isExpanded, setExpansion] = useState(true);

    const handleTocCollapse = useCallback(() => {
        setExpansion(false);
    }, [setExpansion]);

    const handleTocExpand = useCallback(() => {
        setExpansion(true);
    }, [setExpansion]);

    const [entries, setEntries] = useState<EntryFields[]>([]);

    const [deletedEntries, setDeletedEntries] = useState<{[key: string]: boolean}>({});
    const [stats, setStats] = useState<EntrySummary>();
    const [tocCount, setTocCount] = useState<TocCountMap>({});
    const [searchValue, setSearchValue] = useState<string | undefined>();
    const [defaultCollapseLevel, setDefaultCollapseLevel] = useState(collapseLevel.min);

    const matrixToc = useMemo(
        () => [
            ...getMatrix1dToc(framework, tocCount),
            ...getMatrix2dToc(framework, tocCount),
        ],
        [framework, tocCount],
    );

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
            v => tocFilterKeySelector(v),
            v => tocFilterIdSelector(v),
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
            calculate_count_per_toc_item: 1,
            calculate_summary: 1,
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        body: requestFilters as object,
        method: 'POST',
        onSuccess: (response) => {
            const count = mapToMap(
                listToGroupList(response.summary?.countPerTocItem ?? [], d => d.widgetKey),
                k => k,
                e => listToMap(e, i => i.labelKey),
            );
            setTocCount(count);
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
            calculate_count_per_toc_item: 1,
            calculate_summary: 1,
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        body: requestFilters as object,
        method: 'POST',
        onSuccess: (response) => {
            const count = mapToMap(
                listToGroupList(response.summary?.countPerTocItem ?? [], d => d.widgetKey),
                k => k,
                e => listToMap(e, i => i.labelKey),
            );
            setTocCount(count);
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
        className: styles.card,
    }),
    [
        handleLeadEdit,
        handleEntryEdit,
        deletedEntries,
        framework,
        handleEntryDelete,
    ]);

    const handleRemoveSelection = useCallback((id: string) => {
        const newTocFilters = tocFilters.filter(f => idSelector(f) !== id);
        setTocFilters({ tocFilters: newTocFilters });
    }, [setTocFilters, tocFilters]);

    const tocFilterRendererParams = useCallback((id: string, data: MatrixKeyId) => ({
        id,
        className: styles.chip,
        label: labelSelector(data),
        onClose: handleRemoveSelection,
    }), [handleRemoveSelection]);

    const searchValues: MatrixKeyId[] = useMemo(() =>
        flatten(matrixToc, childrenSelector).filter((v: MatrixTocElement) => v.key),
    [matrixToc]);

    const handleIndividualSelection = useCallback((id: string) => {
        setSearchValue(id);
        const currentIndex = tocFilters.findIndex(f => idSelector(f) === id);
        const newTocFilters = [...tocFilters];

        if (currentIndex === -1) {
            const newObj = searchValues.find(f => idSelector(f) === id);
            if (newObj) {
                newTocFilters.push(newObj);
            }
        }
        setTocFilters({ tocFilters: newTocFilters });
    }, [setTocFilters, tocFilters, searchValues]);

    const handleToggleExpand = useCallback(() => {
        if (defaultCollapseLevel === collapseLevel.max) {
            setDefaultCollapseLevel(collapseLevel.min);
        } else {
            setDefaultCollapseLevel(collapseLevel.max);
        }
    }, [defaultCollapseLevel]);

    return (
        <div className={_cs(className, styles.qualityControl)}>
            <EntriesStats
                className={styles.stats}
                stats={stats}
                entriesFilters={entriesFilters}
            />
            <div className={styles.wrappingContainer}>
                <div className={_cs(styles.left, !isExpanded && styles.hidden)}>
                    <div className={styles.frameworkSelection}>
                        <header className={styles.header}>
                            <div className={styles.top}>
                                <h3 className={styles.heading}>
                                    <Button
                                        className={styles.collapseButton}
                                        onClick={handleTocCollapse}
                                        iconName="chevronLeft"
                                    />
                                    {_ts('entries.qualityControl', 'tableOfContentHeading')}
                                </h3>
                                <Button
                                    className={styles.toggleExpandButton}
                                    onClick={handleToggleExpand}
                                    transparent
                                    iconName={defaultCollapseLevel === collapseLevel.min ? 'chevronDown' : 'chevronUp'}
                                    title={defaultCollapseLevel === collapseLevel.min ?
                                        _ts('entries.qualityControl', 'expandAll')
                                        : _ts('entries.qualityControl', 'collapseAll')
                                    }
                                />
                            </div>
                            <SelectInput
                                onChange={handleIndividualSelection}
                                options={searchValues}
                                value={undefined}
                                placeholder={_ts('entries.qualityControl', 'searchInputPlacehoder')}
                                keySelector={idSelector}
                                labelSelector={labelSelector}
                                showHintAndError={false}
                            />
                        </header>
                    </div>
                    <TableOfContents
                        className={styles.content}
                        options={matrixToc}
                        idSelector={idSelector}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        childrenSelector={childrenSelector}
                        verifiedCountSelector={verifiedCountSelector}
                        unverifiedCountSelector={unverifiedCountSelector}
                        onChange={handleSelection}
                        searchValue={searchValue}
                        value={tocFilters}
                        defaultCollapseLevel={defaultCollapseLevel}
                        multiple
                    />
                </div>
                <div className={styles.right}>
                    { pending && <LoadingAnimation /> }
                    <h3 className={styles.tocFilterList}>
                        {!isExpanded && (
                            <PrimaryButton
                                className={styles.expandButton}
                                onClick={handleTocExpand}
                                iconName="list"
                                title={_ts('entries.qualityControl', 'showTableOfContents')}
                            />
                        )}
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
                                renderer={Chip}
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
                </div>
            </div>
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
