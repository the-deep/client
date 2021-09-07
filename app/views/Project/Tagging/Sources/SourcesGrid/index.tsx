import React, { useState, useMemo } from 'react';
// import { _cs } from '@togglecorp/fujs';
import {
    // ListView,
    Pager,
    Container,
} from '@the-deep/deep-ui';

import { Entry } from '#types/newEntry';
// import frameworkMockData from '#views/AnalyticalFramework/mockData';
import { MultiResponse } from '#types';
import { useRequest } from '#base/utils/restRequest';

// import EntryCard from './EntryCard';

// import styles from './styles.css';

const maxItemsPerPage = 50;

// const entryKeySelector = (entry: Entry) => entry.id;

interface Props {
    className?: string;
    projectId: number;
}

function SourcesGrid(props: Props) {
    const {
        className,
        projectId,
    } = props;

    // FIXME: use this later on
    // eslint-disable-next-line no-console
    console.log(className);

    /*
    const [expandedEntry, setExpandedEntry] = React.useState<number | undefined>();

    const handleHideTagsButtonClick = useCallback(() => {
        setExpandedEntry(undefined);
    }, []);
    */

    const [activePage, setActivePage] = useState(1);

    const entriesQuery = useMemo(
        () => ({
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
            project: projectId,
        }),
        [activePage, projectId],
    );

    const {
        // pending: entryListPending,
        response: entryListResponse,
    } = useRequest<MultiResponse<Entry>>({
        url: 'server://entries/',
        query: entriesQuery,
        method: 'GET',
        failureHeader: 'Entries',
        preserveResponse: true,
    });

    /*
    const entryRendererParams = useCallback((key: number, entry: Entry) => ({
        entry,
        framework: frameworkMockData,
        viewTags: expandedEntry === key,
        leadDetails: entry.lead,
        projectId,
        onViewTagsButtonClick: setExpandedEntry,
        onHideTagsButtonClick: handleHideTagsButtonClick,
        className: _cs(styles.entry, expandedEntry === key && styles.expanded),
    }), [
        expandedEntry,
        projectId,
        handleHideTagsButtonClick,
    ]);
    */

    return (
        <Container
            spacing="compact"
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
            {/*
            <ListView
                className={_cs(styles.sourcesGrid, className)}
                data={entryListResponse?.results}
                renderer={EntryCard}
                rendererParams={entryRendererParams}
                keySelector={entryKeySelector}
                pending={entryListPending}
            />
            */}
        </Container>
    );
}

export default SourcesGrid;
