import React, { useCallback, useMemo, useRef } from 'react';
import { PurgeNull } from '@togglecorp/toggle-form';

import { getTimeseriesWithoutGaps } from '#utils/temporal';
import useSizeTracking from '#hooks/useSizeTracking';
import { AryDashboardFilterQuery } from '#generated/types';
import { DEEP_START_DATE, todaysDate } from '#utils/common';
import BrushLineChart from '#views/ExploreDeepContent/BrushLineChart';
import EntityCreationLineChart from '#views/ExploreDeepContent/EntityCreationLineChart';

import GeographicalAreaAssessments from './GeographicalAreaAssessments';

interface Props {
    data: NonNullable<PurgeNull<AryDashboardFilterQuery['project']>>;
    startDate: number;
    endDate: number;
    onStartDateChange: ((newDate: number | undefined) => void) | undefined;
    onEndDateChange: ((newDate: number | undefined) => void) | undefined;
    readOnly?: boolean;
}

function WhatAssessed(props: Props) {
    const {
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
            data?.assessmentDashboardStatistics?.assessmentByOverTime,
            'month',
            DEEP_START_DATE,
            todaysDate,
        ),
        [data?.assessmentDashboardStatistics?.assessmentByOverTime],
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
                heading="Number of Assessment Over Time"
                timeseries={data?.assessmentDashboardStatistics?.assessmentByOverTime ?? undefined}
                startDate={startDate}
                endDate={endDate}
            />
        </>
    );
}
export default WhatAssessed;
