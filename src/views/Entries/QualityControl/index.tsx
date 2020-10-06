import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import ResizableH from '#rscv/Resizable/ResizableH';
import TableOfContents from '#components/TableOfContents';

// import { Lead } from '#typings/lead';
import { LeadWithGroupedEntriesFields } from '#typings/entry';
import { FrameworkFields } from '#typings/framework';

import EntryCard from './EntryCard';

import styles from './styles.scss';


interface QualityControlProps {
    className?: string;
    projectId: number;
    leadGroupedEntriesList: LeadWithGroupedEntriesFields[];
    framework: FrameworkFields;
}
interface Data {
    id: number;
    title: string;
    children: Data[] | undefined;
}

const toc: Data[] = [
    {
        id: 1,
        title: 'This is Heading',
        children: undefined,
    },
    {
        id: 2,
        title: 'This is Second Heading',
        children: [
            {
                id: 3,
                title: 'This is inner',
                children: undefined,
            },
            {
                id: 4,
                title: 'This is inner',
                children: undefined,
            },
        ],
    },
];

const keySelector = (d: Data) => d.id;
const labelSelector = (d: Data) => d.title;
const childrenSelector = (d: Data) => d.children;

function QualityControl(props: QualityControlProps) {
    const {
        className,
        leadGroupedEntriesList,
        framework,
        // projectId,
    } = props;

    const [deletedEntries, setDeletedEntries] = React.useState<{[key: string]: boolean}>({});

    const handleEntryDelete = React.useCallback((entryId) => {
        setDeletedEntries(oldDeletedEntries => ({ ...oldDeletedEntries, [entryId]: true }));
    }, [setDeletedEntries]);

    const [selected, setSelection] = useState<number | string | undefined>(undefined);

    const handleSelection = (id: number | string) => {
        setSelection(id);
    };

    return (
        <div className={_cs(className, styles.qualityControl)}>
            <ResizableH
                className={styles.resizableContainer}
                leftContainerClassName={styles.left}
                leftChild={(
                    <div className={styles.frameworkSelection}>
                        <TableOfContents
                            options={toc}
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
