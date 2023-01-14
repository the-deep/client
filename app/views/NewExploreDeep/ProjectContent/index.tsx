import React, { useRef, useState, useMemo } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';
import {
    IoMapOutline,
    IoList,
} from 'react-icons/io5';
import { useQuery, gql } from '@apollo/client';

import {
    DEEP_START_DATE,
    convertDateToIsoDateTime,
    todaysDate,
} from '#utils/common';
import {
    ProjectCountTimeseriesQuery,
    ProjectCountTimeseriesQueryVariables,
} from '#generated/types';
import { getTimeseriesWithoutGaps } from '#utils/temporal';
import useSizeTracking from '#hooks/useSizeTracking';

import EntityCreationLineChart from '../EntityCreationLineChart';
import TableView from './TableView';
import { FormType as ProjectFilterType } from '../ProjectFilters';
import MapView, { Projects as ProjectsByRegion } from './MapView';
import BrushLineChart from '../BrushLineChart';

import styles from './styles.css';

const PROJECT_COUNT_TIMESERIES = gql`
    query ProjectCountTimeseries(
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
            projectsCountByDay {
                date
                count
            }
        }
    }
`;

interface Props {
    className?: string;
    projectsByRegion: ProjectsByRegion[] | undefined;
    readOnlyMode: boolean;
    projectFilters: ProjectFilterType | undefined;
    endDate: number;
    startDate: number;
    onEndDateChange: (newDate: number | undefined) => void;
    onStartDateChange: (newDate: number | undefined) => void;
}

function ProjectContent(props: Props) {
    const {
        className,
        projectsByRegion,
        readOnlyMode,
        projectFilters,
        endDate,
        startDate,
        onEndDateChange,
        onStartDateChange,
    } = props;

    const variables: ProjectCountTimeseriesQueryVariables = useMemo(() => ({
        dateFrom: convertDateToIsoDateTime(DEEP_START_DATE),
        dateTo: convertDateToIsoDateTime(todaysDate, { endOfDay: true }),
        search: projectFilters?.search,
        isTest: projectFilters?.excludeTestProject ? false : undefined,
        organizations: projectFilters?.organizations,
        regions: projectFilters?.regions,
        includeEntryLessThan: !projectFilters?.excludeProjectsLessThan,
    }), [projectFilters]);

    const { data } = useQuery<ProjectCountTimeseriesQuery, ProjectCountTimeseriesQueryVariables>(
        PROJECT_COUNT_TIMESERIES,
        {
            variables,
        },
    );
    const [activeView, setActiveView] = useState<'map' | 'table' | undefined>('map');

    const barContainerRef = useRef<HTMLDivElement>(null);
    const {
        width,
    } = useSizeTracking(barContainerRef) ?? {};

    const timeseriesWithoutGaps = useMemo(
        () => getTimeseriesWithoutGaps(
            data?.deepExploreStats?.projectsCountByDay ?? undefined,
            'month',
            DEEP_START_DATE,
            todaysDate,
        ),
        [data?.deepExploreStats?.projectsCountByDay],
    );

    return (
        <div className={_cs(className, styles.projectContent)}>
            <div>
                <Tabs
                    // NOTE: Only showing map in readonly mode
                    value={readOnlyMode ? 'map' : activeView}
                    onChange={setActiveView}
                >
                    {!readOnlyMode && (
                        <TabList className={styles.tabs}>
                            <Tab
                                name="table"
                                className={styles.tab}
                                transparentBorder
                            >
                                <IoList />
                            </Tab>
                            <Tab
                                name="map"
                                className={styles.tab}
                                transparentBorder
                            >
                                <IoMapOutline />
                            </Tab>
                        </TabList>
                    )}
                    <TabPanel name="table">
                        <TableView
                            filters={projectFilters}
                        />
                    </TabPanel>
                    <TabPanel name="map">
                        <MapView
                            className={styles.map}
                            projects={projectsByRegion}
                        />
                    </TabPanel>
                </Tabs>
                <div ref={barContainerRef}>
                    {timeseriesWithoutGaps.length > 0 && (
                        <BrushLineChart
                            width={width ?? 0}
                            height={160}
                            data={timeseriesWithoutGaps}
                            endDate={endDate}
                            startDate={startDate}
                            onEndDateChange={onEndDateChange}
                            onStartDateChange={onStartDateChange}
                        />
                    )}
                </div>
            </div>
            <EntityCreationLineChart
                className={styles.lineChart}
                heading="Newly Created Projects"
                timeseries={data?.deepExploreStats?.projectsCountByDay ?? undefined}
                startDate={startDate}
                endDate={endDate}
            />
        </div>
    );
}

export default ProjectContent;
