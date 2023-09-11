import React, { useCallback, useMemo, useState } from 'react';
import { PurgeNull } from '@togglecorp/toggle-form';
import {
    SegmentInput,
    SelectInput,
    TextOutput,
} from '@the-deep/deep-ui';
import {
    _cs,
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
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

import { AryDashboardQualityAssessmentQuery, ProjectMetadataForAryQuery } from '#generated/types';
import { GeoAreaBounds } from '#types';
import { mapboxStyle } from '#base/configs/env';
import { useRequest } from '#base/utils/restRequest';

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

const VERY_POOR_COLOR = '#ff7d7d';
const POOR_COLOR = '#ffc2c2';
const FAIR_COLOR = '#fbfbbd';
const GOOD_COLOR = '#78c7a2';
const VERY_GOOD_COLOR = '#a5d9c1';

const VERY_POOR = 2;
const POOR = 4;
const FAIR = 6;
const GOOD = 8;

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
    defaultZoom?: number;
    data: NonNullable<PurgeNull<AryDashboardQualityAssessmentQuery['project']>>['assessmentDashboardStatistics'];
    regions: NonNullable<PurgeNull<ProjectMetadataForAryQuery['project']>>['regions'];
    selectedRegion?: string;
    onRegionChange: (newVal: string | undefined) => void;
    selectedAdminLevel?: string;
    onAdminLevelChange: (newVal: string | undefined) => void;
    navigationDisabled?: boolean;
}
function GeographicalAreaQualityScore(props: Props) {
    const {
        className,
        data,
        regions,
        selectedRegion,
        onRegionChange,
        navigationDisabled,
        selectedAdminLevel,
        onAdminLevelChange,
        defaultZoom = 2,
    } = props;

    const [hoverFeatureProperties, setHoverFeatureProperties] = useState<KeyValue>();
    const [hoverLngLat, setHoverLngLat] = useState<LngLatLike>();

    const mapOptions: Partial<MapboxOptions> = useMemo(() => ({
        zoom: defaultZoom,
        scrollZoom: false,
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
        ), [
            selectedAdminLevel,
            selectedRegionObject,
        ],
    );

    // NOTE: this always select bound of finalScorery or admin level zero
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

    const assessmentCountAttribute = useMemo(() => (
        data?.medianQualityScoreByGeoArea?.map(
            (selection) => ({
                id: selection.geoArea,
                value: selection.finalScore,
            }),
        ) ?? []
    ), [data?.medianQualityScoreByGeoArea]);

    const getAssessmentCount = useCallback(
        (adminId: string | number) => assessmentCountAttribute?.find(
            (item) => String(item.id) === adminId,
        )?.value ?? 0,
        [assessmentCountAttribute],
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
                    'step',
                    ['number', ['feature-state', 'assessmentCount'], 0],
                    '#f5f5f5',
                    0.00000001,
                    VERY_POOR_COLOR,
                    VERY_POOR,
                    POOR_COLOR,
                    POOR,
                    FAIR_COLOR,
                    FAIR,
                    GOOD_COLOR,
                    GOOD,
                    VERY_GOOD_COLOR,
                ],
            },
        }), [],
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
            <div className={styles.adminSelectors}>
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
                    disabled={navigationDisabled || boundsPending}
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

export default GeographicalAreaQualityScore;
