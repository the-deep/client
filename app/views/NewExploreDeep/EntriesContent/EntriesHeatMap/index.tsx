import React, { useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import Map, {
    MapContainer,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';
import {
    MapboxOptions,
} from 'mapbox-gl';

import { mapboxStyle } from '#base/configs/env';

import styles from './styles.css';

const heatMapPaint: mapboxgl.HeatmapPaint = {
    'heatmap-weight': [
        'interpolate',
        ['linear'],
        ['get', 'count'],
        0,
        0,
        10,
        1,
    ],
    'heatmap-intensity': 0.5,
    'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(33,102,172,0)',
        0.2,
        'rgb(103,169,207)',
        0.4,
        'rgb(209,229,240)',
        0.6,
        'rgb(253,219,199)',
        0.8,
        'rgb(239,138,98)',
        1,
        'rgb(178,24,43)',
    ],
    'heatmap-radius': 20,
};

/*
const circlePaint = {
    // Size circle radius by earthquake magnitude and zoom level
    'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7,
        ['interpolate', ['linear'], ['get', 'count'], 1, 1, 6, 4],
        16,
        ['interpolate', ['linear'], ['get', 'count'], 1, 5, 6, 50],
    ],
    // Color circle by earthquake magnitude
    'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'count'],
        1,
        'rgba(33,102,172,0)',
        2,
        'rgb(103,169,207)',
        3,
        'rgb(209,229,240)',
        4,
        'rgb(253,219,199)',
        5,
        'rgb(239,138,98)',
        6,
        'rgb(178,24,43)',
    ],
    'circle-stroke-color': 'white',
    'circle-stroke-width': 1,
    // Transition from heatmap to circle layer by zoom level
    'circle-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7,
        0,
        8,
        1,
    ],
};
*/

export const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

export const pointSymbolFilter = ['!', ['has', 'point_count']];

export const visibleLayout: mapboxgl.LineLayout = {
    visibility: 'visible',
};

export const mapOptions: Partial<MapboxOptions> = {
    zoom: 2,
    center: [50, 10],
};

export interface EntryByRegion {
    centroid?: unknown;
    count?: number;
}

interface Props {
    entriesByRegion: EntryByRegion[] | undefined | null;
    className?: string;
}

function EntriesHeatMap(props: Props) {
    const {
        className,
        entriesByRegion,
    } = props;

    const geoJson: GeoJSON.FeatureCollection<GeoJSON.Point> | undefined = useMemo(() => {
        if (!entriesByRegion) {
            return undefined;
        }
        const projectFeatures = entriesByRegion.map((entryByRegion) => ({
            type: 'Feature' as const,
            geometry: entryByRegion.centroid as GeoJSON.Point,
            properties: {
                count: entryByRegion.count,
            },
        })).filter(isDefined);

        return ({
            type: 'FeatureCollection',
            features: projectFeatures ?? [],
        });
    }, [entriesByRegion]);

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
            >
                <MapLayer
                    layerKey="heatmap"
                    layerOptions={{
                        type: 'heatmap',
                        paint: heatMapPaint,
                        layout: visibleLayout,
                    }}
                />
            </MapSource>
        </Map>
    );
}

export default EntriesHeatMap;
