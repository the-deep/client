import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Container,
} from '@the-deep/deep-ui';

import { Entry } from '#types/newEntry';
import EntryListItem from '#components/EntryListItem';
import frameworkMockData from '#views/AnalyticalFramework/mockData';
import { entry1 } from '#views/Project/Tagging/mockData';
import EntryVerification from './EntryVerification';
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

interface Props {
    className?: string;
    entry: Entry;
}

function EntryItem(props: Props) {
    const {
        className,
        entry,
    } = props;

    const handleChange = useCallback((value: Entry) => {
        console.warn('handleChange', value); // TODO handle entry verification later
    }, []);

    return (
        <Container
            className={_cs(className, styles.entryItemContainer)}
            headerClassName={styles.header}
            contentClassName={styles.content}
            headerActions={(
                <EntryVerification
                    entryId={entry.id}
                    projectId={entry.project}
                    onSuccess={handleChange}
                    value={entry.verified}
                    verifiedByCount={entry.verifiedByCount}
                />
            )}
        >
            <EntryListItem
                className={styles.entry}
                entry={entry1} // TODO remove mock entry usage when actual usable entry is available
                framework={frameworkMockData}
            />
        </Container>
    );
}

export default EntryItem;
