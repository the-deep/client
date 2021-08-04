import React from 'react';
import { _cs } from '@togglecorp/fujs';

import SourceDetails, { Entry } from './SourceDetails';
import { Lead } from '#views/Sources/LeadEditModal/LeadEditForm/schema';
import styles from './styles.css';

interface Props {
    className?: string;
    lead?: Lead;
}

function PrimaryTagging(props: Props) {
    const {
        className,
        lead,
    } = props;

    const [entries, setEntries] = React.useState<Entry[]>([]);
    const [activeEntry, setActiveEntry] = React.useState<Entry['clientId'] | undefined>();

    const handleEntryCreate = React.useCallback((newEntry: Entry) => {
        setEntries((oldEntries) => ([
            ...oldEntries,
            newEntry,
        ]));
    }, [setEntries]);

    const handleEntryDelete = React.useCallback((entryId: string) => {
        setEntries((oldEntries) => {
            const i = oldEntries.findIndex((e) => e.clientId === entryId);

            if (i === -1) {
                return oldEntries;
            }

            const newEntries = [...oldEntries];
            newEntries.splice(i, 1);

            return newEntries;
        });
    }, [setEntries]);

    const handleExcerptChange = React.useCallback((entryId: string, modifiedExcerpt: string) => {
        setEntries((oldEntries) => {
            const i = oldEntries.findIndex((e) => e.clientId === entryId);

            if (i === -1) {
                return oldEntries;
            }

            const newEntries = [...oldEntries];
            const newEntry = {
                ...(newEntries[i]),
                excerpt: modifiedExcerpt,
            };

            newEntries.splice(i, 1, newEntry);

            return newEntries;
        });
    }, [setEntries]);

    return (
        <div className={_cs(className, styles.primaryTagging)}>
            <SourceDetails
                className={styles.sourcePreview}
                onEntryCreate={handleEntryCreate}
                entries={entries}
                activeEntry={activeEntry}
                onEntryClick={setActiveEntry}
                onEntryDelete={handleEntryDelete}
                onExcerptChange={handleExcerptChange}
                lead={lead}
            />
            <div className={styles.taggingPlayground}>
                Tagging playground
            </div>
        </div>
    );
}

export default PrimaryTagging;
