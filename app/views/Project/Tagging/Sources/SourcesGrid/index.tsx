import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { ListView } from '@the-deep/deep-ui';

import { Entry } from '#types/newEntry';
import frameworkMockData from '#views/AnalyticalFramework/mockData';
import { entry1, entry2 } from '#views/Project/Tagging/mockData';

import EntryCard from './EntryCard';

import styles from './styles.css';

export interface EntryWithLead extends Entry {
    leadDetails: {
        id: number;
        title: string;
        createdOn: string;
        publishedOn: string;
        createdByName: string;
        authors: {
            title: string;
        }[];
        source: {
            title: string;
        };
    };
}

const entryKeySelector = (entry: EntryWithLead) => entry.id;

const entries: EntryWithLead[] = [
    {
        ...entry1,
        leadDetails: {
            id: 1,
            title: 'The standard Lorem Ipsum passage, used since the 1500s',
            createdOn: '2020-10-12',
            publishedOn: '2020-09-31',
            createdByName: 'Aditya Katri',
            authors: [{ title: 'ReliefWeb' }],
            source: { title: 'ReliefWeb' },
        },
    },
    {
        ...entry2,
        leadDetails: {
            id: 2,
            title: 'Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC',
            createdOn: '2020-10-12',
            publishedOn: '2020-09-31',
            createdByName: 'Aditya Katri',
            authors: [{ title: 'ReliefWeb' }],
            source: { title: 'ReliefWeb' },
        },
    },
];

interface Props {
    className?: string;
}

function SourcesGrid(props: Props) {
    const { className } = props;
    const [expandedEntry, setExpandedEntry] = React.useState<number | undefined>();
    const handleHideTagsButtonClick = useCallback(() => {
        setExpandedEntry(undefined);
    }, []);

    const entryRendererParams = useCallback((key: number, entry: EntryWithLead) => ({
        entry,
        framework: frameworkMockData,
        viewTags: expandedEntry === key,
        leadDetails: entry.leadDetails,
        onViewTagsButtonClick: setExpandedEntry,
        onHideTagsButtonClick: handleHideTagsButtonClick,
        className: _cs(styles.entry, expandedEntry === key && styles.expanded),
    }), [
        expandedEntry,
        handleHideTagsButtonClick,
    ]);

    return (
        <ListView
            className={_cs(styles.sourcesGrid, className)}
            data={entries}
            renderer={EntryCard}
            rendererParams={entryRendererParams}
            keySelector={entryKeySelector}
        />
    );
}

export default SourcesGrid;
