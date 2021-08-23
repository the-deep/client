import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Container,
} from '@the-deep/deep-ui';

import { useLazyRequest } from '#base/utils/restRequest';
import { Entry } from '#types/newEntry';
import EntryListItem from '#components/EntryListItem';
import frameworkMockData from '#views/AnalyticalFramework/mockData';
import { entry1 } from '#views/Project/Tagging/mockData';
import EntryVerification from './EntryVerification';
import EntryControl from './EntryControl';
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
        entry: entryFromProps,
    } = props;

    const [entry, setEntry] = useState<Entry>(entryFromProps);

    const {
        pending,
        trigger: getEntry,
    } = useLazyRequest<Entry, number>({
        url: (ctx) => `server://v2/entries/${ctx}/`,
        method: 'GET',
        onSuccess: (response) => {
            setEntry(response);
        },
        failureHeader: 'Entry',
    });

    return (
        <Container
            className={_cs(className, styles.entryItemContainer)}
            headerClassName={styles.header}
            contentClassName={styles.content}
            headerActions={(
                <div className={styles.actions}>
                    <EntryVerification
                        className={styles.verificationAction}
                        entryId={entry.id}
                        projectId={entry.project}
                        verifiedBy={entry.verifiedBy}
                        onVerificationChange={getEntry}
                        disabled={pending}
                    />
                    <EntryControl
                        entryId={entry.id}
                        projectId={entry.project}
                        value={entry.controlled}
                        onChange={getEntry}
                        disabled={pending}
                    />
                </div>
            )}
        >
            <EntryListItem
                className={styles.entry}
                entry={entry1} // TODO remove mock entry usage when actual usable entry is available
                framework={frameworkMockData}
                readOnly
            />
        </Container>
    );
}

export default EntryItem;
