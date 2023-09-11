import React, { useCallback, useMemo, useRef } from 'react';
import { gql, useQuery } from '@apollo/client';
import { PurgeNull, removeNull } from '@togglecorp/toggle-form';
import { _cs, formatDateToString, isNotDefined } from '@togglecorp/fujs';

import {
    AryDashboardQualityAssessmentQuery,
    AryDashboardQualityAssessmentQueryVariables,
    ProjectMetadataForAryQuery,
} from '#generated/types';
import useSizeTracking from '#hooks/useSizeTracking';
import BrushLineChart from '#components/BrushLineChart';
import EntityCreationLineChart from '#components/EntityCreationLineChart';
import { getTimeseriesWithoutGaps } from '#utils/temporal';
import { todaysDate } from '#utils/common';

import GeographicalAreaQualityScore from './GeographicalAreaQualityScore';
import { FilterForm } from '../Filters';

import styles from './styles.css';

const ARY_DASHBOARD_QUALITY_ASSESSMENT = gql`
    query AryDashboardQualityAssessment(
        $projectId: ID!,
        $filter: AssessmentDashboardFilterInputType!,
    ) {
        project(id: $projectId) {
            id
            assessmentDashboardStatistics(filter: $filter){
                medianQualityScoreByGeoArea {
                    adminLevelId
                    finalScore
                    geoArea
                    region
                }
                medianQualityScoreOverTime {
                    date
                    finalScore
                }
            }
        }
    }
`;
interface Props {
    className?: string;
    projectId: string;
    filters?: FilterForm;
    regions: NonNullable<PurgeNull<ProjectMetadataForAryQuery['project']>>['regions'];
    selectedRegion?: string;
    onRegionChange: (newVal: string | undefined) => void;
    selectedAdminLevel?: string;
    onAdminLevelChange: (newVal: string | undefined) => void;
    onStartDateChange: ((newDate: number | undefined) => void) | undefined;
    onEndDateChange: ((newDate: number | undefined) => void) | undefined;
    startDate: number;
    endDate: number;
    projectStartDate: number;
}

function QualityAssessment(props: Props) {
    const {
        className,
        projectId,
        filters,
        regions,
        selectedRegion,
        onRegionChange,
        selectedAdminLevel,
        onAdminLevelChange,
        onStartDateChange,
        onEndDateChange,
        startDate,
        endDate,
        projectStartDate,
    } = props;

    const startDateString = formatDateToString(new Date(projectStartDate), 'yyyy-MM-dd');
    const barContainerRef = useRef<HTMLDivElement>(null);
    const { width } = useSizeTracking(barContainerRef) ?? {};

    const variables: AryDashboardQualityAssessmentQueryVariables = useMemo(() => ({
        projectId,
        filter: {
            ...filters,
            dateFrom: formatDateToString(new Date(startDate), 'yyyy-MM-dd'),
            dateTo: formatDateToString(new Date(endDate), 'yyyy-MM-dd'),
        },
    }), [
        projectId,
        startDate,
        endDate,
        filters,
    ]);

    const {
        loading,
        data,
    } = useQuery<AryDashboardQualityAssessmentQuery, AryDashboardQualityAssessmentQueryVariables>(
        ARY_DASHBOARD_QUALITY_ASSESSMENT, {
            skip: isNotDefined(variables),
            variables,
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

    const overTimeData = useMemo(
        () => statisticsData?.medianQualityScoreOverTime?.map((item) => ({
            date: item.date,
            count: item.finalScore,
        })) ?? [],
        [statisticsData?.medianQualityScoreOverTime],
    );
    const timeseriesWithoutGaps = useMemo(
        () => getTimeseriesWithoutGaps(
            overTimeData,
            'month',
            startDateString,
            todaysDate,
        ),
        [
            overTimeData,
            startDateString,
        ],
    );
    return (
        <div className={_cs(className, styles.qualityAssessment)}>
            <div className={styles.item}>
                <GeographicalAreaQualityScore
                    data={statisticsData}
                    regions={regions}
                    selectedRegion={selectedRegion}
                    onRegionChange={onRegionChange}
                    selectedAdminLevel={selectedAdminLevel}
                    onAdminLevelChange={onAdminLevelChange}
                    navigationDisabled={loading}
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
            </div>
            <EntityCreationLineChart
                heading="Number of Assessment Over Time"
                timeseries={overTimeData}
                startDate={startDate}
                endDate={endDate}
            />
        </div>
    );
}
export default QualityAssessment;
