import React, { useRef, useState, useMemo, useCallback } from 'react';
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

import {
    DEEP_START_DATE,
    todaysDate,
} from '#utils/common';
import { getTimeseriesWithoutGaps } from '#utils/temporal';
import useSizeTracking from '#hooks/useSizeTracking';
import BrushLineChart from '#components/BrushLineChart';
import EntityCreationLineChart from '#components/EntityCreationLineChart';

import TableView from './TableView';
import PublicTableView from './PublicTableView';
import { FormType as ProjectFilterType } from '../ProjectFilters';
import MapView, { Projects as ProjectsByRegion } from './MapView';
import PublicMapView from './PublicMapView';

import styles from './styles.css';

interface Props {
    className?: string;
    projectsByRegion: ProjectsByRegion[] | undefined;
    readOnly: boolean;
    projectFilters: ProjectFilterType | undefined;
    endDate: number;
    startDate: number;
    onEndDateChange: ((newDate: number | undefined) => void) | undefined;
    onStartDateChange: ((newDate: number | undefined) => void) | undefined;
    completeTimeseries: { date: string; count: number }[] | undefined;
    isPublic: boolean;
}

function ProjectContent(props: Props) {
    const {
        className,
        projectsByRegion,
        readOnly,
        projectFilters,
        endDate,
        startDate,
        onEndDateChange,
        onStartDateChange,
        completeTimeseries,
        isPublic,
    } = props;

    const [activeView, setActiveView] = useState<'map' | 'table' | undefined>('map');

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
        <div className={_cs(className, styles.projectContent)}>
            <div>
                <Tabs
                    // NOTE: Only showing map in readonly mode
                    value={readOnly ? 'map' : activeView}
                    onChange={setActiveView}
                >
                    {!readOnly && (
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
                        {isPublic ? (
                            <PublicTableView
                                filters={projectFilters}
                            />
                        ) : (
                            <TableView
                                filters={projectFilters}
                            />
                        )}
                    </TabPanel>
                    <TabPanel name="map">
                        {isPublic ? (
                            <PublicMapView
                                className={styles.map}
                                projects={projectsByRegion}
                            />
                        ) : (
                            <MapView
                                className={styles.map}
                                projects={projectsByRegion}
                            />
                        )}
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
                            onChange={handleDateRangeChange}
                            readOnly={readOnly}
                        />
                    )}
                </div>
            </div>
            <EntityCreationLineChart
                className={styles.lineChart}
                heading="Newly Created Projects"
                timeseries={completeTimeseries}
                startDate={startDate}
                endDate={endDate}
            />
        </div>
    );
}

export default ProjectContent;
