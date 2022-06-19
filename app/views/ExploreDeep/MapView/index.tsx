import React, { useState, useCallback, useMemo } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    PendingMessage,
} from '@the-deep/deep-ui';

import {
    ProjectsByRegionQuery,
    ProjectsByRegionQueryVariables,
    ProjectDetailsForMapViewQuery,
    ProjectDetailsForMapViewQueryVariables,
    ProjectListQueryVariables,
} from '#generated/types';
import { convertDateToIsoDateTime } from '#utils/common';

import ProjectList from './ProjectList';
import ProjectCountMap from '../ProjectCountMap';

import styles from './styles.css';

const PROJECT_LIST = gql`
    query ProjectsByRegion(
        $projectFilter: RegionProjectFilterData,
    ) {
        projectsByRegion(
            projectFilter: $projectFilter,
        ) {
            results {
                centroid
                id
                projectsId
            }
        }
    }
`;

const PROJECT_DETAILS = gql`
    query ProjectDetailsForMapView(
        $projectIdList: [ID!]
        $page: Int
        $pageSize: Int
    ) {
        projects(
            ids: $projectIdList,
            page: $page,
            pageSize: $pageSize,
        ) {
            page
            pageSize
            totalCount
            results {
                id
                title
                description
                createdAt
                membershipPending
                currentUserRole
                isRejected
                stats {
                    numberOfUsers
                    numberOfLeads
                    numberOfEntries
                }
                analysisFramework {
                    id
                    title
                }
            }
        }
    }
`;

export type Project = NonNullable<NonNullable<NonNullable<ProjectsByRegionQuery['projectsByRegion']>['results']>[number]>;

interface Props {
    className?: string;
    filters: ProjectListQueryVariables | undefined;
}

function ExploreDeepMapView(props: Props) {
    const {
        className,
        filters,
    } = props;

    // FIXME: rename startDate to createdAtGte
    // FIXME: rename endDate to createdAtLte
    const variables = useMemo(() => ({
        projectFilter: {
            ...filters,
            startDate: convertDateToIsoDateTime(filters?.startDate),
            endDate: convertDateToIsoDateTime(filters?.endDate, { endOfDay: true }),
        },
    }), [filters]);

    const {
        data,
        loading,
    } = useQuery<ProjectsByRegionQuery, ProjectsByRegionQueryVariables>(
        PROJECT_LIST,
        {
            variables,
        },
    );

    const [clickedFeatureProperties, setClickedFeatureProperties] = useState<string[]>([]);
    const [clusterClicked, setClusterClicked] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const projectDetailsVariables = useMemo(
        () => ({
            projectIdList: clickedFeatureProperties,
            page,
            pageSize,
        }),
        [clickedFeatureProperties, page, pageSize],
    );

    const {
        previousData,
        data: projectDetails = previousData,
        loading: projectDetailsPending,
        refetch: refetchProjectDetails,
    } = useQuery<ProjectDetailsForMapViewQuery, ProjectDetailsForMapViewQueryVariables>(
        PROJECT_DETAILS,
        {
            variables: projectDetailsVariables,
        },
    );

    const handleClusterClick = useCallback((projectIds: string[]) => {
        setPage(1);
        setClickedFeatureProperties(projectIds);
    }, []);

    const handleListClose = useCallback(() => {
        setClusterClicked(false);
    }, []);

    return (
        <div className={_cs(className, styles.mapView)}>
            {clusterClicked && (
                <ProjectList
                    projectDetails={projectDetails?.projects?.results ?? undefined}
                    projectDetailsPending={projectDetailsPending}
                    onListCloseButtonClick={handleListClose}
                    page={page}
                    pageSize={pageSize}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    totalCount={projectDetails?.projects?.totalCount ?? 0}
                    refetchProjectDetails={refetchProjectDetails}
                />
            )}
            {loading && (<PendingMessage />)}
            <ProjectCountMap
                clusterClicked={clusterClicked}
                onClusterClickedChange={setClusterClicked}
                onClickedFeaturePropertiesChange={handleClusterClick}
                projects={data?.projectsByRegion?.results}
            />
        </div>
    );
}

export default ExploreDeepMapView;
