import React, { useCallback, useMemo, useRef } from 'react';
import { gql, useQuery } from '@apollo/client';
import { PurgeNull, removeNull } from '@togglecorp/toggle-form';
import {
    _cs,
    formatDateToString,
    isNotDefined,
    listToGroupList,
    unique,
} from '@togglecorp/fujs';

import {
    AryDashboardQualityAssessmentQuery,
    AryDashboardQualityAssessmentQueryVariables,
    MedianQualityScoreOverTimeQuery,
    MedianQualityScoreOverTimeQueryVariables,
    ProjectMetadataForAryQuery,
} from '#generated/types';
import useSizeTracking from '#hooks/useSizeTracking';
import BrushLineChart from '#components/BrushLineChart';
import EntityCreationLineChart from '#components/EntityCreationLineChart';
import { getTimeseriesWithoutGaps } from '#utils/temporal';
import { todaysDate } from '#utils/common';
import BubbleBarChart from '#components/charts/BubbleBarChart';
import BoxBarChart from '#components/charts/BoxBarChart';

import GeographicalAreaQualityScore from './GeographicalAreaQualityScore';
import { FilterForm } from '../Filters';
import MedianRadarChart from './MedianRadarChart';

import styles from './styles.css';

const CHART_COLORS = ['#A5D9C1', '#FF7D7D'];
type AryScoreOption = NonNullable<NonNullable<NonNullable<ProjectMetadataForAryQuery['project']>['assessmentRegistryOptions']>['scoreOptions']>[number];

const countSelector = (item: { finalScore: number }) => item.finalScore;
const dateSelector = (item: { date: string}) => item.date;
const scoreCategorySelector = (item: AryScoreOption): string => item.analyticalStatementDisplay ?? '';

const ARY_DASHBOARD_QUALITY_ASSESSMENT = gql`
    query AryDashboardQualityAssessment(
        $projectId: ID!,
        $filter: AssessmentDashboardFilterInputType!,
    ) {
        project(id: $projectId) {
            id
            assessmentDashboardStatistics(filter: $filter){
                medianQualityScoreOfEachDimension {
                    finalScore
                    scoreType
                }
                medianQualityScoreOfEachDimensionByDate {
                    date
                    finalScore
                    scoreType
                }
                medianQualityScoreByGeoareaAndSector {
                    date
                    finalScore
                    geoArea {
                        id
                        title
                        adminLevelLevel
                    }
                    sector
                }
                medianQualityScoreByGeareaAndAffectedGroup {
                    affectedGroup
                    date
                    finalScore
                    geoArea {
                        title
                        id
                        adminLevelTitle
                    }
                }
                medianScoreBySectorAndAffectedGroup {
                    affectedGroups
                    finalScore
                    sector
                }
            }
        }
    }
`;

