import React, { useState, useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    PendingMessage,
} from '@the-deep/deep-ui';

import {
    PublicProjectsByRegionQuery,
    PublicProjectsByRegionQueryVariables,
    PublicProjectDetailsForMapViewQuery,
    PublicProjectDetailsForMapViewQueryVariables,
    ProjectListQueryVariables,
} from '#generated/types';
import { convertDateToIsoDateTime } from '#utils/common';

import ProjectCountMap from '../ProjectCountMap';
import ProjectList from './ProjectList';
import styles from './styles.css';

const PROJECT_LIST = gql`
    query PublicProjectsByRegion(
        $projectFilter: RegionProjectFilterData,
    ) {
        publicProjectsByRegion(
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
    query PublicProjectDetailsForMapView(
        $projectIdList: [ID!]
        $page: Int
        $pageSize: Int
    ) {
        publicProjects(
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
                numberOfUsers
                numberOfLeads
                numberOfEntries
                analysisFrameworkTitle
                analysisFrameworkPreviewImage
            }
        }
    }
`;

export type Project = NonNullable<NonNullable<NonNullable<PublicProjectsByRegionQuery['publicProjectsByRegion']>['results']>[number]>;

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
    } = useQuery<PublicProjectsByRegionQuery, PublicProjectsByRegionQueryVariables>(
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
    } = useQuery<PublicProjectDetailsForMapViewQuery, PublicProjectDetailsForMapViewQueryVariables>(
        PROJECT_DETAILS,
        {
            variables: projectDetailsVariables,
        },
    );

    const handleListClose = useCallback(() => {
        setClusterClicked(false);
    }, []);

    const handleClusterClick = useCallback((projectIds: string[]) => {
        setPage(1);
        setClickedFeatureProperties(projectIds);
    }, []);

    return (
        <div className={_cs(className, styles.mapView)}>
            {clusterClicked && (
                <ProjectList
                    projectDetails={projectDetails?.publicProjects?.results ?? undefined}
                    onListCloseButtonClick={handleListClose}
                    page={page}
                    pageSize={pageSize}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    projectDetailsPending={projectDetailsPending}
                    totalCount={projectDetails?.publicProjects?.totalCount ?? 0}
                />
            )}
            {loading && (<PendingMessage />)}
            <ProjectCountMap
                clusterClicked={clusterClicked}
                onClusterClickedChange={setClusterClicked}
                onClickedFeaturePropertiesChange={handleClusterClick}
                projects={data?.publicProjectsByRegion?.results}
            />
        </div>
    );
}

export default ExploreDeepMapView;
