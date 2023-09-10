import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { PurgeNull, removeNull } from '@togglecorp/toggle-form';
import { _cs, isNotDefined } from '@togglecorp/fujs';

import {
    AryDashboadQualityAssessmentQuery,
    AryDashboadQualityAssessmentQueryVariables,
    AryDashboardFilterQuery,
    AryDashboardFilterQueryVariables,
} from '#generated/types';
import GeographicalAreaQualityScore from './GeographicalAreaQualityScore';
import styles from './styles.css';

const ARY_DASHBOARD_QUALITY_ASSESSMENT = gql`
    query AryDashboadQualityAssessment(
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
    filters?: AryDashboardFilterQueryVariables;
    regions: NonNullable<PurgeNull<AryDashboardFilterQuery['project']>>['regions'];
    selectedRegion?: string;
    onRegionChange: (newVal: string | undefined) => void;
    selectedAdminLevel?: string;
    onAdminLevelChange: (newVal: string | undefined) => void;
}

function QualityAssessment(props: Props) {
    const {
        className,
        filters,
        regions,
        selectedRegion,
        onRegionChange,
        selectedAdminLevel,
        onAdminLevelChange,
    } = props;

    const {
        loading,
        data,
    } = useQuery<AryDashboadQualityAssessmentQuery, AryDashboadQualityAssessmentQueryVariables>(
        ARY_DASHBOARD_QUALITY_ASSESSMENT, {
            skip: isNotDefined(filters),
            variables: filters,
        },
    );

    const statisticsData = removeNull(data?.project?.assessmentDashboardStatistics);

    return (
        <div className={_cs(className, styles.qualityAssessment)}>
            <GeographicalAreaQualityScore
                data={statisticsData}
                regions={regions}
                navigationDisabled={loading}
                selectedRegion={selectedRegion}
                onRegionChange={onRegionChange}
                selectedAdminLevel={selectedAdminLevel}
                onAdminLevelChange={onAdminLevelChange}
            />
        </div>
    );
}
export default QualityAssessment;
