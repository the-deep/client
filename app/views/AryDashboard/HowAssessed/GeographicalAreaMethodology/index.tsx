import React, { useMemo, useState, useCallback } from 'react';
import {
    _cs,
    compareNumber,
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
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
import {
    AryDashboardFilterQuery,
    AryDashboardHowAssedQuery,
    AssessmentRegistryDataCollectionTechniqueTypeEnum,
    AssessmentRegistryProximityTypeEnum,
    AssessmentRegistrySamplingApproachTypeEnum,
    AssessmentRegistryUnitOfAnalysisTypeEnum,
    AssessmentRegistryUnitOfReportingTypeEnum,
    GetMethodologyOptionsQuery,
} from '#generated/types';
import { enumKeySelector, enumLabelSelector, getMaximum } from '#utils/common';

import styles from './styles.css';

const methodologyTechniques = [
    {
        id: 'DATA_COLLECTION',
        title: 'Data collection',
    },
    {
        id: 'SAMPLING_APROACH',
        title: 'Sampling approach',
    },
    {
        id: 'UNIT_OF_ANALYSIS',
        title: 'Unit of analysis',
    },
    {
        id: 'UNIT_OF_REPORTING',
        title: 'Unit of reporting',
    },
    {
        id: 'PROXIMITY',
        title: 'proximity',
    },
];

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

interface MethodologyType {
    options?: {
        name: string;
        description?: string | null;
    }[] | null;
    value: {
        adminLevelId: number
        geoId: number;
        count: number;
        region: number;
        dataCollectionTechnique?: AssessmentRegistryDataCollectionTechniqueTypeEnum;
        samplingApproach?: AssessmentRegistrySamplingApproachTypeEnum;
        unitOfAnanlysis?: AssessmentRegistryUnitOfAnalysisTypeEnum;
        unitOfReporting?: AssessmentRegistryUnitOfReportingTypeEnum;
        proximity?: AssessmentRegistryProximityTypeEnum;
    }[]
}

interface Props {
    className?: string;
    defaultZoom?: number;
    data: NonNullable<PurgeNull<AryDashboardHowAssedQuery['project']>>['assessmentDashboardStatistics'];
    regions: NonNullable<PurgeNull<AryDashboardFilterQuery['project']>>['regions'];
    options?: GetMethodologyOptionsQuery;
    navigationDisabled?: boolean;
}

function GeographicalAreaMethodology(props: Props) {
    const {
        className,
        defaultZoom = 2,
        data,
        regions,
        options,
        navigationDisabled,
    } = props;

    const [activeAdminLevel, setActiveAdminLevel] = useState<string>();
    const [hoverFeatureProperties, setHoverFeatureProperties] = useState<KeyValue[]>([]);
    const [hoverLngLat, setHoverLngLat] = useState<LngLatLike>();
    const [regionValue, setRegionValue] = useState<string>();
    const [methodologyType, setMethodologyType] = useState<string>();
    const [collectionTechnique, setCollectionTechnique] = useState<string>();

    const methodologyData: MethodologyType = useMemo(
        () => {
            if (methodologyType === 'DATA_COLLECTION') {
                return {
                    options: options?.dataCollectionTechniqueOptions?.enumValues,
                    value: data?.assessmentByDataCollectionTechniqueAndGeolocation ?? [],
                };
            }
            if (methodologyType === 'SAMPLING_APROACH') {
                return {
                    options: options?.samplingApproach?.enumValues,
                    value: data?.assessmentBySamplingApproachAndGeolocation ?? [],
                };
            }
            if (methodologyType === 'UNIT_OF_ANALYSIS') {
                return {
                    options: options?.unitOfAnanlysis?.enumValues,
                    value: data?.assessmentByUnitOfAnalysisAndGeolocation ?? [],
                };
            }
            if (methodologyType === 'UNIT_OF_REPORTING') {
                return {
                    options: options?.unitOfReporting?.enumValues,
                    value: data?.assessmentByUnitOfReportingAndGeolocation ?? [],
                };
            }
            if (methodologyType === 'PROXIMITY') {
                return {
                    options: options?.proximity?.enumValues,
                    value: data?.assessmentByProximityAndGeolocation ?? [],
                };
            }
            return {
                options: [],
                value: [],
            };
        }, [
            data,
            options,
            methodologyType,
        ],
    );

    const selectedRegion = useMemo(
        () => regions?.find(
            (region) => region?.id === regionValue,
        ), [
            regionValue,
            regions,
        ],
    );

    const adminLevelGeojson = useMemo(
        () => selectedRegion?.adminLevels?.find(
            (admin) => admin.id === activeAdminLevel,
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
                id: admin.id,
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

    const assessmentCountAttribute = useMemo(() => {
        if (isDefined(methodologyType) && isNotDefined(collectionTechnique)) {
            return (
                methodologyData?.value?.map((selection) => ({
                    id: selection.geoId,
                    value: selection.count,
                }))
            ) ?? [];
        }

        if (methodologyType === 'DATA_COLLECTION' && isDefined(collectionTechnique)) {
            const filterValue = methodologyData?.value?.filter(
                (technique) => technique.dataCollectionTechnique === collectionTechnique,
            )?.map((selection) => ({
                id: selection.geoId,
                value: selection.count,
            }));

            return filterValue;
        }
        if (methodologyType === 'SAMPLING_APROACH' && isDefined(collectionTechnique)) {
            const filterValue = methodologyData?.value?.filter(
                (technique) => technique.samplingApproach === collectionTechnique,
            )?.map((selection) => ({
                id: selection.geoId,
                value: selection.count,
            }));
            return filterValue;
        }
        if (methodologyType === 'UNIT_OF_ANALYSIS' && isDefined(collectionTechnique)) {
            const filterValue = methodologyData?.value?.filter(
                (technique) => technique.unitOfAnanlysis === collectionTechnique,
            )?.map((selection) => ({
                id: selection.geoId,
                value: selection.count,
            }));
            return filterValue;
        }
        if (methodologyType === 'UNIT_OF_REPORTING' && isDefined(collectionTechnique)) {
            const filterValue = methodologyData?.value?.filter(
                (technique) => technique.unitOfReporting === collectionTechnique,
            )?.map((selection) => ({
                id: selection.geoId,
                value: selection.count,
            }));
            return filterValue;
        }
        return [];
    }, [
        collectionTechnique,
        methodologyType,
        methodologyData,
    ]);

    const getAssessmentCount = useCallback(
        (adminId: string | number) => assessmentCountAttribute?.find(
            (item) => item.id === adminId,
        )?.value ?? 0,
        [assessmentCountAttribute],
    );

    const assessmentMaxCount = useMemo(
        () => getMaximum(
            assessmentCountAttribute,
            (a, b) => compareNumber(a.value, b.value),
        )?.value,
        [assessmentCountAttribute],
    );

    const mapOptions: Partial<MapboxOptions> = useMemo(() => ({
        zoom: defaultZoom,
        center: [50, 10],
    }), [defaultZoom]);

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
                    0.4,
                    1,
                ],
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['number', ['feature-state', 'assessmentCount'], 0],
                    0,
                    '#f5f5f5',
                    assessmentMaxCount ?? 1,
                    '#b48ead',
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
            <div className={styles.adminSelectors}>
                <SelectInput
                    placeholder="Select Region"
                    name="region"
                    value={regionValue}
                    onChange={setRegionValue}
                    keySelector={adminLevelKeySelector}
                    labelSelector={adminLevelLabelSelector}
                    options={regions}
                    disabled={boundsPending}
                    variant="general"
                />
                {isDefined(regionValue) && (
                    <>
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
                        <SelectInput
                            placeholder="Select"
                            name="methodologyType"
                            value={methodologyType}
                            onChange={setMethodologyType}
                            keySelector={adminLevelKeySelector}
                            labelSelector={adminLevelLabelSelector}
                            options={methodologyTechniques}
                            disabled={boundsPending || isNotDefined(adminLevelGeojson)}
                            variant="general"
                        />
                        <SelectInput
                            placeholder="Select collection technique"
                            name="collectionTechnique"
                            value={collectionTechnique}
                            onChange={setCollectionTechnique}
                            keySelector={enumKeySelector}
                            labelSelector={enumLabelSelector}
                            options={methodologyData?.options}
                            disabled={boundsPending || isNotDefined(adminLevelGeojson)}
                            variant="general"
                        />
                    </>
                )}
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
                                <List
                                    data={hoverFeatureProperties}
                                    renderer={TextOutput}
                                    keySelector={keySelector}
                                    rendererParams={rendererParams}
                                />
                            </MapTooltip>
                        )}
                    </MapSource>
                )}
            </Map>
        </div>
    );
}
export default GeographicalAreaMethodology;
