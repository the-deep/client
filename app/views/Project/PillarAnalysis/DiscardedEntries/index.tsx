import React, { useCallback, useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ListView,
    MultiSelectInput,
    Pager,
} from '@the-deep/deep-ui';

import { useRequest } from '#base/utils/restRequest';
import {
    MultiResponse,
} from '#types';
import {
    EntryType,
    TabularDataFields,
} from '#types/entry';

import _ts from '#ts';

import DiscardedEntryItem, { Props as DiscardedEntryProps } from './DiscardedEntry';
import { DiscardedTags } from '../index';
import styles from './styles.css';

const entryMap = {
    excerpt: 'EXCERPT',
    image: 'IMAGE',
    dataSeries: 'DATA_SERIES',
} as const;

interface DiscardedEntry {
    id: number;
    entry: number;
    tag: number;
    tagDisplay: string;
    entryDetails: {
        id: number;
        droppedExcerpt?: string;
        entryType: EntryType;
        excerpt?: string;
        imageDetails?: {
            id: string;
            title?: string;
            file?: string;
        };
        tabularFieldData?: TabularDataFields;
    };
}

const keySelector = (d: DiscardedTags) => d.key;
const labelSelector = (d: DiscardedTags) => d.value;

const maxItemsPerPage = 5;
const entryKeySelector = (d: DiscardedEntry) => d.entry;

interface Props {
    className?: string;
    pillarId: number;
    discardedTags?: DiscardedTags[];
    onUndiscardSuccess: () => void;
}

function DiscardedEntries(props: Props) {
    const {
        className,
        pillarId,
        discardedTags,
        onUndiscardSuccess,
    } = props;

    const [activePage, setActivePage] = useState(1);
    const [entriesCount, setEntriesCount] = useState(0);
    const [selectedDiscardedTag, setSelectedDiscardedTag] = useState<number[] | undefined>();

    const entriesRequestQuery = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
        tag: selectedDiscardedTag,
    }), [activePage, selectedDiscardedTag]);

    const {
        pending: pendingEntries,
        response: entriesResponse,
        retrigger: triggerEntriesPull,
    } = useRequest<MultiResponse<DiscardedEntry>>({
        url: `server://analysis-pillar/${pillarId}/discarded-entries/`,
        query: entriesRequestQuery,
        onSuccess: (response) => {
            setEntriesCount(response.count);
        },
        failureHeader: _ts('pillarAnalysis', 'entriesTitle'),
    });

    const handleEntryUndiscard = useCallback(() => {
        triggerEntriesPull();
        onUndiscardSuccess();
    }, [triggerEntriesPull, onUndiscardSuccess]);

    const entryCardRendererParams = useCallback(
        (_: number, data: DiscardedEntry): DiscardedEntryProps => ({
            discardedEntryId: data.id,
            tagDisplay: data.tagDisplay,
            excerpt: data.entryDetails.excerpt ?? '',
            image: data.entryDetails?.imageDetails?.file ? ({
                id: String(data.entryDetails.imageDetails.id),
                title: data.entryDetails.imageDetails.title ?? '',
                file: {
                    url: data.entryDetails.imageDetails.file,
                },
            }) : undefined,
            entryType: entryMap[data.entryDetails.entryType],
            pillarId,
            onEntryUndiscard: handleEntryUndiscard,
        }),
        [pillarId, handleEntryUndiscard],
    );

    const handleDiscardedTagFilterChange = useCallback((newValue: number[]) => {
        setActivePage(0);
        setSelectedDiscardedTag(newValue);
    }, []);

    return (
        <div className={_cs(className, styles.discardedEntries)}>
            <div className={styles.filter}>
                <MultiSelectInput
                    name="discardedType"
                    // FIXME: Use string
                    label="Discarded Type"
                    options={discardedTags}
                    value={selectedDiscardedTag}
                    onChange={handleDiscardedTagFilterChange}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                />
            </div>
            <ListView
                className={styles.list}
                data={entriesResponse?.results}
                keySelector={entryKeySelector}
                renderer={DiscardedEntryItem}
                rendererParams={entryCardRendererParams}
                pending={pendingEntries}
            />
            <Pager
                className={styles.footer}
                activePage={activePage}
                itemsCount={entriesCount}
                maxItemsPerPage={maxItemsPerPage}
                onActivePageChange={setActivePage}
                itemsPerPageControlHidden
                hideInfo
            />
        </div>
    );
}

export default DiscardedEntries;
