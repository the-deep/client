import React, { useRef, useMemo } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';

import {
    DEEP_START_DATE,
    todaysDate,
    convertDateToIsoDateTime,
} from '#utils/common';
import {
    EntriesCountTimeseriesQuery,
    EntriesCountTimeseriesQueryVariables,
    EntriesMapDataQuery,
    EntriesMapDataQueryVariables,
} from '#generated/types';
import useSizeTracking from '#hooks/useSizeTracking';
import { getTimeseriesWithoutGaps } from '#utils/temporal';

import EntityCreationLineChart from '../EntityCreationLineChart';
import { FormType as ProjectFilterType } from '../ProjectFilters';
import EntriesHeatMap from './EntriesHeatMap';
import BrushLineChart from '../BrushLineChart';

import styles from './styles.css';

const ENTRIES_COUNT_TIMESERIES = gql`
query EntriesCountTimeseries(
    $dateFrom: DateTime!,
    $dateTo: DateTime!,
    $includeEntryLessThan: Boolean,
    $isTest: Boolean,
    $organizations: [ID!],
    $regions: [ID!],
    $search: String,
) {
    deepExploreStats(
        filter: {
            dateFrom: $dateFrom,
            dateTo: $dateTo,
            project: {
                includeEntryLessThan: $includeEntryLessThan,
                isTest: $isTest,
                organizations: $organizations,
                regions: $regions,
                search: $search,
            },
        }
    ) {
        entriesCountByDay {
            date
            count
        }
    }
}`;

const ENTRIES_MAP_DATA = gql`
query EntriesMapData(
    $dateFrom: DateTime!,
    $dateTo: DateTime!,
    $includeEntryLessThan: Boolean,
    $isTest: Boolean,
    $organizations: [ID!],
    $regions: [ID!],
    $search: String,
) {
    deepExploreStats(
        filter: {
            dateFrom: $dateFrom,
            dateTo: $dateTo,
            project: {
                includeEntryLessThan: $includeEntryLessThan,
                isTest: $isTest,
                organizations: $organizations,
                regions: $regions,
                search: $search,
            },
        }
    ) {
        leadsCountByDay {
            date
            count
        }
        entriesCountByRegion {
            centroid
            count
        }
    }
}`;

interface Props {
    className?: string;
    projectFilters: ProjectFilterType | undefined;
    endDate: number;
    startDate: number;
    onEndDateChange: (newDate: number | undefined) => void;
    onStartDateChange: (newDate: number | undefined) => void;
}

function EntriesContent(props: Props) {
    const {
        className,
        projectFilters,
        endDate,
        startDate,
        onEndDateChange,
        onStartDateChange,
    } = props;

    const timeseriesVariables: EntriesCountTimeseriesQueryVariables = useMemo(() => ({
        dateFrom: convertDateToIsoDateTime(DEEP_START_DATE),
        dateTo: convertDateToIsoDateTime(todaysDate, { endOfDay: true }),
        search: projectFilters?.search,
        isTest: projectFilters?.excludeTestProject ? false : undefined,
        organizations: projectFilters?.organizations,
        regions: projectFilters?.regions,
        includeEntryLessThan: !projectFilters?.excludeProjectsLessThan,
    }), [projectFilters]);

    const {
        previousData: previousTimeseriesData,
        data: timeseriesData = previousTimeseriesData,
    } = useQuery<EntriesCountTimeseriesQuery, EntriesCountTimeseriesQueryVariables>(
        ENTRIES_COUNT_TIMESERIES,
        {
            variables: timeseriesVariables,
        },
    );

    const mapDataVariables: EntriesMapDataQueryVariables = useMemo(() => ({
        dateFrom: convertDateToIsoDateTime(new Date(startDate)),
        dateTo: convertDateToIsoDateTime(new Date(endDate), { endOfDay: true }),
        search: projectFilters?.search,
        isTest: projectFilters?.excludeTestProject ? false : undefined,
        organizations: projectFilters?.organizations,
        regions: projectFilters?.regions,
        includeEntryLessThan: !projectFilters?.excludeProjectsLessThan,
    }), [
        projectFilters,
        endDate,
        startDate,
    ]);

    const {
        previousData: previousEntriesMapData,
        data: entriesMapData = previousEntriesMapData,
    } = useQuery<EntriesMapDataQuery, EntriesMapDataQueryVariables>(
        ENTRIES_MAP_DATA,
        {
            variables: mapDataVariables,
        },
    );

    const barContainerRef = useRef<HTMLDivElement>(null);
    const {
        width,
    } = useSizeTracking(barContainerRef) ?? {};

    const timeseriesWithoutGaps = useMemo(
        () => getTimeseriesWithoutGaps(
            timeseriesData?.deepExploreStats?.entriesCountByDay ?? undefined,
            'month',
            DEEP_START_DATE,
            todaysDate,
        ),
        [timeseriesData?.deepExploreStats?.entriesCountByDay],
    );

    return (
        <div className={_cs(className, styles.entriesContent)}>
            <EntriesHeatMap
                entriesByRegion={
                    entriesMapData?.deepExploreStats?.entriesCountByRegion ?? undefined
                }
            />
            <div ref={barContainerRef}>
                <BrushLineChart
                    width={width ?? 0}
                    height={160}
                    data={timeseriesWithoutGaps}
                    endDate={endDate}
                    startDate={startDate}
                    onEndDateChange={onEndDateChange}
                    onStartDateChange={onStartDateChange}
                />
            </div>
            <EntityCreationLineChart
                heading="Entries"
                timeseries={timeseriesData?.deepExploreStats?.entriesCountByDay ?? undefined}
                startDate={startDate}
                endDate={endDate}
            />
            <EntityCreationLineChart
                heading="Sources"
                timeseries={entriesMapData?.deepExploreStats?.leadsCountByDay ?? undefined}
                startDate={startDate}
                endDate={endDate}
            />
        </div>
    );
}

export default EntriesContent;
