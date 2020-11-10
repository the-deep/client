import React, { useCallback, useMemo, useEffect } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { isDefined, _cs } from '@togglecorp/fujs';

import Pager from '#rscv/Pager';
import ResizableH from '#rscv/Resizable/ResizableH';
import TableOfContents from '#components/TableOfContents';
import LoadingAnimation from '#rscv/LoadingAnimation';
import List from '#rscv/List';

import { Lead } from '#typings/lead';
import { EntryFields, EntryLeadType } from '#typings/entry';
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
    selected?: MatrixKeyId;
    parentFooterRef: React.RefObject<HTMLElement>;
}

interface MatrixKeyId {
    key: string;
    id: string;
}

interface PropsFromDispatch {
    setSelection: typeof setQualityControlViewSelectedMatrixKeyAction;
    setActivePage: typeof setQualityControlViewActivePageAction;
    setEntriesCount: typeof setQualityControlViewEntriesCountAction;
}

const keySelector = (d: MatrixTocElement) => d.key;
const idSelector = (d: MatrixTocElement) => d.id;
const labelSelector = (d: MatrixTocElement) => d.title;
const childrenSelector = (d: MatrixTocElement) => d.children;
const entryKeySelector = (d: EntryFields) => d.id;

const mapStateToProps = (state: AppState) => ({
    activePage: qualityControlViewActivePageSelector(state),
    entriesCount: qualityControlViewEntriesCountSelector(state),
    selected: qualityControlViewSelectedMatrixKeySelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    setActivePage: params => dispatch(setQualityControlViewActivePageAction(params)),
    setEntriesCount: params => dispatch(setQualityControlViewEntriesCountAction(params)),
    setSelection: params => dispatch(setQualityControlViewSelectedMatrixKeyAction(params)),
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
        selected,
        setSelection,
        entriesCount,
        setEntriesCount,
        parentFooterRef,
    } = props;

    const processedFilters: [string, string | number | object][] = useMemo(
        () => processEntryFilters(
            entriesFilters,
            framework,
            geoOptions,
            true,
        ),
        [entriesFilters, framework, geoOptions],
    );

    const matrixToc = useMemo(
        () => [
            ...getMatrix1dToc(framework),
            ...getMatrix2dToc(framework),
        ],
        [framework],
    );

    const [entries, setEntries] = React.useState<EntryFields[]>([]);
    const [deletedEntries, setDeletedEntries] = React.useState<{[key: string]: boolean}>({});

    const requestFilters = useMemo(() => {
        const projectFilter: [string, number] = ['project', projectId];
        const selectedMatrixValue: ([string, string] | undefined) = selected
            && [selected.key, selected.id];
        const filters: ([string, string | number | object] | undefined)[] = [
            ...processedFilters,
            selectedMatrixValue,
            projectFilter,
        ];
        return ({
            filters: filters.filter(isDefined),
        });
    }, [selected, projectId, processedFilters]);

    const [
        pending,
        ,
        ,
        getEntries,
    ] = useRequest<MultiResponse<EntryFields>>({
        url: 'server://entries/filter/',
        query: {
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        body: requestFilters as object,
        method: 'POST',
        onSuccess: (successResponse) => {
            setEntries(successResponse.results);
            setEntriesCount({ count: successResponse.count });
        },
    });

    useEffect(
        getEntries,
        [
            getEntries,
            projectId,
            processedFilters,
            activePage,
            selected,
        ],
    );

    const handleEntryDelete = React.useCallback((entryId) => {
        setDeletedEntries(oldDeletedEntries => ({ ...oldDeletedEntries, [entryId]: true }));
    }, [setDeletedEntries]);

    const handleSelection = useCallback(value => (
        selected && selected.id === value.id ?
            setSelection({ matrixKey: undefined }) : setSelection({ matrixKey: value })
    ), [selected, setSelection]);

    const handlePageClick = useCallback((value) => {
        setActivePage({ activePage: value });
    }, [setActivePage]);

    const handleLeadEdit = useCallback((lead: Pick<Lead, EntryLeadType>) => {
        const patchedEntries = entries.map((e) => {
            if (e.lead.id === lead.id) {
                return { ...e, lead };
            }
            return e;
        });
        setEntries(patchedEntries);
    }, [entries]);

    const entryCardRendererParams = useCallback((_, data) => ({
        key: data.id,
        entry: { ...data, lead: data.lead.id },
        lead: data.lead,
        framework,
        isDeleted: deletedEntries[data.id],
        onDelete: handleEntryDelete,
        onLeadChange: handleLeadEdit,
        className: styles.card,
    }),
    [
        handleLeadEdit,
        deletedEntries,
        framework,
        handleEntryDelete,
    ]);

    return (
        <div className={_cs(className, styles.qualityControl)}>
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
                            value={selected}
                            defaultCollapseLevel={5}
                        />
                    </div>
                )}
                rightContainerClassName={styles.right}
                rightChild={(
                    <div className={styles.entryList}>
                        { pending && <LoadingAnimation /> }
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
                            />
                        )}
                    </div>
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
