import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ListView,
    Header,
} from '@the-deep/deep-ui';

import { Entry } from '#types/newEntry';
import EntryListItem from '#components/EntryListItem';
import frameworkMockData from '#views/AnalyticalFramework/mockData';
import FrameworkImageButton from '#components/FrameworkImageButton';
import { AnalysisFramework } from '#types/newAnalyticalFramework';

import entryMockData from '#views/Project/Tagging/mockData';

import styles from './styles.css';

const entryKeySelector = (e: Entry) => e.clientId;

interface Props {
    className?: string;
    framework: Pick<AnalysisFramework, 'id' | 'primaryTagging' | 'secondaryTagging'>;
}

function Review(props: Props) {
    const {
        className,
        framework,
    } = props;

    const entryDataRendererParams = useCallback((_: string, data: Entry, index: number) => ({
        entry: data,
        index,
        framework,
    }), [framework]);

    return (
        <div className={_cs(className, styles.review)}>
            <Header
                actions={(
                    <FrameworkImageButton
                        frameworkId={frameworkMockData.id}
                        label="View framework image for reference"
                        variant="secondary"
                    />
                )}
            />
            <ListView
                keySelector={entryKeySelector}
                renderer={EntryListItem}
                data={entryMockData}
                rendererParams={entryDataRendererParams}
                rendererClassName={styles.entryItem}
            />
        </div>
    );
}

export default Review;