import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { isDefined, _cs } from '@togglecorp/fujs';

import Pager from '#rscv/Pager';
import ResizableH from '#rscv/Resizable/ResizableH';
import TableOfContents from '#components/TableOfContents';
import LoadingAnimation from '#rscv/LoadingAnimation';

import { EntryFields } from '#typings/entry';
import { FrameworkFields } from '#typings/framework';
import { MatrixTocElement, MultiResponse } from '#typings';

import { processEntryFilters } from '#entities/entries';
import { getMatrix1dToc, getMatrix2dToc } from '#utils/framework';
import useRequest from '#utils/request';

import EntryCard from './EntryCard';
import styles from './styles.scss';

interface QualityControlProps {
    className?: string;
    projectId: number;
    framework: FrameworkFields;
    entriesFilters: {};
    geoOptions: {};
    maxItemsPerPage: number;
}

interface MatrixKeyId {
    key: string;
    id: string;
}

const keySelector = (d: MatrixTocElement) => d.key;
const idSelector = (d: MatrixTocElement) => d.id;
const labelSelector = (d: MatrixTocElement) => d.title;
const childrenSelector = (d: MatrixTocElement) => d.children;

function QualityControl(props: QualityControlProps) {
    const {
        className,
        framework,
        projectId,
        geoOptions,
        entriesFilters,
        maxItemsPerPage,
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

    const [selected, setSelection] = useState<MatrixKeyId | undefined>(undefined);

    const [activePage, setActivePage] = useState<number>(1);

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

    const handleSelection = useCallback((value: MatrixKeyId) => {
        if (selected && selected.id === value.id) {
            setSelection(undefined);
        } else {
            setSelection(value);
        }
    }, [selected]);

    const handlePageClick = useCallback((value: number) => {
        setActivePage(value);
    }, []);

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
                        {response && response.results.map(e => (
                            <EntryCard
                                className={styles.card}
                                key={e.id}
                                entry={e}
                                lead={e.lead}
                                framework={framework}
                                isDeleted={deletedEntries[e.id]}
                                onDelete={handleEntryDelete}
                            />
                        ))}
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

export default QualityControl;
