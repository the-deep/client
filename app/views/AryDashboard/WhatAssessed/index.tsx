import React, { useCallback, useMemo, useRef } from 'react';
import { PurgeNull, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import {
    listToMap,
    formatDateToString,
    unique,
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
import BoxBarChart from '#components/charts/BoxBarChart';
import { organizationTitleSelector } from '#components/selections/NewOrganizationMultiSelectInput';

import GeographicalAreaAssessments from './GeographicalAreaAssessments';
import { FilterForm } from '../Filters';

import styles from './styles.css';

const countSelector = (item: { count: number }) => item.count;
const dateSelector = (item: { date: string}) => item.date;

type Statistics = NonNullable<NonNullable<AryDashboardWhatAssessedQuery['project']>['assessmentDashboardStatistics']>;
const orgIdSelector = (item: NonNullable<Statistics['assessmentByLeadOrganization']>[number]) => item.organization.id;
const focusSelector = (item: { focus: string }) => item.focus;
const affectedGroupSelector = (item: { affectedGroup: string }) => item.affectedGroup;
const sectorSelector = (item: { sector: string }) => item.sector;
const protectionSelector = (item: { protectionManagement: string }) => item.protectionManagement;

const ARY_DASHBOARD_WHAT_ASSESSED = gql`
    query AryDashboardWhatAssessed(
        $projectId: ID!,
        $filter: AssessmentDashboardFilterInputType!,
    ) {
        project(id: $projectId) {
            id
            assessmentDashboardStatistics(filter: $filter){
                assessmentGeographicAreas {
                    geoArea
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
                assessmentPerFrameworkPillar {
                    count
                    date
                    focus
                }
                assessmentPerAffectedGroup {
                    affectedGroup
                    count
                    date
                }
                assessmentPerHumanitarianSector {
                    count
                    date
                    sector
                }
                assessmentPerProtectionManagement {
                    count
                    date
                    protectionManagement
                }
                assessmentPerAffectedGroupAndGeoarea {
                    date
                    count
                    affectedGroup
                    geoArea {
                        id
                        title
                    }
                }
                assessmentPerAffectedGroupAndSector {
                    affectedGroup
                    count
                    sector
                }
                assessmentPerSectorAndGeoarea {
                    count
                    sector
                    geoArea {
                        id
                        title
                    }
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
    projectId: string;
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
    options?: ProjectMetadataForAryQuery;
}

function WhatAssessed(props: Props) {
    const {
        projectId,
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
        options,
        readOnly,
    } = props;

    const startDateString = formatDateToString(new Date(projectStartDate), 'yyyy-MM-dd');
    const barContainerRef = useRef<HTMLDivElement>(null);
    const { width } = useSizeTracking(barContainerRef) ?? {};

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
        [
            onStartDateChange,
            onEndDateChange,
        ],
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

    const leadOrganizations = useMemo(() => (
        unique(
            statisticsData?.assessmentByLeadOrganization?.map((item) => ({
                key: item.organization.id,
                label: organizationTitleSelector(item.organization),
            })) ?? [],
            (item) => item.key,
        )
    ), [statisticsData?.assessmentByLeadOrganization]);

    const sectorOptions = useMemo(() => (
        unique(
            options?.sectorOptions?.enumValues?.map((item) => ({
                key: item.name,
                label: item.description ?? item.name ?? '??',
            })) ?? [],
            (item) => item.key,
        )
    ), [options?.sectorOptions]);

    const protectionOptions = useMemo(() => (
        unique(
            options?.protectionOptions?.enumValues?.map((item) => ({
                key: item.name,
                label: item.description ?? item.name ?? '??',
            })) ?? [],
            (item) => item.key,
        )
    ), [options?.protectionOptions]);

    const focusOptions = useMemo(() => (
        unique(
            options?.focusOptions?.enumValues?.map((item) => ({
                key: item.name,
                label: item.description ?? item.name ?? '??',
            })) ?? [],
            (item) => item.key,
        )
    ), [options?.focusOptions]);

    const affectedGroupOptions = useMemo(() => (
        unique(
            options?.affectedGroupOptions?.enumValues?.map((item) => {
                const label = item.description ?? item.name ?? '??';
                /*
                if (label.indexOf('/') >= 0) {
                    label = label.match(/\/(?<last>[^/]+)$/)?.groups?.last ?? '??';
                }
                */

                return ({
                    key: item.name,
                    label,
                });
            }) ?? [],
            (item) => item.key,
        )
    ), [options?.affectedGroupOptions]);

    const affectedGroupsMap = useMemo(() => (
        listToMap(
            affectedGroupOptions,
            (item) => item.key,
            (item) => item.label,
        )
    ), [affectedGroupOptions]);

    const affectedGroupsForAreas = useMemo(() => (
        unique(
            statisticsData?.assessmentPerAffectedGroupAndGeoarea?.map((item) => ({
                key: item.affectedGroup,
                label: item.affectedGroup ? affectedGroupsMap?.[item.affectedGroup] : '??',
            })) ?? [],
            (item) => item.key,
        )
    ), [
        statisticsData,
        affectedGroupsMap,
    ]);

    const affectedGroupsForSectors = useMemo(() => (
        unique(
            statisticsData?.assessmentPerAffectedGroupAndSector?.map((item) => ({
                key: item.affectedGroup ?? '??',
                label: item.affectedGroup ? affectedGroupsMap?.[item.affectedGroup] : '??',
            })) ?? [],
            (item) => item.key,
        )
    ), [
        statisticsData,
        affectedGroupsMap,
    ]);

    const areasForSectors = useMemo(() => (
        unique(
            statisticsData?.assessmentPerSectorAndGeoarea?.map((item) => ({
                key: item.geoArea.id,
                label: item.geoArea.title,
            })) ?? [],
            (item) => item.key,
        )
    ), [
        statisticsData,
    ]);

    const areasForAffectedGroups = useMemo(() => (
        unique(
            statisticsData?.assessmentPerAffectedGroupAndGeoarea?.map((item) => ({
                key: item.geoArea.id,
                label: item.geoArea.title,
            })) ?? [],
            (item) => item.key,
        )
    ), [
        statisticsData,
    ]);

    return (
        <div className={styles.whatAssessed}>
            <div className={styles.item}>
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
            </div>
            <EntityCreationLineChart
                heading="Number of Assessment Over Time"
                timeseries={assessmentTimeseries ?? []}
                startDate={startDate}
                endDate={endDate}
            />
            <BubbleBarChart
                heading="Number of Assessments by Lead Stakeholders (Top Ten)"
                data={statisticsData?.assessmentByLeadOrganization}
                countSelector={countSelector}
                dateSelector={dateSelector}
                categorySelector={orgIdSelector}
                categories={leadOrganizations}
                startDate={startDate}
                endDate={endDate}
            />
            <BubbleBarChart
                heading="Number of Assessments Per Framework Pillar"
                data={statisticsData?.assessmentPerFrameworkPillar}
                countSelector={countSelector}
                categories={focusOptions}
                dateSelector={dateSelector}
                categorySelector={focusSelector}
                startDate={startDate}
                endDate={endDate}
            />
            <BubbleBarChart
                heading="Number of Assessments per Affected Group"
                data={statisticsData?.assessmentPerAffectedGroup}
                categories={affectedGroupOptions}
                countSelector={countSelector}
                dateSelector={dateSelector}
                categorySelector={affectedGroupSelector}
                startDate={startDate}
                endDate={endDate}
            />
            <BubbleBarChart
                heading="Number of Assessments per Humanitarian Sector"
                data={statisticsData?.assessmentPerHumanitarianSector}
                countSelector={countSelector}
                categories={sectorOptions}
                dateSelector={dateSelector}
                categorySelector={sectorSelector}
                startDate={startDate}
                endDate={endDate}
            />
            <BubbleBarChart
                heading="Number of Assessments per Protection Information Management Systems"
                data={statisticsData?.assessmentPerProtectionManagement}
                countSelector={countSelector}
                categories={protectionOptions}
                dateSelector={dateSelector}
                categorySelector={protectionSelector}
                startDate={startDate}
                endDate={endDate}
            />
            <BoxBarChart
                heading="Number of Assessments per Humanitarian Sector and Geographical Area"
                data={statisticsData?.assessmentPerSectorAndGeoarea}
                columns={sectorOptions}
                countSelector={countSelector}
                rows={areasForSectors}
                columnSelector={sectorSelector}
                // FIXME: Update after changes in server are reflected
                rowSelector={(item) => item.geoArea.id}
            />
            <BoxBarChart
                heading="Number of Assessments per Affected Groups and Geographical Area"
                data={statisticsData?.assessmentPerAffectedGroupAndGeoarea}
                columns={affectedGroupsForAreas}
                countSelector={countSelector}
                rows={areasForAffectedGroups}
                columnSelector={affectedGroupSelector}
                rowSelector={(item) => item.geoArea.id}
            />
            <BoxBarChart
                heading="Number of Assessments per Affected Groups and Sectors"
                data={statisticsData?.assessmentPerAffectedGroupAndSector}
                columns={affectedGroupsForSectors}
                countSelector={countSelector}
                rows={sectorOptions}
                columnSelector={affectedGroupSelector}
                rowSelector={sectorSelector}
            />
        </div>
    );
}
export default WhatAssessed;
