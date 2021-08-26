import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';
import Map, {
    MapBounds,
    MapContainer,
    MapSource,
    MapLayer,
    MapTooltip,
} from '@togglecorp/re-map';
import {
    Spinner,
    SegmentInput,
    Container,
    TextOutput,
    List,
} from '@the-deep/deep-ui';
import {
    MapboxGeoJSONFeature,
    AnySourceData,
    MapboxOptions,
    Layer,
    LngLat,
    PopupOptions,
    LngLatLike,
} from 'mapbox-gl';
import {
    MultiResponse,
    AdminLevelGeoArea,
    GeoAreaBounds,
} from '#types';
import { useRequest } from '#base/utils/restRequest';
import _ts from '#ts';

import styles from './styles.css';

const scaleFactor = 1;
const sourceOptions: AnySourceData = {
    type: 'geojson',
    // FIXME: we need to think about this
    promoteId: 'pk', // NOTE mapbox requires each feature property to have a unique identifier. Right now the server adds pk to each property so we are using it.
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

const tooltipOptions: PopupOptions = {
    closeOnClick: false,
    closeButton: false,
    offset: 12,
};

interface KeyValue {
    key: string;
    value: string;
}
const keySelector = (d: KeyValue) => d.key;
const adminLevelKeySelector = (d: AdminLevelGeoArea) => d.id;
const adminLevelLabelSelector = (d: AdminLevelGeoArea) => d.title;

const defaultGeoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
    type: 'FeatureCollection',
    features: [],
};

interface GeoAreaBoundsResponse {
    bounds: GeoAreaBounds;
}

interface Props {
    className?: string;
    regionId: string;
    adminLevel: string | undefined;
    onAdminLevelChange: (value: string | undefined) => void | undefined;
    showTooltip?: boolean;
    title?: string;
    navigationDisabled?: boolean;

    triggerId?: number;
}

