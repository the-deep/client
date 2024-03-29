import React, { useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
    _cs,
    unique,
    isDefined,
} from '@togglecorp/fujs';
import Map, {
    MapContainer,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';
import {
    MapboxGeoJSONFeature,
    LngLat,
    MapboxOptions,
} from 'mapbox-gl';

import { mapboxStyle } from '#base/configs/env';

import styles from './styles.css';

export const sourceOptions: mapboxgl.GeoJSONSourceRaw & { clusterProperties: unknown } = {
    type: 'geojson',
    cluster: true,
    clusterRadius: 100,
    clusterProperties: {
        project_ids: ['concat', ['concat', ['get', 'projectId'], ',']],
    },
};

const white = '#ffffff';
export const pointSymbolFilter = ['!', ['has', 'point_count']];

export const clusterPointCirclePaint: mapboxgl.CirclePaint = {
    'circle-radius': 12,
    'circle-color': '#1a3ed0',
};

export const clusterPointTextPaint: mapboxgl.SymbolPaint = {
    'text-color': white,
    'text-halo-width': 0,
};

export const clusterPointTextLayout: mapboxgl.SymbolLayout = {
    visibility: 'visible',
    'symbol-sort-key': [
        'case',
        ['has', 'point_count'],
        ['-', ['get', 'point_count']],
        -1,
    ],
    'text-field': [
        'case',
        ['has', 'point_count'],
        ['get', 'point_count_abbreviated'],
        '1',
    ],
    'text-size': 15,
};

export const visibleLayout: mapboxgl.LineLayout = {
    visibility: 'visible',
};

export const mapOptions: Partial<MapboxOptions> = {
    zoom: 2,
    center: [50, 10],
};

interface ClusterProperties {
    cluster_id: number;
    point_count: number;
    project_ids: string;
}

interface Project {
    centroid?: unknown;
    id?: string;
    projectIds?: null | undefined | string[];
}

interface Props {
    onClickedFeaturePropertiesChange: (newVal: string[]) => void;
    clusterClicked: boolean;
    onClusterClickedChange: React.Dispatch<React.SetStateAction<boolean>>;
    projects: Project[] | undefined | null;
    className?: string;
}

function ExploreDeepMapView(props: Props) {
    const {
        className,
        clusterClicked,
        onClusterClickedChange,
        onClickedFeaturePropertiesChange,
        projects,
    } = props;

    const geoJson: GeoJSON.FeatureCollection<GeoJSON.Point> | undefined = useMemo(() => {
        if (!projects) {
            return undefined;
        }
        const projectFeatures = projects.map((projectByRegion) => (
            projectByRegion.projectIds?.map((project) => ({
                id: project,
                type: 'Feature' as const,
                geometry: projectByRegion.centroid as GeoJSON.Point,
                properties: {
                    projectId: project,
                },
            }))
        )).flat().filter(isDefined);

        return ({
            type: 'FeatureCollection',
            features: projectFeatures ?? [],
        });
    }, [projects]);

    const handleClick = useCallback((
        feature: MapboxGeoJSONFeature,
        _: LngLat,
        __: mapboxgl.Point,
        map: mapboxgl.Map,
    ) => {
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
                            const projectIds = unique(aFeatures
                                .map((f) => f?.properties?.projectId)
                                .filter(isDefined), (projectId) => projectId);
                            onClickedFeaturePropertiesChange(projectIds);
                        }
                    },
                );
            } else if (feature.properties.projectId) {
                onClickedFeaturePropertiesChange([feature.properties.projectId]);
            } else {
                onClickedFeaturePropertiesChange([]);
            }
        }
        onClusterClickedChange(!clusterClicked);
        return true;
    }, [clusterClicked, onClusterClickedChange, onClickedFeaturePropertiesChange]);

    const createClusterMarker = useCallback((markerProps: unknown) => {
        const {
            project_ids: projectIds,
        } = markerProps as ClusterProperties;

        const uniqueProjects = unique(
            projectIds?.split(',').filter((id) => id.length > 0) ?? [],
            (id) => id,
        );

        const uniqueProjectsCount = Math.max(uniqueProjects.length, 1);

        const width = Math.min(20 * Math.log10(uniqueProjectsCount) + 20, 200);

        const mainDiv = document.createElement('div');
        const root = createRoot(mainDiv);
        root.render(
            <button
                className={styles.count}
                type="button"
                onClick={() => {
                    onClickedFeaturePropertiesChange(uniqueProjects);
                    onClusterClickedChange((oldVal) => !oldVal);
                }}
                style={{
                    width: `${width}px`,
                    height: `${width}px`,
                }}
            >
                {uniqueProjectsCount}
            </button>,
        );
        return mainDiv;
    }, [onClickedFeaturePropertiesChange, onClusterClickedChange]);

    return (
        <Map
            mapStyle={mapboxStyle}
            mapOptions={mapOptions}
            scaleControlShown={false}
            navControlShown={false}
        >
            <MapContainer className={_cs(className, styles.map)} />
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
    );
}

export default ExploreDeepMapView;
