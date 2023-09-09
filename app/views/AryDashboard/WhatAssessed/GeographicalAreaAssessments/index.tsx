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
    SelectInput,
    SegmentInput,
    TextOutput,
} from '@the-deep/deep-ui';

import { mapboxStyle } from '#base/configs/env';
import { useRequest } from '#base/utils/restRequest';
import { GeoAreaBounds } from '#types';
import { AryDashboardFilterQuery, AryDashboardWhatAssessedQuery } from '#generated/types';
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

const keySelector = (d: AdminLevel) => d.id;
const labelSelector = (d: AdminLevel) => d.title;

interface Props {
    className?: string;
    data: NonNullable<PurgeNull<AryDashboardWhatAssessedQuery['project']>>['assessmentDashboardStatistics'];
    regions: NonNullable<PurgeNull<AryDashboardFilterQuery['project']>>['regions'];
    selectedRegion?: string;
    onRegionChange: (newVal: string | undefined) => void;
    defaultZoom?: number;
    navigationDisabled?: boolean;
    selectedAdminLevel?: string;
    onAdminLevelChange: (newVal: string | undefined) => void;
}

function GeographicalAreaAssessments(props: Props) {
    const {
        className,
        data,
        regions,
        selectedRegion,
        onRegionChange,
        defaultZoom = 2,
        navigationDisabled,
        selectedAdminLevel,
        onAdminLevelChange,
    } = props;

    const [hoverFeatureProperties, setHoverFeatureProperties] = useState<KeyValue>();
    const [hoverLngLat, setHoverLngLat] = useState<LngLatLike>();

    const mapOptions: Partial<MapboxOptions> = useMemo(() => ({
        zoom: defaultZoom,
        center: [50, 10],
    }), [defaultZoom]);

    const selectedRegionObject = useMemo(
        () => regions?.find(
            (region) => region?.id === selectedRegion,
        ), [
            selectedRegion,
            regions,
        ],
    );

    const adminLevelGeojson = useMemo(
        () => selectedRegionObject?.adminLevels?.find(
            (admin) => admin.id === selectedAdminLevel,
        ), [selectedAdminLevel, selectedRegionObject],
    );

    // NOTE: this always select bound of country or admin level zero
    const selectedRegionBoundFile = useMemo(
        () => selectedRegionObject?.adminLevels?.[0]?.boundsFile,
        [selectedRegionObject],
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
        (adminId: string | number) => data?.assessmentGeographicAreas?.find(
            (item) => String(item.geoId) === adminId,
        )?.count ?? 0,
        [data?.assessmentGeographicAreas],
    );

    const assessmentCountAttribute = useMemo(() => (
        data?.assessmentGeographicAreas?.map(
            (selection) => ({
                id: selection.geoId,
                value: selection.count,
            }),
        ) ?? []
    ), [data?.assessmentGeographicAreas]);

    const assessmentMaxCount = useMemo(
        () => getMaximum(
            data?.assessmentGeographicAreas,
            (a, b) => compareNumber(a.count, b.count),
        )?.count, [data?.assessmentGeographicAreas],
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
                    '#f5f5f5',
                    assessmentMaxCount ?? 1,
                    '#00125b',
                ],
            },
        }), [assessmentMaxCount],
    );

    const handleMouseEnter = useCallback((feature: MapboxGeoJSONFeature, lngLat: LngLat) => {
        if (
            feature.properties
            && isTruthyString(feature.properties.title)
            && isDefined(feature.properties.pk)
        ) {
            setHoverLngLat(lngLat);
            setHoverFeatureProperties({
                key: feature.properties.title,
                value: getAssessmentCount(String(feature.properties.pk)),
            });
        } else {
            setHoverFeatureProperties(undefined);
        }
    }, [getAssessmentCount]);

    const handleMouseLeave = useCallback(() => {
        setHoverLngLat(undefined);
        setHoverFeatureProperties(undefined);
    }, []);

    return (
        <div className={_cs(className, styles.geographicalAreaAssessments)}>
            <div className={styles.regionSelectors}>
                <SelectInput
                    placeholder="Select Region"
                    name="region"
                    value={selectedRegion}
                    onChange={onRegionChange}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    options={regions}
                    disabled={boundsPending}
                    variant="general"
                    nonClearable
                />
                <SegmentInput
                    className={styles.adminLevels}
                    name="adminLevels"
                    value={selectedAdminLevel}
                    onChange={onAdminLevelChange}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    options={selectedRegionObject?.adminLevels}
                    disabled={navigationDisabled}
                    spacing="compact"
                />
            </div>
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
                {isDefined(adminLevelGeojson) && (
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
                                <TextOutput
                                    value={hoverFeatureProperties?.value}
                                    label={hoverFeatureProperties?.key}
                                />
                            </MapTooltip>
                        )}
                    </MapSource>
                )}
            </Map>
        </div>
    );
}

export default GeographicalAreaAssessments;