function RegionMap(props: Props) {
    const {
        className,
        regionId,
        showTooltip,
        adminLevel,
        onAdminLevelChange,
        title,
        navigationDisabled,
        triggerId,
    } = props;

    const [hoverFeatureProperties, setHoverFeatureProperties] = useState<KeyValue[]>([]);
    const [hoverLngLat, setHoverLngLat] = useState<LngLatLike>();

    const myQuery = useMemo(
        () => ({
            region: regionId,
        }),
        [regionId],
    );

    const {
        pending,
        response: adminLevelGeoAreas,
        retrigger: adminLevelRetrigger,
    } = useRequest<MultiResponse<AdminLevelGeoArea>>({
        url: 'server://admin-levels/',
        query: myQuery,
        method: 'GET',
        preserveResponse: true,
        shouldPoll: (response) => (
            response?.results.some((v) => v.staleGeoAreas) ? 5000 : -1
        ),
        onSuccess: (response) => {
            const stale = response?.results.some((v) => v.staleGeoAreas);
            if (stale) {
                return;
            }
            const [topAdminLevel] = response.results;
            if (!adminLevel) {
                onAdminLevelChange(topAdminLevel?.id.toString());
            }
        },
        failureHeader: _ts('geoAreas', 'title'),
    });

    useEffect(
        () => {
            adminLevelRetrigger();
        },
        [triggerId, adminLevelRetrigger],
    );

    const activeAdminLevel = adminLevel ? adminLevelGeoAreas?.results?.find(
        (item) => item.id.toString() === adminLevel,
    ) : undefined;

    // const ready = adminLevelGeoAreas && !adminLevelGeoAreas.results.some(v => v.staleGeoAreas);

    const {
        pending: geoJsonPending,
        response: geoJsonResponse,
    } = useRequest<MapboxGeoJSONFeature>({
        // skip: isNotDefined(adminLevel) || !ready,
        url: activeAdminLevel?.geojsonFile,
        method: 'GET',
        failureHeader: _ts('geoAreas', 'title'),
    });

    const {
        pending: boundsPending,
        response: boundsResponse,
    } = useRequest<GeoAreaBoundsResponse>({
        // skip: isNotDefined(adminLevel) || !ready,
        url: activeAdminLevel?.boundsFile,
        // url: `server://admin-levels/${adminLevel}/geojson/bounds/`,
        method: 'GET',
        failureHeader: _ts('geoAreas', 'title'),
    });

    const lineLayerOptions: Omit<Layer, 'id'> = useMemo(() => {
        const noOfAdminLevels = adminLevelGeoAreas?.results.length;
        const selectedAdminLevel = adminLevelGeoAreas?.results.find(
            (item) => item.id.toString() === adminLevel,
        );
        const thickness = (
            isDefined(noOfAdminLevels) && isDefined(selectedAdminLevel)
            && noOfAdminLevels > selectedAdminLevel.level
        )
            ? (1 + (scaleFactor * ((noOfAdminLevels - selectedAdminLevel.level) / noOfAdminLevels)))
            : 1;

        return {
            type: 'line',
            paint: {
                'line-color': '#1a3ed0',
                'line-width': ['case',
                    ['boolean', ['feature-state', 'hovered'], false],
                    thickness + 2,
                    thickness,
                ],
            },
        };
    }, [adminLevelGeoAreas?.results, adminLevel]);

    const handleMouseEnter = useCallback((feature: MapboxGeoJSONFeature, lngLat: LngLat) => {
        setHoverLngLat(lngLat);
        if (feature.properties) {
            const properties = Object.entries(feature.properties)
                .map(([key, value]) => ({ key, value }));
            setHoverFeatureProperties(properties);
        } else {
            setHoverFeatureProperties([]);
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoverLngLat(undefined);
        setHoverFeatureProperties([]);
    }, []);

    const rendererParams = useCallback((_: string, data: KeyValue) => ({
        label: data.key,
        value: data.value,
    }), []);

    const handleAdminLevelChange = useCallback(
        (value: number) => {
            onAdminLevelChange(value.toString());
        },
        [onAdminLevelChange],
    );

    const bounds: [number, number, number, number] | undefined = useMemo(() => {
        if (!boundsResponse?.bounds) {
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

        // NOTE: bounds can be an empty object;
        if (isNotDefined(minX) || isNotDefined(minY) || isNotDefined(maxX) || isNotDefined(maxY)) {
            return undefined;
        }

        return [minX, minY, maxX, maxY];
    }, [boundsResponse]);

    const myGeoJson = geoJsonResponse ?? defaultGeoJson;

    return (
        <Container
            className={_cs(styles.container, className)}
            heading={title}
            headingSize="small"
            contentClassName={styles.content}
        >
            <SegmentInput
                className={styles.adminLevels}
                name="adminLevels"
                onChange={handleAdminLevelChange}
                options={adminLevelGeoAreas?.results}
                keySelector={adminLevelKeySelector}
                labelSelector={adminLevelLabelSelector}
                value={adminLevel ? +adminLevel : undefined}
                disabled={navigationDisabled}
            />
            {(pending || geoJsonPending || boundsPending) && (
                <Spinner className={styles.spinner} />
            )}
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
                    geoJson={myGeoJson}
                >
                    <MapLayer
                        layerKey="fill"
                        layerOptions={fillLayerOptions}
                        onMouseEnter={showTooltip ? handleMouseEnter : undefined}
                        onMouseLeave={showTooltip ? handleMouseLeave : undefined}
                    />
                    <MapLayer
                        layerKey="line"
                        layerOptions={lineLayerOptions}
                    />
                    {showTooltip && hoverLngLat && (
                        <MapTooltip
                            coordinates={hoverLngLat}
                            tooltipOptions={tooltipOptions}
                            trackPointer
                        >
                            <List
                                data={hoverFeatureProperties}
                                renderer={TextOutput}
                                keySelector={keySelector}
                                rendererParams={rendererParams}
                            />
                        </MapTooltip>
                    )}
                </MapSource>
            </Map>
        </Container>
    );
}

export default RegionMap;
