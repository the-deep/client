import React from 'react';
import {
    _cs,
} from '@togglecorp/fujs';

import EntityCreationLineChart from '../EntityCreationLineChart';

import styles from './styles.css';

type Timeseries = {
    date: string;
    count: number;
}

interface Props {
    className?: string;
    sourcesTimeseries: Timeseries[] | undefined;
    entriesTimeseries: Timeseries[] | undefined;
}

function EntriesContent(props: Props) {
    const {
        className,
        sourcesTimeseries,
        entriesTimeseries,
    } = props;

    return (
        <div className={_cs(className, styles.entriesContent)}>
            <EntityCreationLineChart
                heading="Entries"
                timeseries={entriesTimeseries}
            />
            <EntityCreationLineChart
                heading="Sources"
                timeseries={sourcesTimeseries}
            />
        </div>
    );
}

export default EntriesContent;
