import React, { useCallback, useMemo, useRef } from 'react';
import { PurgeNull, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import { formatDateToString, isNotDefined } from '@togglecorp/fujs';

import { getTimeseriesWithoutGaps } from '#utils/temporal';
import useSizeTracking from '#hooks/useSizeTracking';
import { todaysDate } from '#utils/common';
import BrushLineChart from '#components/BrushLineChart';
import EntityCreationLineChart from '#components/EntityCreationLineChart';
import {
    AryDashboardFilterQuery,
    AryDashboardFilterQueryVariables,
    AryDashboardWhatAssessedQuery,
    AryDashboardWhatAssessedQueryVariables,
} from '#generated/types';

import GeographicalAreaAssessments from './GeographicalAreaAssessments';

const ARY_DASHBOARD_WHAT_ASSESSED = gql`
        query AryDashboardWhatAssessed(
        $projectId: ID!,
        $filter: AssessmentDashboardFilterInputType!,
    ) {
        project(id: $projectId) {
            id
            assessmentDashboardStatistics(filter: $filter){
                totalAssessment
                totalCollectionTechnique
                totalMultisectorAssessment
                totalSinglesectorAssessment
                totalStakeholder
                stakeholderCount {
                    count
                    stakeholder
                }
                collectionTechniqueCount {
                    count
                    dataCollectionTechnique
                    dataCollectionTechniqueDisplay
                }
                assessmentCount {
                    coordinatedJoint
                    coordinatedJointDisplay
                    count
                }
                assessmentGeographicAreas {
                    geoId
                    count
                    code
                    adminLevelId
                    assessmentIds
                    region,
                }
                assessmentByOverTime {
                    count
                    date
                }
            }
        }
    }
`;

interface Props {
    filters?: AryDashboardFilterQueryVariables;
    regions: NonNullable<PurgeNull<AryDashboardFilterQuery['project']>>['regions'];
    startDate: number;
    endDate: number;
    onStartDateChange: ((newDate: number | undefined) => void) | undefined;
    onEndDateChange: ((newDate: number | undefined) => void) | undefined;
    readOnly?: boolean;
}

function WhatAssessed(props: Props) {
    const {
        regions,
        filters,
        startDate,
        endDate,
        onStartDateChange,
        onEndDateChange,
        readOnly,
    } = props;

    const startDateString = formatDateToString(new Date(startDate), 'yyyy-MM-dd');
    const barContainerRef = useRef<HTMLDivElement>(null);
    const {
        width,
    } = useSizeTracking(barContainerRef) ?? {};

    const {
        loading,
        data,
    } = useQuery<AryDashboardWhatAssessedQuery, AryDashboardWhatAssessedQueryVariables>(
        ARY_DASHBOARD_WHAT_ASSESSED,
        {
            skip: isNotDefined(filters),
            variables: filters,
        },
    );

    const statisticsData = removeNull(data?.project?.assessmentDashboardStatistics);

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
            statisticsData?.assessmentByOverTime,
            'month',
            startDateString,
            todaysDate,
        ),
        [
            statisticsData?.assessmentByOverTime,
            startDateString,
        ],
    );

    return (
        <>
            <GeographicalAreaAssessments
                data={statisticsData}
                regions={regions}
                navigationDisabled={readOnly || loading}
            />

            <div ref={barContainerRef}>
                <BrushLineChart
                    width={width ?? 0}
                    height={160}
                    data={timeseriesWithoutGaps}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateRangeChange}
                />
            </div>
            <EntityCreationLineChart
                heading="Number of Assessment Over Time"
                timeseries={statisticsData?.assessmentByOverTime}
                startDate={startDate}
                endDate={endDate}
            />
        </>
    );
}
export default WhatAssessed;
