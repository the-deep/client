import React, { useMemo } from 'react';
import {
    _cs,
    isNotDefined,
    formatDateToString,
} from '@togglecorp/fujs';
import { PurgeNull, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';

import {
    ProjectMetadataForAryQuery,
    AryDashboardHowAssessedQuery,
    AryDashboardHowAssessedQueryVariables,
    GetMethodologyOptionsQuery,
    GetMethodologyOptionsQueryVariables,
} from '#generated/types';

import GeographicalAreaMethodology from './GeographicalAreaMethodology';
import { FilterForm } from '../Filters';

import styles from './styles.css';

const GET_METHODOLOGY_OPTIONS = gql`
    query GetMethodologyOptions {
        dataCollectionTechniqueOptions: __type(name: "AssessmentRegistryDataCollectionTechniqueTypeEnum") {
            enumValues {
                name
                description
            }
        }
        samplingApproach: __type(name: "AssessmentRegistrySamplingApproachTypeEnum") {
            enumValues {
                name
                description
            }
        }
        proximity: __type(name: "AssessmentRegistryProximityTypeEnum") {
            enumValues {
                name
                description
            }
        }
        unitOfAnanlysis: __type(name: "AssessmentRegistryUnitOfAnalysisTypeEnum") {
            enumValues {
                name
                description
            }
        }
        unitOfReporting: __type(name: "AssessmentRegistryUnitOfReportingTypeEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;
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
                    geoId
                    region
                    dataCollectionTechnique
                }
                assessmentBySamplingApproachAndGeolocation {
                    adminLevelId
                    count
                    geoId
                    region
                    samplingApproach
                }
                assessmentByUnitOfAnalysisAndGeolocation {
                    adminLevelId
                    count
                    geoId
                    region
                    unitOfAnalysis
                }
                assessmentByUnitOfReportingAndGeolocation {
                    adminLevelId
                    count
                    geoId
                    region
                    unitOfReporting
                }
                assessmentByProximityAndGeolocation {
                    adminLevelId
                    count
                    geoId
                    region
                    proximity
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
    } = props;

    const {
        loading,
        data: options,
    } = useQuery<GetMethodologyOptionsQuery, GetMethodologyOptionsQueryVariables>(
        GET_METHODOLOGY_OPTIONS,
    );

    const variables: AryDashboardHowAssessedQueryVariables = useMemo(() => ({
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
        loading: responsePending,
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

    return (
        <div className={_cs(className, styles.howAssessed)}>
            <GeographicalAreaMethodology
                data={statisticsData}
                options={options}
                regions={regions}
                selectedRegion={selectedRegion}
                onRegionChange={onRegionChange}
                selectedAdminLevel={selectedAdminLevel}
                onAdminLevelChange={onAdminLevelChange}
                navigationDisabled={loading || responsePending}
            />
        </div>
    );
}
export default HowAssessed;
