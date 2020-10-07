import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ResizableH from '#rscv/Resizable/ResizableH';

import { Lead } from '#typings/lead';
import { LeadWithGroupedEntriesFields } from '#typings/entry';

import EntryCard from './EntryCard';

import styles from './styles.scss';


interface QualityControlProps {
    className?: string;
    projectId: number;
    leadGroupedEntriesList: LeadWithGroupedEntriesFields[];
}

function QualityControl(props: QualityControlProps) {
    const {
        className,
        leadGroupedEntriesList,
        // projectId,
    } = props;

    return (
        <div className={_cs(className, styles.qualityControl)}>
            <ResizableH
                className={styles.resizableContainer}
                leftContainerClassName={styles.left}
                leftChild={(
                    <div className={styles.frameworkSelection}>
                        Framework selection
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
