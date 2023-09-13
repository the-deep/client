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
    SelectInput,
    SegmentInput,
    TextOutput,
} from '@the-deep/deep-ui';

import { mapboxStyle } from '#base/configs/env';
import { useRequest } from '#base/utils/restRequest';
import { GeoAreaBounds } from '#types';
import {
    AryDashboardHowAssessedQuery,
    ProjectMetadataForAryQuery,
    AssessmentRegistryDataCollectionTechniqueTypeEnum,
    AssessmentRegistryProximityTypeEnum,
    AssessmentRegistrySamplingApproachTypeEnum,
    AssessmentRegistryUnitOfAnalysisTypeEnum,
    AssessmentRegistryUnitOfReportingTypeEnum,
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

const keySelector = (d: AdminLevel) => d.id;
const labelSelector = (d: AdminLevel) => d.title;

interface MethodologyType {
    options?: {
        name: string;
        description?: string | null;
    }[] | null;
    value: {
        adminLevelId: number
        geoArea: number;
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
    data: NonNullable<PurgeNull<AryDashboardHowAssessedQuery['project']>>['assessmentDashboardStatistics'];
    regions: NonNullable<PurgeNull<ProjectMetadataForAryQuery['project']>>['regions'];
    options?: ProjectMetadataForAryQuery;
    selectedRegion?: string;
    onRegionChange: (newVal: string | undefined) => void;
    selectedAdminLevel?: string;
    onAdminLevelChange: (newVal: string | undefined) => void;
    navigationDisabled?: boolean;
}

function GeographicalAreaMethodology(props: Props) {
    const {
        className,
        data,
        regions,
        options,
        selectedRegion,
        onRegionChange,
        navigationDisabled,
        selectedAdminLevel,
        onAdminLevelChange,
        defaultZoom = 2,
    } = props;

    const [hoverFeatureProperties, setHoverFeatureProperties] = useState<KeyValue>();
    const [hoverLngLat, setHoverLngLat] = useState<LngLatLike>();
    const [category, setCategory] = useState<string>('DATA_COLLECTION');
    const [subCategory, setSubCategory] = useState<string>('SECONDARY_DATA_REVIEW');

    const methodologyDataMap: Record<string, MethodologyType> = useMemo(
        () => ({
            DATA_COLLECTION: {
                options: options?.dataCollectionTechniqueOptions?.enumValues,
                value: data?.assessmentByDataCollectionTechniqueAndGeolocation ?? [],
            },
            SAMPLING_APROACH: {
                options: options?.samplingApproach?.enumValues,
                value: data?.assessmentBySamplingApproachAndGeolocation ?? [],
            },
            UNIT_OF_ANALYSIS: {
                options: options?.unitOfAnanlysis?.enumValues,
                value: data?.assessmentByUnitOfAnalysisAndGeolocation ?? [],
            },
            UNIT_OF_REPORTING: {
                options: options?.unitOfReporting?.enumValues,
                value: data?.assessmentByUnitOfReportingAndGeolocation ?? [],
            },
            PROXIMITY: {
                options: options?.proximity?.enumValues,
                value: data?.assessmentByProximityAndGeolocation ?? [],
            },
        }), [
            data,
            options,
        ],
    );

    const handleCategoryChange = useCallback((newCategory: string) => {
        setCategory(newCategory);
        const firstSubCategory = methodologyDataMap[newCategory].options?.[0].name;
        if (firstSubCategory) {
            setSubCategory(firstSubCategory);
        }
    }, [
        methodologyDataMap,
    ]);

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

    const assessmentCountAttribute = useMemo(() => {
        if (category === 'DATA_COLLECTION' && isDefined(subCategory)) {
            const attributeValue = methodologyDataMap[category].value?.filter(
                (technique) => technique.dataCollectionTechnique === subCategory,
            )?.map((selection) => ({
                id: selection.geoArea,
                value: selection.count,
            }));

            return attributeValue;
        }
        if (category === 'SAMPLING_APROACH' && isDefined(subCategory)) {
            const attributeValue = methodologyDataMap[category].value?.filter(
                (technique) => technique.samplingApproach === subCategory,
            )?.map((selection) => ({
                id: selection.geoArea,
                value: selection.count,
            }));
            return attributeValue;
        }
        if (category === 'UNIT_OF_ANALYSIS' && isDefined(subCategory)) {
            const attributeValue = methodologyDataMap[category].value?.filter(
                (technique) => technique.unitOfAnanlysis === subCategory,
            )?.map((selection) => ({
                id: selection.geoArea,
                value: selection.count,
            }));
            return attributeValue;
        }
        if (category === 'UNIT_OF_REPORTING' && isDefined(subCategory)) {
            const attributeValue = methodologyDataMap[category].value?.filter(
                (technique) => technique.unitOfReporting === subCategory,
            )?.map((selection) => ({
                id: selection.geoArea,
                value: selection.count,
            }));
            return attributeValue;
        }
        return [];
    }, [
        subCategory,
        category,
        methodologyDataMap,
    ]);

    const getAssessmentCount = useCallback(
        (adminId: string) => assessmentCountAttribute?.find(
            (item) => String(item.id) === adminId,
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
        scrollZoom: false,
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
                {isDefined(selectedRegion) && (
                    <>
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
                        <SelectInput
                            placeholder="Select"
                            name="methodologyType"
                            value={category}
                            onChange={handleCategoryChange}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            options={methodologyTechniques}
                            disabled={boundsPending || isNotDefined(adminLevelGeojson)}
                            variant="general"
                            nonClearable
                        />
                        {category && (
                            <SelectInput
                                placeholder="Select sub category"
                                name="collectionTechnique"
                                value={subCategory}
                                onChange={setSubCategory}
                                keySelector={enumKeySelector}
                                labelSelector={enumLabelSelector}
                                options={methodologyDataMap[category].options}
                                disabled={boundsPending || isNotDefined(adminLevelGeojson)}
                                variant="general"
                                nonClearable
                            />
                        )}
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
export default GeographicalAreaMethodology;
