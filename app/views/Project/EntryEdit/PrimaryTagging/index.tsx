import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { Lead } from '#components/lead/LeadEditForm/schema';

import Sections from './Sections';
import LeftPane, { Entry } from '../LeftPane';
import { Section } from '../types';
import styles from './styles.css';

interface Props {
    className?: string;
    lead?: Lead;
    sections: Section[] | undefined | null;
    frameworkId: string;

    entries?: Entry[];
    onEntriesChange?: React.Dispatch<React.SetStateAction<Entry[]>>;
    activeEntry?: string | undefined;
    onActiveEntryChange?: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function PrimaryTagging(props: Props) {
    const {
        className,
        lead,
        sections,
        frameworkId,
        entries,
        onEntriesChange,
        activeEntry,
        onActiveEntryChange,
    } = props;

    const handleEntryCreate = React.useCallback((newEntry: Entry) => {
        if (!onEntriesChange) {
            return;
        }
        onEntriesChange((oldEntries) => ([
            ...oldEntries,
            newEntry,
        ]));
    }, [onEntriesChange]);

    const handleEntryDelete = React.useCallback((entryId: string) => {
        if (!onEntriesChange) {
            return;
        }
        onEntriesChange((oldEntries) => {
            const i = oldEntries.findIndex((e) => e.clientId === entryId);

            if (i === -1) {
                // eslint-disable-next-line no-console
                console.error('Cannot find entry for deletion', entryId);
                return oldEntries;
            }

            const newEntries = [...oldEntries];
            newEntries.splice(i, 1);

            return newEntries;
        });
    }, [onEntriesChange]);

    const handleExcerptChange = React.useCallback((entryId: string, modifiedExcerpt: string) => {
        if (!onEntriesChange) {
            return;
        }
        onEntriesChange((oldEntries) => {
            const i = oldEntries.findIndex((e) => e.clientId === entryId);

            if (i === -1) {
                // eslint-disable-next-line no-console
                console.error('Cannot find entry for excerpt change', entryId);
                return oldEntries;
            }

            const newEntries = [...oldEntries];
            const newEntry = {
                // FIXME: add pristine/non-pristine value
                ...(newEntries[i]),
                excerpt: modifiedExcerpt,
            };

            newEntries.splice(i, 1, newEntry);

            return newEntries;
        });
    }, [onEntriesChange]);

    return (
        <div className={_cs(className, styles.primaryTagging)}>
            <LeftPane
                className={styles.sourcePreview}
                onEntryCreate={handleEntryCreate}
                entries={entries}
                activeEntry={activeEntry}
                onEntryClick={onActiveEntryChange}
                onEntryDelete={handleEntryDelete}
                onExcerptChange={handleExcerptChange}
                lead={lead}
            />
            {sections && (
                <Sections
                    className={styles.sections}
                    sections={sections}
                    frameworkId={frameworkId}
                />
            )}
        </div>
    );
}

export default PrimaryTagging;
