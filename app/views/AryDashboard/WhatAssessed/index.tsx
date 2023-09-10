import React, { useCallback, useMemo, useRef } from 'react';
import { PurgeNull, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import {
    formatDateToString,
    listToMap,
} from '@togglecorp/fujs';

import { getTimeseriesWithoutGaps } from '#utils/temporal';
import useSizeTracking from '#hooks/useSizeTracking';
import { todaysDate } from '#utils/common';
import BrushLineChart from '#components/BrushLineChart';
import EntityCreationLineChart from '#components/EntityCreationLineChart';
import {
    ProjectMetadataForAryQuery,
    AryDashboardWhatAssessedQuery,
    AryDashboardWhatAssessedQueryVariables,
    AssessmentOverTimeQuery,
    AssessmentOverTimeQueryVariables,
} from '#generated/types';

import BubbleBarChart from '#components/charts/BubbleBarChart';
import { organizationTitleSelector } from '#components/selections/NewOrganizationMultiSelectInput';

import GeographicalAreaAssessments from './GeographicalAreaAssessments';
import { FilterForm } from '../Filters';
import styles from './styles.css';

const ARY_DASHBOARD_WHAT_ASSESSED = gql`
    query AryDashboardWhatAssessed(
        $projectId: ID!,
        $filter: AssessmentDashboardFilterInputType!,
    ) {
        project(id: $projectId) {
            id
            assessmentDashboardStatistics(filter: $filter){
                assessmentGeographicAreas {
                    geoId
                    count
                    code
                    adminLevelId
                    assessmentIds
                    region
                }
                assessmentByLeadOrganization {
                    organization {
                        id
                        mergedAs {
                            id
                            title
                        }
                        title
                    }
                    count
                    date
                }
                assessmentByOverTime {
                    count
                    date
                }
            }
        }
    }
`;

const ASSESSMENT_OVER_TIME = gql`
    query AssessmentOverTime(
        $projectId: ID!,
        $filter: AssessmentDashboardFilterInputType!,
    ) {
        project(id: $projectId) {
            id
            assessmentDashboardStatistics(filter: $filter){
                assessmentByOverTime {
                    count
                    date
                }
            }
        }
    }
`;

interface Props {
    filters?: FilterForm;
    regions: NonNullable<PurgeNull<ProjectMetadataForAryQuery['project']>>['regions'];
    startDate: number;
    endDate: number;
    projectStartDate: number;
    onStartDateChange: ((newDate: number | undefined) => void) | undefined;
    onEndDateChange: ((newDate: number | undefined) => void) | undefined;
    selectedRegion?: string;
    onRegionChange: (newVal: string | undefined) => void;
    selectedAdminLevel?: string;
    onAdminLevelChange: (newVal: string | undefined) => void;
    readOnly?: boolean;
    projectId: string;
}

function WhatAssessed(props: Props) {
    const {
        regions,
        filters,
        startDate,
        endDate,
        onStartDateChange,
        onEndDateChange,
        selectedRegion,
        selectedAdminLevel,
        projectStartDate,
        onAdminLevelChange,
        onRegionChange,
        projectId,
        readOnly,
    } = props;

    const startDateString = formatDateToString(new Date(projectStartDate), 'yyyy-MM-dd');
    const barContainerRef = useRef<HTMLDivElement>(null);
    const {
        width,
    } = useSizeTracking(barContainerRef) ?? {};

    const variables: AryDashboardWhatAssessedQueryVariables = useMemo(() => ({
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
        previousData,
        loading,
        data = previousData,
    } = useQuery<AryDashboardWhatAssessedQuery, AryDashboardWhatAssessedQueryVariables>(
        ARY_DASHBOARD_WHAT_ASSESSED,
        {
            variables,
        },
    );

    const assessmentOverTimeVariables: AssessmentOverTimeQueryVariables | undefined = useMemo(
        () => ({
            projectId,
            filter: {
                ...filters,
                dateFrom: startDateString,
                dateTo: todaysDate,
            },
        }),
        [
            filters,
            projectId,
            startDateString,
        ],
    );

    const {
        data: assessmentOverTime,
    } = useQuery<AssessmentOverTimeQuery, AssessmentOverTimeQueryVariables>(
        ASSESSMENT_OVER_TIME,
        {
            variables: assessmentOverTimeVariables,
        },
    );

    const assessmentTimeseries = assessmentOverTime
        ?.project?.assessmentDashboardStatistics?.assessmentByOverTime;

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
            assessmentTimeseries ?? [],
            'month',
            startDateString,
            todaysDate,
        ),
        [
            assessmentTimeseries,
            startDateString,
        ],
    );

    const organizationLabelSelector = useCallback((orgId: string) => {
        const orgMap = listToMap(
            statisticsData?.assessmentByLeadOrganization,
            (item) => item.organization.id,
            (item) => item.organization,
        );
        const selectedOrg = orgMap?.[orgId];
        if (!selectedOrg) {
            return orgId;
        }
        return organizationTitleSelector(selectedOrg);
    }, [statisticsData?.assessmentByLeadOrganization]);

    return (
        <div className={styles.whatAssessed}>
            <GeographicalAreaAssessments
                data={statisticsData}
                regions={regions}
                selectedRegion={selectedRegion}
                onRegionChange={onRegionChange}
                navigationDisabled={readOnly || loading}
                selectedAdminLevel={selectedAdminLevel}
                onAdminLevelChange={onAdminLevelChange}
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
            <BubbleBarChart
                data={statisticsData?.assessmentByLeadOrganization}
                countSelector={(item) => item.count}
                dateSelector={(item) => item.date}
                categorySelector={(item) => item.organization?.id}
                categoryLabelSelector={organizationLabelSelector}
                startDate={startDate}
                endDate={endDate}
            />
        </div>
    );
}
export default WhatAssessed;
