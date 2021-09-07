import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ListView,
    Container,
} from '@the-deep/deep-ui';

import { Entry } from '#types/newEntry';
import EntryListItem from '#components/entry/EntryListItem';
import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import { Section, Widget } from '#types/newAnalyticalFramework';

import entryMockData from '#views/Project/Tagging/mockData';

import styles from './styles.css';

const entryKeySelector = (e: Entry) => e.clientId;

interface Props {
    className?: string;
    frameworkId: string | undefined;
    secondaryTagging: Widget[] | undefined;
    primaryTagging: Section[] | undefined;
}

function Review(props: Props) {
    const {
        className,
        frameworkId,
        secondaryTagging,
        primaryTagging,
    } = props;

    const entryDataRendererParams = useCallback((_: string, data: Entry, index: number) => ({
        entry: data,
        index,
        secondaryTagging,
        primaryTagging,
    }), [secondaryTagging, primaryTagging]);

    return (
        <Container
            className={_cs(className, styles.review)}
            headerActions={(
                <FrameworkImageButton
                    frameworkId={frameworkId}
                    label="View framework image for reference"
                    variant="secondary"
                />
            )}
        >
            <ListView
                className={styles.entries}
                keySelector={entryKeySelector}
                renderer={EntryListItem}
                data={entryMockData}
                rendererParams={entryDataRendererParams}
            />
        </Container>
    );
}

export default Review;
