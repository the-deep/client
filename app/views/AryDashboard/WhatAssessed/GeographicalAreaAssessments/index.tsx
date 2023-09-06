import React, { useMemo, useState, useCallback } from 'react';
import { _cs, isTruthyString } from '@togglecorp/fujs';
import { PurgeNull } from '@togglecorp/toggle-form';
import Map, {
    MapBounds,
    MapContainer,
    MapLayer,
    MapSource,
    MapState,
    MapTooltip,
} from '@togglecorp/re-map';
import {
    Layer,
    LngLat,
    LngLatLike,
    MapboxGeoJSONFeature,
    MapboxOptions,
    PopupOptions,
} from 'mapbox-gl';
import {
    List,
    SelectInput,
    SegmentInput,
    TextOutput,
} from '@the-deep/deep-ui';

import { mapboxStyle } from '#base/configs/env';
import { useRequest } from '#base/utils/restRequest';
import { GeoAreaBounds } from '#types';
import { AryDashboardFilterQuery } from '#generated/types';

import styles from './styles.css';

const scaleFactor = 1;
const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
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

const tooltipOptions: PopupOptions = {
    closeOnClick: false,
    closeButton: false,
    offset: 12,
};

// NOTE add static to show options for only admin level
// need to discuss how many level to show
const adminLevels = [
    {
        id: '0',
        title: 'Country',
    },
    {
        id: '1',
        title: 'Province',
    },
    {
        id: '2',
        title: 'District',
    },
];

interface GeoAreaBoundsResponse {
    bounds: GeoAreaBounds;
}
interface KeyValue {
    key: string;
    value: string;
}

type AdminLevel = NonNullable<typeof adminLevels>[number];

const keySelector = (d: KeyValue) => d.key;
const adminLevelKeySelector = (d: AdminLevel) => d.id;
const adminLevelLabelSelector = (d: AdminLevel) => d.title;

interface Props {
    className?: string;
    defaultZoom?: number;
    data: NonNullable<PurgeNull<AryDashboardFilterQuery['project']>>;
    navigationDisabled?: boolean;
}

function GeographicalAreaAssessments(props: Props) {
    const {
        className,
        defaultZoom = 2,
        data,
        navigationDisabled,
    } = props;

    const [activeAdminLevel, setActiveAdminLevel] = useState<string>('0');
    const [hoverFeatureProperties, setHoverFeatureProperties] = useState<KeyValue[]>([]);
    const [hoverLngLat, setHoverLngLat] = useState<LngLatLike>();
    const [regionValue, setRegionValue] = useState<
        string
    >();

    const mapOptions: Partial<MapboxOptions> = useMemo(() => ({
        zoom: defaultZoom,
        center: [50, 10],
    }), [defaultZoom]);

    const selectedRegion = useMemo(
        () => data?.regions?.find(
            (region) => region?.id === regionValue,
        ), [
            regionValue,
            data?.regions,
        ],
    );

    const adminLevelGeojson = useMemo(
        () => selectedRegion?.adminLevels?.find(
            (admin) => String(admin.level) === activeAdminLevel,
        ), [activeAdminLevel, selectedRegion],
    );

    // NOTE: this always select bound of country or admin level zero
    const selectedRegionBoundFile = useMemo(
        () => selectedRegion?.adminLevels?.[0]?.boundsFile,
        [selectedRegion],
    );

    const {
        pending: boundsPending,
        response: boundsResponse,
    } = useRequest<GeoAreaBoundsResponse>({
        url: selectedRegionBoundFile?.url ?? undefined,
        method: 'GET',
    });

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

        return [minX, minY, maxX, maxY];
    }, [boundsResponse]);

    const selectedAdminLevelTitle = useMemo(() => (
        adminLevels?.find(
            (item) => item.id === activeAdminLevel,
        )?.title
    ), [activeAdminLevel]);

    const attributes = useMemo(() => (
        data?.assessmentDashboardStatistics?.assessmentGeographicAreas?.map(
            (selection) => ({
                id: selection.geoId,
                value: true,
            }),
        ) ?? []
    ), [data?.assessmentDashboardStatistics?.assessmentGeographicAreas]);

    const lineLayerOptions: Omit<Layer, 'id'> = useMemo(
        () => ({
            type: 'line',
            paint: {
                'line-color': '#1a3ed0',
                'line-width': ['case',
                    ['boolean', ['feature-state', 'hovered'], false],
                    scaleFactor + 2,
                    scaleFactor,
                ],
            },
        }), [],
    );

    const handleMouseEnter = useCallback((feature: MapboxGeoJSONFeature, lngLat: LngLat) => {
        if (feature.properties && isTruthyString(feature.properties.title)) {
            setHoverLngLat(lngLat);
            setHoverFeatureProperties([{
                key: selectedAdminLevelTitle ?? 'Title',
                value: feature.properties.title,
            }]);
        } else {
            setHoverFeatureProperties([]);
        }
    }, [
        selectedAdminLevelTitle,
    ]);

    const handleMouseLeave = useCallback(() => {
        setHoverLngLat(undefined);
        setHoverFeatureProperties([]);
    }, []);

    const rendererParams = useCallback((_: string, tooltipData: KeyValue) => ({
        label: tooltipData.key,
        value: tooltipData.value,
    }), []);

    return (
        <div className={_cs(className)}>
            <SelectInput
                placeholder="Select Region"
                name="region"
                value={regionValue}
                onChange={setRegionValue}
                keySelector={adminLevelKeySelector}
                labelSelector={adminLevelLabelSelector}
                options={data?.regions}
                disabled={boundsPending}
            />
            <SegmentInput
                className={styles.adminLevels}
                name="adminLevels"
                value={activeAdminLevel}
                onChange={setActiveAdminLevel}
                keySelector={adminLevelKeySelector}
                labelSelector={adminLevelLabelSelector}
                options={adminLevels ?? undefined}
                disabled={navigationDisabled}
            />
            <Map
                mapStyle={mapboxStyle}
                mapOptions={mapOptions}
                scaleControlShown={false}
                navControlShown={false}
            >
                <MapContainer
                    className={_cs(className, styles.map)}
                />
                {bounds && (
                    <MapBounds
                        bounds={bounds}
                        padding={10}
                        duration={100}
                    />
                )}
                <MapSource
                    sourceKey="regions"
                    sourceOptions={sourceOptions}
                    geoJson={adminLevelGeojson?.geojsonFile?.url ?? ''}
                >
                    <MapLayer
                        layerKey="fill"
                        layerOptions={fillLayerOptions}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                    <MapLayer
                        layerKey="line"
                        layerOptions={lineLayerOptions}
                    />
                    <MapState
                        attributes={attributes}
                        attributeKey="selected"
                    />
                    {hoverLngLat && (
                        <MapTooltip
                            coordinates={hoverLngLat}
                            tooltipOptions={tooltipOptions}
                            trackPointer
                            hidden={false}
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
        </div>
    );
}

export default GeographicalAreaAssessments;