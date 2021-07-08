import React, { useMemo, useState, useCallback } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import Map, {
    MapBounds,
    MapContainer,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';
import {
    PendingMessage,
    SegmentInput,
} from '@the-deep/deep-ui';
import {
    AnySourceData,
    MapboxOptions,
    Layer,
} from 'mapbox-gl';
import {
    MultiResponse,
    AdminLevelGeoArea,
    GeoAreaBounds,
} from '#typings';
import { useRequest, useLazyRequest } from '#utils/request';
import _ts from '#ts';

import styles from './styles.scss';

const lineWidthScaleFactor = 2;
const sourceOptions: AnySourceData = {
    type: 'geojson',
};

const fillLayerOptions: Omit<Layer, 'id'> = {
    type: 'fill',
    paint: {
        'fill-opacity': ['case',
            ['boolean', ['feature-state', 'hovered'], false],
            0.7,
            0.5,
        ],
        'fill-color': ['case',
            ['boolean', ['feature-state', 'selected'], false],
            '#1a3ed0',
            '#a9bedc',
        ],
    },
};

const mapOptions: Partial<MapboxOptions> = {
    zoom: 2,
    center: [50, 10],
};

const defaultGeoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
    type: 'FeatureCollection',
    features: [],
};

const adminLevelKeySelector = (d: AdminLevelGeoArea) => d.level;
const adminLevelLabelSelector = (d: AdminLevelGeoArea) => d.title;

interface GeoAreaBoundsResponse {
    bounds: GeoAreaBounds;
}

interface Props {
    className?: string;
    regionId: string;
}

function RegionMap(props: Props) {
    const {
        className,
        regionId,
    } = props;

    const [selectedAdminLevel, setSelectedAdminLevel] = useState<number>();

    const {
        response: boundsResponse,
        trigger: getBounds,
    } = useLazyRequest<GeoAreaBoundsResponse, string | undefined>({
        url: ctx => ctx,
        method: 'GET',
    });

    const {
        pending,
        response: adminLevelGeoAreas,
    } = useRequest<MultiResponse<AdminLevelGeoArea>>({
        url: 'server://admin-levels/',
        query: ({
            region: regionId,
        }),
        shouldPoll: response => (
            response?.results.some(v => v.staleGeoAreas) ? 2000 : -1
        ),
        method: 'GET',
        onSuccess: (response) => {
            const [topAdminLevel] = response.results;
            if (topAdminLevel) {
                setSelectedAdminLevel(topAdminLevel.level);
                getBounds(topAdminLevel.boundsFile);
            }
        },
        failureHeader: _ts('geoAreas', 'title'),
    });

    const thickness = useMemo(() => {
        const noOfAdminLevels = adminLevelGeoAreas?.results.length;
        return (isDefined(noOfAdminLevels) && isDefined(selectedAdminLevel)) ? (1 + (
            lineWidthScaleFactor * ((noOfAdminLevels - selectedAdminLevel) / noOfAdminLevels))
        ) : 1;
    }, [adminLevelGeoAreas?.results.length, selectedAdminLevel]);

    const lineLayerOptions: Omit<Layer, 'id'> = useMemo(() => ({
        type: 'line',
        paint: {
            'line-color': '#1a3ed0',
            'line-width': ['case',
                ['boolean', ['feature-state', 'hovered'], false],
                thickness + 2,
                thickness,
            ],
        },
    }), [thickness]);

    const bounds: [number, number, number, number] | undefined = useMemo(() => {
        if (!boundsResponse) {
            return undefined;
        }
        const {
            bounds: {
                minX,
                minY,
                maxX,
                maxY,
            },
        } = boundsResponse;
        return [minX, minY, maxX, maxY];
    }, [boundsResponse]);

    const geoJson = useMemo(() => (adminLevelGeoAreas?.results
        .find(v => v.level === selectedAdminLevel)?.geojsonFile ?? defaultGeoJson
    ), [adminLevelGeoAreas, selectedAdminLevel]);

    const handleAdminLevelChange = useCallback((level: number) => {
        setSelectedAdminLevel(level);
        const boundsUrl = adminLevelGeoAreas?.results
            .find(v => v.level === level)?.boundsFile;
        getBounds(boundsUrl);
    }, [adminLevelGeoAreas?.results, getBounds]);

    if (pending) {
        return (<PendingMessage />);
    }

    if (adminLevelGeoAreas && adminLevelGeoAreas.results.length < 1) {
        return (
            <div className={_cs(styles.noMap)}>
                {_ts('geoAreas', 'mapNotAvailable')}
            </div>
        );
    }

    return (
        <div className={_cs(styles.map, className)}>
            <SegmentInput
                className={styles.adminLevels}
                name="adminLevels"
                onChange={handleAdminLevelChange}
                options={adminLevelGeoAreas?.results}
                keySelector={adminLevelKeySelector}
                labelSelector={adminLevelLabelSelector}
                value={selectedAdminLevel}
            />
            <Map
                mapStyle={process.env.REACT_APP_MAPBOX_STYLE}
                mapOptions={mapOptions}
                scaleControlShown={false}
                navControlShown={false}
            >
                <MapContainer className={styles.geoJsonMap} />
                {bounds && (
                    <MapBounds
                        bounds={bounds}
                        padding={10}
                    />
                )}
                <MapSource
                    sourceKey="region"
                    sourceOptions={sourceOptions}
                    geoJson={geoJson}
                >
                    <MapLayer
                        layerKey="fill"
                        layerOptions={fillLayerOptions}
                    />
                    <MapLayer
                        layerKey="line"
                        layerOptions={lineLayerOptions}
                    />
                </MapSource>
            </Map>
        </div>
    );
}

export default RegionMap;
