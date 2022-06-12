import React, { useState, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import {
    _cs,
    unique,
    isDefined,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    PendingMessage,
} from '@the-deep/deep-ui';
import Map, {
    MapContainer,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';
import {
    MapboxGeoJSONFeature,
    LngLat,
} from 'mapbox-gl';

import {
    ProjectsByRegionQuery,
    ProjectsByRegionQueryVariables,
    ProjectDetailsForMapViewQuery,
    ProjectDetailsForMapViewQueryVariables,
    ProjectListQueryVariables,
} from '#generated/types';
import { convertDateToIsoDateTime } from '#utils/common';
import { mapboxStyle } from '#base/configs/env';
import {
    sourceOptions,
    pointSymbolFilter,
    clusterPointCirclePaint,
    clusterPointTextPaint,
    clusterPointTextLayout,
    visibleLayout,
    mapOptions,
} from '../PublicMapView';

import ProjectList from './ProjectList';

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

    const geoJson: GeoJSON.FeatureCollection<GeoJSON.Point> | undefined = useMemo(() => {
        if (!data) {
            return undefined;
        }
        const projects = data.projectsByRegion?.results?.map((projectByRegion) => (
            projectByRegion.projectsId?.map((project) => ({
                id: project,
                type: 'Feature' as const,
                geometry: projectByRegion.centroid as GeoJSON.Point,
                properties: {
                    id: project,
                    projectId: project,
                },
            }))
        )).flat().filter(isDefined);

        return ({
            type: 'FeatureCollection',
            features: projects ?? [],
        });
    }, [data]);

    const handleClick = useCallback((
        feature: MapboxGeoJSONFeature,
        _: LngLat,
        __: mapboxgl.Point,
        map: mapboxgl.Map,
    ) => {
        interface ClusterProperties {
            cluster_id: number;
            point_count: number;
            project_ids: string;
        }

        if (feature.properties) {
            const {
                // eslint-disable-next-line camelcase
                cluster_id,
                // eslint-disable-next-line camelcase
                point_count,
            } = feature.properties as ClusterProperties;

            const clusterSource = map.getSource('region') as mapboxgl.GeoJSONSource;
            if (clusterSource) {
                clusterSource.getClusterLeaves(
                    cluster_id,
                    point_count,
                    0,
                    (___, aFeatures) => {
                        if (aFeatures) {
                            const projectIds = aFeatures
                                .map((f) => f?.properties?.projectId)
                                .filter(isDefined);
                            setPage(1);
                            setClickedFeatureProperties(projectIds);
                        }
                    },
                );
            }

            if (feature.properties.projectId) {
                setClickedFeatureProperties([feature.properties.projectId]);
            } else {
                setClickedFeatureProperties([]);
            }
        }
        setClusterClicked(!clusterClicked);
        return true;
    }, [clusterClicked]);

    const handleListClose = useCallback(() => {
        setClusterClicked(false);
    }, []);

    const createClusterMarker = useCallback((markerProps: object) => {
        const {
            project_ids: projectIds,
        } = markerProps as { project_ids: string | undefined };

        const uniqueProjects = unique(
            projectIds?.split(',')?.filter((id) => id.length > 0) ?? [],
            (id) => id,
        );
        const uniqueProjectsCount = uniqueProjects.length;

        const width = Math.min(8 * Math.log10(uniqueProjectsCount) + 20, 100);

        const mainDiv = document.createElement('div');
        ReactDOM.render(
            <button
                className={styles.count}
                type="button"
                onClick={() => {
                    setClickedFeatureProperties(uniqueProjects);
                    setClusterClicked((oldVal) => !oldVal);
                }}
                style={{
                    width: `${width}px`,
                    height: `${width}px`,
                }}
            >
                {uniqueProjectsCount}
            </button>,
            mainDiv,
        );
        return mainDiv;
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
            <Map
                mapStyle={mapboxStyle}
                mapOptions={mapOptions}
                scaleControlShown={false}
                navControlShown={false}
            >
                <MapContainer className={styles.map} />
                <MapSource
                    sourceKey="region"
                    sourceOptions={sourceOptions}
                    geoJson={geoJson}
                    createMarkerElement={createClusterMarker}
                >
                    <MapLayer
                        layerKey="cases-cluster-background"
                        layerOptions={{
                            type: 'circle',
                            paint: clusterPointCirclePaint,
                            filter: pointSymbolFilter,
                            layout: visibleLayout,
                        }}
                        onClick={handleClick}
                    />
                    <MapLayer
                        layerKey="cases-cluster-number"
                        layerOptions={{
                            type: 'symbol',
                            paint: clusterPointTextPaint,
                            filter: pointSymbolFilter,
                            layout: clusterPointTextLayout,
                        }}
                    />
                </MapSource>
            </Map>
        </div>
    );
}

export default ExploreDeepMapView;
