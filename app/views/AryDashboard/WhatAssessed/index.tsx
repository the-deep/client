import React, { useCallback, useMemo, useRef } from 'react';
import { _cs } from '@togglecorp/fujs';

import { getTimeseriesWithoutGaps } from '#utils/temporal';
import useSizeTracking from '#hooks/useSizeTracking';
import { AryDashboardFilterQuery } from '#generated/types';
import { DEEP_START_DATE, todaysDate } from '#utils/common';
import BrushLineChart from '#views/ExploreDeepContent/BrushLineChart';
import EntityCreationLineChart from '#views/ExploreDeepContent/EntityCreationLineChart';

import GeographicalAreaAssessments from './GeographicalAreaAssessments';

interface Props {
    className?: string;
    data?: AryDashboardFilterQuery;
    startDate: number;
    endDate: number;
    onStartDateChange: ((newDate: number | undefined) => void) | undefined;
    onEndDateChange: ((newDate: number | undefined) => void) | undefined;
    readOnly?: boolean;
}

function WhatAssessed(props: Props) {
    const {
        className,
        data,
        startDate,
        endDate,
        onStartDateChange,
        onEndDateChange,
        readOnly,
    } = props;
    const barContainerRef = useRef<HTMLDivElement>(null);
    const {
        width,
    } = useSizeTracking(barContainerRef) ?? {};

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

    const timeseriesWithoutGaps = useMemo(
        () => getTimeseriesWithoutGaps(
            data?.project?.assessmentDashboardStatistics?.assessmentByOverTime ?? undefined,
            'month',
            DEEP_START_DATE,
            todaysDate,
        ),
        [data?.project?.assessmentDashboardStatistics?.assessmentByOverTime],
    );

    return (
        <>
            <GeographicalAreaAssessments
                data={data}
                navigationDisabled={readOnly}
            />

            <div ref={barContainerRef}>
                <BrushLineChart
                    width={width ?? 0}
                    height={160}
                    data={timeseriesWithoutGaps}
                    endDate={endDate}
                    startDate={startDate}
                    onChange={handleDateRangeChange}
                />
            </div>
            <EntityCreationLineChart
                className={_cs(className)}
                heading="Number of Assessment Over Time"
                // eslint-disable-next-line max-len
                timeseries={data?.project?.assessmentDashboardStatistics?.assessmentByOverTime ?? undefined}
                startDate={startDate}
                endDate={endDate}
            />
        </>
    );
}
export default WhatAssessed;
