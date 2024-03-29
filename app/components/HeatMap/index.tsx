import React, { useMemo, useState } from 'react';
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
import SliderInput from '#components/input/SliderInput';

import { mapboxStyle } from '#base/configs/env';

import styles from './styles.css';

const staticHeatMapPaint: mapboxgl.HeatmapPaint = {
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

export const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

export const pointSymbolFilter = ['!', ['has', 'point_count']];

export const visibleLayout: mapboxgl.LineLayout = {
    visibility: 'visible',
};

interface Point {
    centroid?: unknown;
    count?: number;
}

interface Props {
    points: Point[] | undefined | null;
    className?: string;
    defaultZoom?: number;
}

function HeatMap(props: Props) {
    const {
        className,
        points,
        defaultZoom = 2,
    } = props;

    const [intensityValue, setIntesityValue] = useState(0.75);
    const [radiusValue, setRadiusValue] = useState(20);

    const heatMapPaint = useMemo(() => ({
        ...staticHeatMapPaint,
        'heatmap-intensity': intensityValue,
        'heatmap-radius': radiusValue,
    }), [
        intensityValue,
        radiusValue,
    ]);

    const geoJson: GeoJSON.FeatureCollection<GeoJSON.Point> | undefined = useMemo(() => {
        if (!points) {
            return undefined;
        }
        const projectFeatures = points.map((point) => ({
            type: 'Feature' as const,
            geometry: point.centroid as GeoJSON.Point,
            properties: {
                count: point.count,
            },
        })).filter(isDefined);

        return ({
            type: 'FeatureCollection',
            features: projectFeatures ?? [],
        });
    }, [points]);

    const mapOptions: Partial<MapboxOptions> = useMemo(() => ({
        zoom: defaultZoom,
        center: [50, 10],
    }), [defaultZoom]);

    return (
        <Map
            mapStyle={mapboxStyle}
            mapOptions={mapOptions}
            scaleControlShown={false}
            navControlShown={false}
        >
            <MapContainer
                className={_cs(className, styles.map)}
            />
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
            <div className={styles.controls}>
                <SliderInput
                    className={styles.sliderInput}
                    label="Intensity"
                    min={0.5}
                    max={2}
                    step={0.05}
                    minDistance={0.05}
                    value={intensityValue}
                    onChange={setIntesityValue}
                    hideMarks
                />
                <SliderInput
                    className={styles.sliderInput}
                    label="Radius"
                    min={5}
                    max={40}
                    step={1}
                    minDistance={1}
                    value={radiusValue}
                    onChange={setRadiusValue}
                    hideMarks
                />
            </div>
        </Map>
    );
}

export default HeatMap;
