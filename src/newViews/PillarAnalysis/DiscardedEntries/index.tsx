import React, { useCallback, useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ListView,
    MultiSelectInput,
    Pager,
} from '@the-deep/deep-ui';

import { useRequest } from '#utils/request';
import {
    MultiResponse,
} from '#typings';

import _ts from '#ts';
import { notifyOnFailure } from '#utils/requestNotify';

import { EntryFieldsMin } from '../context';
import DiscardedEntry from './DiscardedEntry';
import { DiscardedTags } from '../index';
import styles from './styles.scss';

interface DiscardedEntry extends EntryFieldsMin {
    tag: number;
    tagDisplay: string;
}

const keySelector = (d: DiscardedTags) => d.key;
const labelSelector = (d: DiscardedTags) => d.value;

const maxItemsPerPage = 5;
const entryKeySelector = (d: EntryFieldsMin) => d.id;

interface Props {
    className?: string;
    pillarId: number;
    discardedTags?: DiscardedTags[];
}

function DiscardedEntries(props: Props) {
    const {
        className,
        pillarId,
        discardedTags,
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
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('pillarAnalysis', 'entriesTitle'))({ error: errorBody });
        },
    });

    const entryCardRendererParams = useCallback((key: number, data: DiscardedEntry) => ({
        entryId: key,
        tagDisplay: data.tagDisplay,
        excerpt: data.excerpt,
        imageDetails: data.imageDetails,
        tabularFieldData: data.tabularFieldData,
        type: data.entryType,
        pillarId,
        onEntryUndiscard: triggerEntriesPull,
    }), [pillarId, triggerEntriesPull]);

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
                renderer={DiscardedEntry}
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
            />
        </div>
    );
}

export default DiscardedEntries;
