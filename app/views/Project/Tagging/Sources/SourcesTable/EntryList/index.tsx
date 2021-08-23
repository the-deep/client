import React, { useMemo, useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Container,
    ListView,
    Pager,
} from '@the-deep/deep-ui';
import { MultiResponse } from '#types';
import { Entry } from '#types/newEntry';
import { useRequest } from '#base/utils/restRequest';
import EntryItem from './EntryItem';
import styles from './styles.css';

const maxItemsPerPage = 1;
const entryKeySelector = (e: Entry) => e.clientId;

interface Props {
    className?: string;
    leadId: number;
    projectId: number;
}

function EntryList(props: Props) {
    const {
        leadId,
        projectId,
        className,
    } = props;

    console.warn('lead', leadId, projectId);
    const [activePage, setActivePage] = useState(1);

    const entriesQuery = useMemo(
        () => ({
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
            lead: leadId,
            project: projectId,
        }),
        [activePage, leadId, projectId],
    );
    console.warn('entriesQuery', entriesQuery);
    const {
        pending: entryListPending,
        response: entryListResponse,
    } = useRequest<MultiResponse<Entry>>({
        url: 'server://entries/',
        query: entriesQuery,
        method: 'GET',
        failureHeader: 'Entries',
    });

    const entryDataRendererParams = useCallback((_: string, data: Entry) => ({
        entry: data,
    }), []);

    return (
        <Container
            className={_cs(className, styles.entryListContainer)}
            contentClassName={styles.content}
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={entryListResponse?.count ?? 0}
                    maxItemsPerPage={maxItemsPerPage}
                    onActivePageChange={setActivePage}
                    itemsPerPageControlHidden
                    hideInfo
                />
            )}
        >
            <ListView
                className={styles.entryList}
                keySelector={entryKeySelector}
                renderer={EntryItem}
                data={entryListResponse?.results}
                rendererParams={entryDataRendererParams}
                rendererClassName={styles.entryItem}
                pending={entryListPending}
            />
        </Container>
    );
}

export default EntryList;
