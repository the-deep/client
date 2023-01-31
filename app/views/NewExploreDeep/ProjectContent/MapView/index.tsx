import React, { useState, useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';

import {
    ProjectDetailsForMapViewQuery,
    ProjectDetailsForMapViewQueryVariables,
} from '#generated/types';

import ProjectCountMap from '../ProjectCountMap';
import ProjectList from './ProjectList';

import styles from './styles.css';

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

export type Projects = {
    id: string;
    centroid?: unknown;
    projectIds?: string[] | undefined | null;
};

interface Props {
    className?: string;
    projects: Projects[] | undefined;
}

function ExploreDeepMapView(props: Props) {
    const {
        className,
        projects,
    } = props;

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
            skip: !clusterClicked,
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
                    projectDetails={projectDetails?.projects?.results ?? undefined}
                    onListCloseButtonClick={handleListClose}
                    page={page}
                    pageSize={pageSize}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    projectDetailsPending={projectDetailsPending}
                    totalCount={projectDetails?.projects?.totalCount ?? 0}
                    refetchProjectDetails={refetchProjectDetails}
                />
            )}
            <ProjectCountMap
                className={styles.map}
                clusterClicked={clusterClicked}
                onClusterClickedChange={setClusterClicked}
                onClickedFeaturePropertiesChange={handleClusterClick}
                projects={projects}
            />
        </div>
    );
}

export default ExploreDeepMapView;
