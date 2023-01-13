import React, { useState, useMemo } from 'react';
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

import BrushLineChart from '../BrushLineChart';
import {
    DEEP_START_DATE,
    todaysDate,
} from '#utils/common';
import {
    ProjectCountTimeseriesQuery,
    ProjectCountTimeseriesQueryVariables,
} from '#generated/types';
import {
    getTimeseriesWithoutGaps,
} from '#utils/temporal';

import EntityCreationLineChart from '../EntityCreationLineChart';
import TableView from './TableView';
import { FormType as ProjectFilterType } from '../ProjectFilters';
import MapView, { Projects as ProjectsByRegion } from './MapView';

import styles from './styles.css';

const PROJECT_COUNT_TIMESERIES = gql`
    query ProjectCountTimeseries(
        $dateFrom: Date!,
        $dateTo: Date!,
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
type Timeseries = {
    date: string;
    count: number;
}

interface Props {
    className?: string;
    timeseries: Timeseries[] | undefined;
    projectsByRegion: ProjectsByRegion[] | undefined;
    readOnlyMode: boolean;
    projectFilters: ProjectFilterType | undefined;
}

function ProjectContent(props: Props) {
    const {
        className,
        timeseries,
        projectsByRegion,
        readOnlyMode,
        projectFilters,
    } = props;

    const variables: ProjectCountTimeseriesQueryVariables = useMemo(() => ({
        dateFrom: DEEP_START_DATE,
        dateTo: todaysDate,
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

    const timeseriesWithoutGaps = useMemo(
        () => getTimeseriesWithoutGaps(data?.deepExploreStats?.projectsCountByDay ?? undefined, 'day'),
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
                            filters={undefined}
                        />
                    </TabPanel>
                    <TabPanel name="map">
                        <MapView
                            projects={projectsByRegion}
                        />
                    </TabPanel>
                </Tabs>
                <BrushLineChart
                    width={1200}
                    height={160}
                    data={timeseriesWithoutGaps}
                />
            </div>
            <EntityCreationLineChart
                heading="Newly Created Projects"
                timeseries={timeseries}
            />
        </div>
    );
}

export default ProjectContent;
