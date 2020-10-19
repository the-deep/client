import React, { useCallback, useMemo, useEffect } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { isDefined, _cs } from '@togglecorp/fujs';


import Pager from '#rscv/Pager';
import ResizableH from '#rscv/Resizable/ResizableH';
import TableOfContents from '#components/TableOfContents';
import LoadingAnimation from '#rscv/LoadingAnimation';
import List from '#rscv/List';

import { EntryFields } from '#typings/entry';
import { FrameworkFields } from '#typings/framework';
import { MatrixTocElement, MultiResponse, AppState } from '#typings';

import { processEntryFilters } from '#entities/entries';
import { getMatrix1dToc, getMatrix2dToc } from '#utils/framework';
import useRequest from '#utils/request';

import {
    qualityControlViewActivePageSelector,
    setQualityControlViewActivePageAction,
    qualityControlViewSelectedMatrixKeySelector,
    setQualityControlViewSelectedMatrixKeyAction,
} from '#redux';

import EntryCard from './EntryCard';
import styles from './styles.scss';

interface ComponentProps {
    className?: string;
    projectId: number;
    framework: FrameworkFields;
    entriesFilters: {};
    geoOptions: {};
    maxItemsPerPage: number;
    activePage: number;
    selected?: MatrixKeyId;
}

interface MatrixKeyId {
    key: string;
    id: string;
}

interface PropsFromDispatch {
    setSelection: typeof setQualityControlViewSelectedMatrixKeyAction;
    setActivePage: typeof setQualityControlViewActivePageAction;
}

const keySelector = (d: MatrixTocElement) => d.key;
const idSelector = (d: MatrixTocElement) => d.id;
const labelSelector = (d: MatrixTocElement) => d.title;
const childrenSelector = (d: MatrixTocElement) => d.children;
const entryKeySelector = (d: EntryFields) => d.id;

const mapStateToProps = (state: AppState) => ({
    activePage: qualityControlViewActivePageSelector(state),
    selected: qualityControlViewSelectedMatrixKeySelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    setActivePage: params => dispatch(setQualityControlViewActivePageAction(params)),
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
    } = props;

    const processedFilters = useMemo(
        () => processEntryFilters(
            entriesFilters,
            framework,
            geoOptions,
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

    const [deletedEntries, setDeletedEntries] = React.useState<{[key: string]: boolean}>({});

    const [
        pending,
        response,
        ,
        getEntries,
    ] = useRequest<MultiResponse<EntryFields>>({
        url: 'server://entries/filter/',
        query: {
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        body: {
            filters: [
                selected && Object.values(selected),
                ...processedFilters,
                ['project', projectId],
            ].filter(isDefined),
        },
        method: 'POST',
    });

    console.warn('activePage', activePage, selected);
    useEffect(
        () => getEntries(),
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

    const handleSelection = useCallback((value) => {
        if (selected && selected.id === value.id) {
            setSelection({ matrixKey: undefined });
        } else {
            setSelection({ matrixKey: value });
        }
    }, [selected, setSelection]);

    const handlePageClick = useCallback((value) => {
        setActivePage({ activePage: value });
    }, [setActivePage]);

    const entryCardRendererParams = useCallback((_, data) => ({
        key: data.id,
        entry: data,
        lead: data.lead,
        framework,
        isDeleted: deletedEntries[data.id],
        onDelete: handleEntryDelete,
    }),
    [
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
                        <TableOfContents
                            options={matrixToc}
                            idSelector={idSelector}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            childrenSelector={childrenSelector}
                            onChange={handleSelection}
                            value={selected}
                            defaultCollapseLevel={1}
                        />
                    </div>
                )}
                rightContainerClassName={styles.right}
                rightChild={(
                    <div className={styles.entryList}>
                        { pending && <LoadingAnimation /> }
                        { response && (
                            <List
                                data={response.results}
                                keySelector={entryKeySelector}
                                renderer={EntryCard}
                                rendererParams={entryCardRendererParams}
                            />
                        )}
                    </div>
                )}
            />
            <footer className={styles.footer}>
                <Pager
                    activePage={activePage}
                    itemsCount={response?.count}
                    maxItemsPerPage={maxItemsPerPage}
                    onPageClick={handlePageClick}
                    showItemsPerPageChange={false}
                />
            </footer>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(QualityControl);
