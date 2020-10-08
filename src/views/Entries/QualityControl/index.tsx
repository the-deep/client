import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import ResizableH from '#rscv/Resizable/ResizableH';
import TableOfContents from '#components/TableOfContents';

// import { Lead } from '#typings/lead';
import { LeadWithGroupedEntriesFields } from '#typings/entry';
import { FrameworkFields } from '#typings/framework';

import { MatrixTocElement } from '#typings';
import { getMatrix1dToc, getMatrix2dToc } from '#utils/framework';

import _ts from '#ts';

import EntryCard from './EntryCard';

import styles from './styles.scss';


interface QualityControlProps {
    className?: string;
    projectId: number;
    leadGroupedEntriesList: LeadWithGroupedEntriesFields[];
    framework: FrameworkFields;
}

const keySelector = (d: MatrixTocElement) => d.id;
const labelSelector = (d: MatrixTocElement) => d.title;
const childrenSelector = (d: MatrixTocElement) => d.children;

function QualityControl(props: QualityControlProps) {
    const {
        className,
        leadGroupedEntriesList,
        // projectId,
        framework,
    } = props;

    const [deletedEntries, setDeletedEntries] = React.useState<{[key: string]: boolean}>({});

    const handleEntryDelete = React.useCallback((entryId) => {
        setDeletedEntries(oldDeletedEntries => ({ ...oldDeletedEntries, [entryId]: true }));
    }, [setDeletedEntries]);

    const [selected, setSelection] = useState<number | string | undefined>(undefined);

    const handleSelection = useCallback((id: number | string) => {
        setSelection(id);
    }, []);

    const matrix1dToc = useMemo(() => getMatrix1dToc(framework), [framework]);
    const matrix2dToc = useMemo(() => getMatrix2dToc(framework), [framework]);

    return (
        <div className={_cs(className, styles.qualityControl)}>
            <ResizableH
                className={styles.resizableContainer}
                leftContainerClassName={styles.left}
                leftChild={(
                    <div className={styles.frameworkSelection}>
                        <div>
                            {_ts('qualityControl', 'matrix1dTitle')}
                        </div>
                        <TableOfContents
                            options={matrix1dToc}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            childrenSelector={childrenSelector}
                            onChange={handleSelection}
                            value={selected}
                        />
                        <div>
                            {_ts('qualityControl', 'matrix2dTitle')}
                        </div>
                        <TableOfContents
                            options={matrix2dToc}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            childrenSelector={childrenSelector}
                            onChange={handleSelection}
                            value={selected}
                        />
                    </div>
                )}
                rightContainerClassName={styles.right}
                rightChild={(
                    <div className={styles.entryList}>
                        { leadGroupedEntriesList.map((leadWithEntries) => {
                            const {
                                entries,
                                ...leadProps
                            } = leadWithEntries;

                            const lead = { ...leadProps };

                            return entries.map(e => (
                                <EntryCard
                                    className={styles.card}
                                    key={e.id}
                                    entry={e}
                                    lead={lead}
                                    framework={framework}
                                    isDeleted={deletedEntries[e.id]}
                                    onDelete={handleEntryDelete}
                                />
                            ));
                        })}
                    </div>
                )}
            />
        </div>
    );
}

export default QualityControl;
