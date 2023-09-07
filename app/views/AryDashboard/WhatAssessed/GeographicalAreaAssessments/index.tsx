import React, { useMemo, useState, useCallback } from 'react';
import { _cs, compareNumber, isDefined, isNotDefined, isTruthyString } from '@togglecorp/fujs';
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
import { getMaximum } from '#utils/common';

import styles from './styles.css';

const scaleFactor = 1;
const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
    promoteId: 'pk', // NOTE mapbox requires each feature property to have a unique identifier. Right now the server adds pk to each property so we are using it.
};

const tooltipOptions: PopupOptions = {
    closeOnClick: false,
    closeButton: false,
    offset: 12,
};

interface GeoAreaBoundsResponse {
    bounds: GeoAreaBounds;
}
interface KeyValue {
    key: string;
    value: number;
}

type AdminLevel = {
    id: string;
    title: string;
};

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
            (admin) => admin.level === Number(activeAdminLevel),
        ), [activeAdminLevel, selectedRegion],
    );

    // NOTE: this always select bound of country or admin level zero
    const selectedRegionBoundFile = useMemo(
        () => selectedRegion?.adminLevels?.[0]?.boundsFile,
        [selectedRegion],
    );

    const adminLevels = useMemo(
        () => selectedRegion?.adminLevels?.map(
            (admin) => ({
                id: String(admin.level),
                title: admin.title,
            }),
        ), [selectedRegion],
    );

    const {
        pending: boundsPending,
        response: boundsResponse,
    } = useRequest<GeoAreaBoundsResponse>({
        url: selectedRegionBoundFile?.url ?? undefined,
        method: 'GET',
        skip: isNotDefined(selectedRegionBoundFile?.url),
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

    const getAssessmentCount = useCallback(
        (
            adminId: string | number,
        ) => data?.assessmentDashboardStatistics?.assessmentGeographicAreas?.find(
            (item) => item.geoId === Number(adminId),
        )?.count ?? 0,
        [data?.assessmentDashboardStatistics?.assessmentGeographicAreas],
    );

    const assessmentCountAttribute = useMemo(() => (
        data?.assessmentDashboardStatistics?.assessmentGeographicAreas?.map(
            (selection) => ({
                id: selection.geoId,
                value: selection.count,
            }),
        ) ?? []
    ), [data?.assessmentDashboardStatistics?.assessmentGeographicAreas]);

    const assessmentMaxCount = useMemo(
        () => getMaximum(
            data?.assessmentDashboardStatistics?.assessmentGeographicAreas,
            (a, b) => compareNumber(a.count, b.count),
        )?.count, [data?.assessmentDashboardStatistics?.assessmentGeographicAreas],
    );

    const lineLayerOptions: Omit<Layer, 'id'> = useMemo(
        () => ({
            type: 'line',
            paint: {
                'line-color': '#1a3ed0',
                'line-width': [
                    'case',
                    ['boolean', ['feature-state', 'hovered'], false],
                    scaleFactor + 2,
                    scaleFactor,
                ],
            },
        }), [],
    );

    const fillLayerOptions = useMemo<Omit<Layer, 'id'>>(
        () => ({
            type: 'fill',
            paint: {
                'fill-opacity': ['case',
                    ['boolean', ['feature-state', 'hovered'], false],
                    0.2,
                    0.8,
                ],
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['number', ['feature-state', 'assessmentCount'], 0],
                    0,
                    '#ffffff',
                    assessmentMaxCount,
                    '#00125b',
                ],
            },
        }), [assessmentMaxCount],
    );

    const handleMouseEnter = useCallback((feature: MapboxGeoJSONFeature, lngLat: LngLat) => {
        if (
            feature.properties
        && isTruthyString(feature.properties.title)
        && isDefined(feature.id)
        ) {
            setHoverLngLat(lngLat);
            setHoverFeatureProperties([{
                key: feature.properties.title,
                value: getAssessmentCount(feature.id),
            }]);
        } else {
            setHoverFeatureProperties([]);
        }
    }, [getAssessmentCount]);

    const handleMouseLeave = useCallback(() => {
        setHoverLngLat(undefined);
        setHoverFeatureProperties([]);
    }, []);

    const rendererParams = useCallback((_: string, tooltipData: KeyValue) => ({
        label: tooltipData.key,
        value: tooltipData.value,
    }), []);

    return (
        <div className={_cs(className, styles.geographicalAreaAssessments)}>
            <div className={styles.regionSelectors}>
                <SelectInput
                    placeholder="Select Region"
                    name="region"
                    value={regionValue}
                    onChange={setRegionValue}
                    keySelector={adminLevelKeySelector}
                    labelSelector={adminLevelLabelSelector}
                    options={data?.regions}
                    disabled={boundsPending}
                    variant="general"
                />
                <SegmentInput
                    className={styles.adminLevels}
                    name="adminLevels"
                    value={activeAdminLevel}
                    onChange={setActiveAdminLevel}
                    keySelector={adminLevelKeySelector}
                    labelSelector={adminLevelLabelSelector}
                    options={adminLevels}
                    disabled={navigationDisabled}
                    spacing="compact"
                />
            </div>
            {isDefined(adminLevelGeojson) && (
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
                        geoJson={adminLevelGeojson?.geojsonFile?.url}
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
                            attributes={assessmentCountAttribute}
                            attributeKey="assessmentCount"
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
            )}
        </div>
    );
}

export default GeographicalAreaAssessments;
