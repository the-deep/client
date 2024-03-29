import React, { useMemo } from 'react';
import {
    _cs,
    isNotDefined,
    formatDateToString,
    unique,
} from '@togglecorp/fujs';
import { PurgeNull, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';

import {
    ProjectMetadataForAryQuery,
    AryDashboardHowAssessedQuery,
    AryDashboardHowAssessedQueryVariables,
} from '#generated/types';
import BubbleBarChart from '#components/charts/BubbleBarChart';

import GeographicalAreaMethodology from './GeographicalAreaMethodology';
import { FilterForm } from '../Filters';

import styles from './styles.css';

const countSelector = (item: { count: number }) => item.count;
const dateSelector = (item: { date: string}) => item.date;
const samplingSizeSelector = (item: { samplingSize: number }) => item.samplingSize;

type Statistics = NonNullable<NonNullable<AryDashboardHowAssessedQuery['project']>['assessmentDashboardStatistics']>;
const dataTechniqueSelector = (item: NonNullable<Statistics['assessmentPerDatatechnique']>[number]) => item.dataCollectionTechnique ?? '??';
const analysisSelector = (item: NonNullable<Statistics['assessmentPerUnitOfAnalysis']>[number]) => item.unitOfAnalysis ?? '??';
const reportingSelector = (item: NonNullable<Statistics['assessmentPerUnitOfReporting']>[number]) => item.unitOfReporting ?? '??';
const samplingApproachSelector = (item: NonNullable<Statistics['assessmentPerSamplingApproach']>[number]) => item.samplingApproach ?? '??';
const proximitySelector = (item: NonNullable<Statistics['assessmentPerProximity']>[number]) => item.proximity ?? '??';
const samplingDataTechniqueSelector = (item: NonNullable<Statistics['sampleSizePerDataCollectionTechnique']>[number]) => item.dataCollectionTechnique ?? '??';

const ARY_DASHBOARD_HOW_ASSESSED = gql`
    query AryDashboardHowAssessed(
        $projectId: ID!,
        $filter: AssessmentDashboardFilterInputType!,
    ) {
        project(id: $projectId) {
            id
            assessmentDashboardStatistics(filter: $filter){
                assessmentByDataCollectionTechniqueAndGeolocation {
                    adminLevelId
                    count
                    geoArea
                    region
                    dataCollectionTechnique
                }
                assessmentBySamplingApproachAndGeolocation {
                    adminLevelId
                    count
                    geoArea
                    region
                    samplingApproach
                }
                assessmentByUnitOfAnalysisAndGeolocation {
                    adminLevelId
                    count
                    geoArea
                    region
                    unitOfAnalysis
                }
                assessmentByUnitOfReportingAndGeolocation {
                    adminLevelId
                    count
                    geoArea
                    region
                    unitOfReporting
                }
                assessmentByProximityAndGeolocation {
                    adminLevelId
                    count
                    geoArea
                    region
                    proximity
                }
                assessmentPerDatatechnique {
                    count
                    dataCollectionTechnique
                    date
                }
                assessmentPerUnitOfAnalysis {
                    count
                    date
                    unitOfAnalysis
                }
                assessmentPerUnitOfReporting {
                    count
                    date
                    unitOfReporting
                }
                assessmentPerSamplingApproach {
                    count
                    date
                    samplingApproach
                }
                assessmentPerProximity {
                    count
                    date
                    proximity
                }
                sampleSizePerDataCollectionTechnique {
                    dataCollectionTechnique
                    date
                    samplingSize
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
    startDate: number;
    endDate: number;
    options?: ProjectMetadataForAryQuery;
}

function HowAssessed(props: Props) {
    const {
        className,
        projectId,
        filters,
        startDate,
        endDate,
        regions,
        selectedRegion,
        onRegionChange,
        selectedAdminLevel,
        onAdminLevelChange,
        options,
    } = props;

    const variables: AryDashboardHowAssessedQueryVariables = useMemo(() => ({
        projectId,
        filter: {
            assessment: filters,
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
        previousData,
        data = previousData,
    } = useQuery<AryDashboardHowAssessedQuery, AryDashboardHowAssessedQueryVariables>(
        ARY_DASHBOARD_HOW_ASSESSED,
        {
            skip: isNotDefined(variables),
            variables,
        },
    );
    const statisticsData = removeNull(data?.project?.assessmentDashboardStatistics);

    const dataTechniqueOptions = useMemo(() => (
        unique(
            options?.dataCollectionTechniqueOptions?.enumValues?.map((item) => ({
                key: item.name,
                label: item.description ?? item.name ?? '??',
            })) ?? [],
            (item) => item.key,
        )
    ), [options?.dataCollectionTechniqueOptions]);

    const analysisOptions = useMemo(() => (
        unique(
            options?.unitOfAnanlysis?.enumValues?.map((item) => ({
                key: item.name,
                label: item.description ?? item.name ?? '??',
            })) ?? [],
            (item) => item.key,
        )
    ), [options?.unitOfAnanlysis]);

    const reportingOptions = useMemo(() => (
        unique(
            options?.unitOfReporting?.enumValues?.map((item) => ({
                key: item.name,
                label: item.description ?? item.name ?? '??',
            })) ?? [],
            (item) => item.key,
        )
    ), [options?.unitOfReporting]);

    const samplingApproachOptions = useMemo(() => (
        unique(
            options?.samplingApproach?.enumValues?.map((item) => ({
                key: item.name,
                label: item.description ?? item.name ?? '??',
            })) ?? [],
            (item) => item.key,
        )
    ), [options?.samplingApproach]);

    const proximityOptions = useMemo(() => (
        unique(
            options?.proximity?.enumValues?.map((item) => ({
                key: item.name,
                label: item.description ?? item.name ?? '??',
            })) ?? [],
            (item) => item.key,
        )
    ), [options?.proximity]);

    const sampleDataTechniqueOptions = useMemo(() => (
        unique(
            options?.dataCollectionTechniqueOptions?.enumValues?.map((item) => ({
                key: item.name,
                label: item.description ?? item.name ?? '??',
            })) ?? [],
            (item) => item.key,
        )
    ), [options?.dataCollectionTechniqueOptions]);

    return (
        <div className={_cs(className, styles.howAssessed)}>
            <div className={styles.item}>
                <GeographicalAreaMethodology
                    data={statisticsData}
                    options={options}
                    regions={regions}
                    selectedRegion={selectedRegion}
                    onRegionChange={onRegionChange}
                    selectedAdminLevel={selectedAdminLevel}
                    onAdminLevelChange={onAdminLevelChange}
                    navigationDisabled={loading}
                />
            </div>
            <BubbleBarChart
                heading="Number of Assessments Per Data Collection Technique"
                data={statisticsData?.assessmentPerDatatechnique}
                countSelector={countSelector}
                categories={dataTechniqueOptions}
                dateSelector={dateSelector}
                categorySelector={dataTechniqueSelector}
                startDate={startDate}
                endDate={endDate}
                loading={loading}
            />
            <BubbleBarChart
                heading="Number of Assessments Per Unit of Analysis"
                data={statisticsData?.assessmentPerUnitOfAnalysis}
                countSelector={countSelector}
                categories={analysisOptions}
                dateSelector={dateSelector}
                categorySelector={analysisSelector}
                startDate={startDate}
                endDate={endDate}
                loading={loading}
            />
            <BubbleBarChart
                heading="Number of Assessments Per Unit of Reporting"
                data={statisticsData?.assessmentPerUnitOfReporting}
                countSelector={countSelector}
                categories={reportingOptions}
                dateSelector={dateSelector}
                categorySelector={reportingSelector}
                startDate={startDate}
                endDate={endDate}
                loading={loading}
            />
            <BubbleBarChart
                heading="Number of Assessments Per Sampling Approach"
                data={statisticsData?.assessmentPerSamplingApproach}
                countSelector={countSelector}
                categories={samplingApproachOptions}
                dateSelector={dateSelector}
                categorySelector={samplingApproachSelector}
                startDate={startDate}
                endDate={endDate}
                loading={loading}
            />
            <BubbleBarChart
                heading="Number of Assessments Per Proximity"
                data={statisticsData?.assessmentPerProximity}
                countSelector={countSelector}
                categories={proximityOptions}
                dateSelector={dateSelector}
                categorySelector={proximitySelector}
                startDate={startDate}
                endDate={endDate}
                loading={loading}
            />
            <BubbleBarChart
                heading="Sampling Size of Assessments per Data Collection Technique"
                data={statisticsData?.sampleSizePerDataCollectionTechnique}
                countSelector={samplingSizeSelector}
                categories={sampleDataTechniqueOptions}
                dateSelector={dateSelector}
                categorySelector={samplingDataTechniqueSelector}
                startDate={startDate}
                endDate={endDate}
                loading={loading}
            />
        </div>
    );
}
export default HowAssessed;
