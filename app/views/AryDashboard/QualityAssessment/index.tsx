import React, { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { PurgeNull, removeNull } from '@togglecorp/toggle-form';
import { _cs, formatDateToString, isNotDefined } from '@togglecorp/fujs';

import {
    AryDashboardQualityAssessmentQuery,
    AryDashboardQualityAssessmentQueryVariables,
    ProjectMetadataForAryQuery,
} from '#generated/types';

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
                    geoId
                    region
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
        startDate,
        endDate,
    } = props;

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

    return (
        <div className={_cs(className, styles.qualityAssessment)}>
            <GeographicalAreaQualityScore
                data={statisticsData}
                regions={regions}
                selectedRegion={selectedRegion}
                onRegionChange={onRegionChange}
                selectedAdminLevel={selectedAdminLevel}
                onAdminLevelChange={onAdminLevelChange}
                navigationDisabled={loading}
            />
        </div>
    );
}
export default QualityAssessment;
