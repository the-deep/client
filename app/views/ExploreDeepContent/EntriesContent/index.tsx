import React, { useRef, useMemo, useCallback } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { PendingMessage } from '@the-deep/deep-ui';

import {
    DEEP_START_DATE,
    todaysDate,
} from '#utils/common';
import useSizeTracking from '#hooks/useSizeTracking';
import { getTimeseriesWithoutGaps } from '#utils/temporal';

import EntityCreationLineChart from '../EntityCreationLineChart';
import EntriesHeatMap from './EntriesHeatMap';
import BrushLineChart from '../BrushLineChart';

import styles from './styles.css';

interface Props {
    className?: string;
    endDate: number;
    readOnly: boolean;
    startDate: number;
    onEndDateChange: ((newDate: number | undefined) => void) | undefined;
    onStartDateChange: ((newDate: number | undefined) => void) | undefined;
    completeTimeseries: { date: string; count: number }[] | undefined;
    leadsCountByDay: { date: string; count: number }[] | undefined;
    entriesCountByRegion: { centriod?: unknown; count: number }[] | undefined;
    loading?: boolean;
}

function EntriesContent(props: Props) {
    const {
        className,
        endDate,
        startDate,
        onEndDateChange,
        onStartDateChange,
        completeTimeseries,
        leadsCountByDay,
        entriesCountByRegion,
        loading,
        readOnly,
    } = props;

    const barContainerRef = useRef<HTMLDivElement>(null);
    const {
        width,
    } = useSizeTracking(barContainerRef) ?? {};

    const timeseriesWithoutGaps = useMemo(
        () => getTimeseriesWithoutGaps(
            completeTimeseries,
            'month',
            DEEP_START_DATE,
            todaysDate,
        ),
        [completeTimeseries],
    );

    const handleDateRangeChange = useCallback(
        (foo: number | undefined, bar: number | undefined) => {
            if (onStartDateChange) {
                onStartDateChange(foo);
            }
            if (onEndDateChange) {
                onEndDateChange(bar);
            }
        },
        [onStartDateChange, onEndDateChange],
    );

    return (
        <div className={_cs(className, styles.entriesContent)}>
            <div className={styles.mapContainer}>
                {loading && <PendingMessage />}
                <EntriesHeatMap
                    className={styles.map}
                    entriesByRegion={entriesCountByRegion}
                />
            </div>
            <div ref={barContainerRef}>
                <BrushLineChart
                    width={width ?? 0}
                    height={160}
                    data={timeseriesWithoutGaps}
                    endDate={endDate}
                    startDate={startDate}
                    onChange={handleDateRangeChange}
                    readOnly={readOnly}
                />
            </div>
            <EntityCreationLineChart
                heading="Entries"
                endDate={endDate}
                startDate={startDate}
                timeseries={completeTimeseries}
            />
            <EntityCreationLineChart
                heading="Sources"
                timeseries={leadsCountByDay}
                startDate={startDate}
                endDate={endDate}
                loading={loading}
            />
        </div>
    );
}

export default EntriesContent;
