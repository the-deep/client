import React from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import { PurgeNull, removeNull } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';

import {
    AryDashboardFilterQuery,
    AryDashboardFilterQueryVariables,
    AryDashboardHowAssedQuery,
    AryDashboardHowAssedQueryVariables,
    GetMethodologyOptionsQuery,
    GetMethodologyOptionsQueryVariables,
} from '#generated/types';

import GeographicalAreaMethodology from './GeographicalAreaMethodology';

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
    query AryDashboardHowAssed(
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
    filters?: AryDashboardFilterQueryVariables;
    regions: NonNullable<PurgeNull<AryDashboardFilterQuery['project']>>['regions'];
    selectedRegion?: string;
    setSelectedRegion: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function HowAssessed(props: Props) {
    const {
        className,
        filters,
        regions,
        selectedRegion,
        setSelectedRegion,
    } = props;

    const {
        loading,
        data: options,
    } = useQuery<GetMethodologyOptionsQuery, GetMethodologyOptionsQueryVariables>(
        GET_METHODOLOGY_OPTIONS,
    );

    const {
        loading: responsePending,
        data,
    } = useQuery<AryDashboardHowAssedQuery, AryDashboardHowAssedQueryVariables>(
        ARY_DASHBOARD_HOW_ASSESSED,
        {
            skip: isNotDefined(filters),
            variables: filters,
        },
    );
    const statisticsData = removeNull(data?.project?.assessmentDashboardStatistics);

    return (
        <div className={_cs(className)}>
            <GeographicalAreaMethodology
                data={statisticsData}
                options={options}
                regions={regions}
                navigationDisabled={loading || responsePending}
                selectedRegionId={selectedRegion}
                setSelectedRegionId={setSelectedRegion}

            />
        </div>
    );
}
export default HowAssessed;