const MEDIAN_QUALITY_SCORE_OVER_TIME = gql`
    query medianQualityScoreOverTime(
        $projectId: ID!,
        $filter: AssessmentDashboardFilterInputType!,
    ) {
        project(id: $projectId) {
            id
            assessmentDashboardStatistics(filter: $filter){
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
    options?: ProjectMetadataForAryQuery;
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
        options,
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

    const medianScoreOverTimeVariables: MedianQualityScoreOverTimeQueryVariables
    | undefined = useMemo(
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
        data: medianScoreOverTime,
    } = useQuery<MedianQualityScoreOverTimeQuery, MedianQualityScoreOverTimeQueryVariables>(
        MEDIAN_QUALITY_SCORE_OVER_TIME,
        {
            variables: medianScoreOverTimeVariables,
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

    const medianScoreTimeSeries = useMemo(
        () => medianScoreOverTime?.project?.assessmentDashboardStatistics
            ?.medianQualityScoreOverTime?.map(
                (item) => ({
                    date: item.date,
                    count: item.finalScore,
                }),
            ) ?? [],
        [medianScoreOverTime?.project?.assessmentDashboardStatistics?.medianQualityScoreOverTime],
    );

    const timeseriesWithoutGaps = useMemo(
        () => getTimeseriesWithoutGaps(
            medianScoreTimeSeries,
            'month',
            startDateString,
            todaysDate,
        ),
        [
            medianScoreTimeSeries,
            startDateString,
        ],
    );

    const scoreOptions = removeNull(options?.project?.assessmentRegistryOptions?.scoreOptions);
    const medianScoreWithAnalyticalStatement = useMemo(
        () => {
            const scoreWithCriteria = statisticsData?.medianQualityScoreOfEachDimensionByDate?.map(
                (medianScore) => {
                    const matchingOption = scoreOptions?.find(
                        (option) => option.scoreCriteria === medianScore.scoreType,
                    );
                    const removeNullFromMatchedOptions = removeNull(matchingOption);
                    return {
                        ...removeNullFromMatchedOptions,
                        scoreType: medianScore.scoreType,
                        finalScore: medianScore.finalScore,
                        date: medianScore.date,
                    };
                },
            );
            const scoreGroupByAnalyticalStatement = listToGroupList(
                scoreWithCriteria ?? [],
                (d) => d.analyticalStatement ?? '',
            );
            return scoreGroupByAnalyticalStatement;
        },
        [
            scoreOptions,
            statisticsData?.medianQualityScoreOfEachDimensionByDate,
        ],
    );

    const groupScoreOptionsByAnalytical = listToGroupList(
        scoreOptions ?? [],
        (d) => d.analyticalStatement ?? '',
    );

    const fitForPurposeOptions = useMemo(() => (
        groupScoreOptionsByAnalytical?.FIT_FOR_PURPOSE?.map((item) => ({
            key: item.scoreCriteria,
            label: item.scoreCriteriaDisplay ?? '??',
        }))
    ), [groupScoreOptionsByAnalytical.FIT_FOR_PURPOSE]);

    const trustworthinessOptions = useMemo(() => (
        groupScoreOptionsByAnalytical?.TRUSTWORTHINESS?.map((item) => ({
            key: item.scoreCriteria,
            label: item.scoreCriteriaDisplay ?? '??',
        }))
    ), [groupScoreOptionsByAnalytical.TRUSTWORTHINESS]);

    const analyticalRigorOptions = useMemo(() => (
        groupScoreOptionsByAnalytical?.ANALYTICAL_RIGOR?.map((item) => ({
            key: item.scoreCriteria,
            label: item.scoreCriteriaDisplay ?? '??',
        }))
    ), [groupScoreOptionsByAnalytical.ANALYTICAL_RIGOR]);

    const analyticalWritingOptions = useMemo(() => (
        groupScoreOptionsByAnalytical?.ANALYTICAL_WRITING?.map((item) => ({
            key: item.scoreCriteria,
            label: item.scoreCriteriaDisplay ?? '??',
        }))
    ), [groupScoreOptionsByAnalytical.ANALYTICAL_WRITING]);

    const sectorColumn = useMemo(() => (
        unique(
            options?.sectorOptions?.enumValues?.map((item) => ({
                key: item.name,
                label: item.description ?? '',
            })) ?? [],
            (item) => item.key,
        )
    ), [options?.sectorOptions]);

    const affectedGroupColumn = useMemo(() => (
        unique(
            options?.affectedGroupOptions?.enumValues?.map((item) => ({
                key: item.name,
                label: item.description ?? '',
            })) ?? [],
            (item) => item.key,
        )
    ), [options?.affectedGroupOptions]);

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
                timeseries={medianScoreTimeSeries}
                startDate={startDate}
                endDate={endDate}
            />
            <MedianRadarChart
                heading="Fit for Purpose"
                data={medianScoreWithAnalyticalStatement.FIT_FOR_PURPOSE}
            />
            <BubbleBarChart
                data={medianScoreWithAnalyticalStatement.FIT_FOR_PURPOSE}
                countSelector={countSelector}
                categories={fitForPurposeOptions}
                categorySelector={scoreCategorySelector}
                dateSelector={dateSelector}
                startDate={startDate}
                endDate={endDate}
                colors={CHART_COLORS}
            />
            <BubbleBarChart
                data={medianScoreWithAnalyticalStatement.TRUSTWORTHINESS}
                countSelector={countSelector}
                categories={trustworthinessOptions}
                categorySelector={scoreCategorySelector}
                dateSelector={dateSelector}
                startDate={startDate}
                endDate={endDate}
                colors={CHART_COLORS}
            />
            <BubbleBarChart
                data={medianScoreWithAnalyticalStatement.ANALYTICAL_RIGOR}
                countSelector={countSelector}
                categories={analyticalRigorOptions}
                categorySelector={scoreCategorySelector}
                dateSelector={dateSelector}
                startDate={startDate}
                endDate={endDate}
                colors={CHART_COLORS}
            />
            <BubbleBarChart
                data={medianScoreWithAnalyticalStatement.ANALYTICAL_WRITING}
                countSelector={countSelector}
                categories={analyticalWritingOptions}
                categorySelector={scoreCategorySelector}
                dateSelector={dateSelector}
                startDate={startDate}
                endDate={endDate}
                colors={CHART_COLORS}
            />
            <BoxBarChart
                heading="Median Quality Score by Geographical Area and Sector"
                data={statisticsData?.medianQualityScoreByGeoareaAndSector ?? []}
                columns={sectorColumn}
                rowSelector={(item) => item.geoArea.title}
                columnSelector={(item) => item.sector}
                countSelector={(item) => item.finalScore}
                colors={CHART_COLORS}
            />
            <BoxBarChart
                heading="Median Quality Score by Geographical Area and Affected Group"
                data={statisticsData?.medianQualityScoreByGeareaAndAffectedGroup ?? []}
                columns={affectedGroupColumn}
                // FIXME need to fix type on server
                rowSelector={(item) => item.geoArea?.title ?? ''}
                columnSelector={(item) => item.affectedGroup ?? ''}
                countSelector={(item) => item.finalScore}
                colors={CHART_COLORS}
            />
            <BoxBarChart
                heading="Median Quality Score by Sector and Affected Group"
                data={statisticsData?.medianScoreBySectorAndAffectedGroup ?? []}
                columns={affectedGroupColumn}
                rowSelector={(item) => item.sector}
                columnSelector={(item) => item.affectedGroups}
                countSelector={(item) => item.finalScore}
                colors={CHART_COLORS}
            />
        </div>
    );
}
export default QualityAssessment;
