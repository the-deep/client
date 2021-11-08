import React, { useMemo, useState, useCallback } from 'react';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';
import Map, {
    MapBounds,
    MapContainer,
    MapSource,
    MapLayer,
    MapTooltip,
    MapState,
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
    GeoAreaBounds,
} from '#types';
import { useRequest } from '#base/utils/restRequest';
import _ts from '#ts';

import { AdminLevel } from '../index';
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
const adminLevelKeySelector = (d: AdminLevel) => d.id;
const adminLevelLabelSelector = (d: AdminLevel) => d.title;

const defaultGeoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
    type: 'FeatureCollection',
    features: [],
};

interface GeoAreaBoundsResponse {
    bounds: GeoAreaBounds;
}

interface Props {
    className?: string;
    adminLevel?: AdminLevel;
    onAdminLevelChange: (value: string) => void;
    showTooltip?: boolean;
    title?: string;
    navigationDisabled?: boolean;
    adminLevels?: AdminLevel[];
    selectedGeoAreas?: string[];
    onGeoAreasSelectionChange: (value: string[]) => void;
    pending?: boolean;
}

function GeoLocationMap(props: Props) {
    const {
        className,
        showTooltip,
        adminLevel,
        onAdminLevelChange,
        title,
        navigationDisabled,
        adminLevels,
        pending,
        selectedGeoAreas,
        onGeoAreasSelectionChange,
    } = props;

    const [hoverFeatureProperties, setHoverFeatureProperties] = useState<KeyValue[]>([]);
    const [hoverLngLat, setHoverLngLat] = useState<LngLatLike>();

    const {
        pending: geoJsonPending,
        response: geoJsonResponse,
    } = useRequest<MapboxGeoJSONFeature>({
        // skip: isNotDefined(adminLevel) || !ready,
        url: adminLevel?.geojsonFile?.url ?? undefined,
        method: 'GET',
        failureHeader: _ts('geoAreas', 'title'),
    });

    const {
        pending: boundsPending,
        response: boundsResponse,
    } = useRequest<GeoAreaBoundsResponse>({
        // skip: isNotDefined(adminLevel) || !ready,
        url: adminLevel?.boundsFile?.url ?? undefined,
        method: 'GET',
        failureHeader: _ts('geoAreas', 'title'),
    });

    const lineLayerOptions: Omit<Layer, 'id'> = useMemo(() => {
        const noOfAdminLevels = adminLevels?.length;
        const thickness = (
            isDefined(noOfAdminLevels) && isDefined(adminLevel)
            && noOfAdminLevels > (adminLevel.level || 0)
        )
            ? (1 + (scaleFactor * ((noOfAdminLevels - (adminLevel.level || 0)) / noOfAdminLevels)))
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
    }, [adminLevels, adminLevel]);

    const handleAreaClick = useCallback((feature: MapboxGeoJSONFeature) => {
        const { id } = feature;
        const selection = String(id);

        const selections = [...selectedGeoAreas ?? []];

        const index = selections.indexOf(selection);
        if (index === -1) {
            selections.push(selection);
        } else {
            selections.splice(index, 1);
        }

        onGeoAreasSelectionChange(selections);
        return true;
    }, [onGeoAreasSelectionChange, selectedGeoAreas]);

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

    const attributes = useMemo(() => selectedGeoAreas?.map((selection) => ({
        id: +selection,
        value: true,
    })), [selectedGeoAreas]);

    return (
        <Container
            className={_cs(styles.container, className)}
            spacing="none"
            heading={title}
            headingSize="small"
            contentClassName={styles.content}
        >
            <SegmentInput
                className={styles.adminLevels}
                name="adminLevels"
                onChange={onAdminLevelChange}
                options={adminLevels}
                keySelector={adminLevelKeySelector}
                labelSelector={adminLevelLabelSelector}
                value={adminLevel?.id}
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
                        onClick={handleAreaClick}
                        onMouseEnter={showTooltip ? handleMouseEnter : undefined}
                        onMouseLeave={showTooltip ? handleMouseLeave : undefined}
                    />
                    <MapLayer
                        layerKey="line"
                        layerOptions={lineLayerOptions}
                    />
                    <MapState
                        attributes={attributes}
                        attributeKey="selected"
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

export default GeoLocationMap;
