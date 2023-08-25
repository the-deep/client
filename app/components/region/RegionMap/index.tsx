import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { _cs, isDefined, isNotDefined, unique, isTruthyString } from '@togglecorp/fujs';
import Map, {
    MapBounds,
    MapContainer,
    MapSource,
    MapLayer,
    MapTooltip,
    MapState,
} from '@togglecorp/re-map';
import { useQuery, gql } from '@apollo/client';
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
import { GeoArea } from '#components/GeoMultiSelectInput';
import { mapboxStyle } from '#base/configs/env';
import {
    SelectedRegionQuery,
    SelectedRegionQueryVariables,
} from '#generated/types';

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

const SELECTED_REGION = gql`
    query SelectedRegion($regionId: ID!) {
        region(id: $regionId) {
            title
            id
            adminLevels {
                id
                level
                title
                geojsonFile {
                    name
                    url
                }
                boundsFile {
                    name
                    url
                }
            }
        }
    }
`;

interface KeyValue {
    key: string;
    value: string;
}
type AdminLevel = NonNullable<NonNullable<SelectedRegionQuery['region']>['adminLevels']>[number];

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
    regionId?: string;
    adminLevel: string | undefined;
    onAdminLevelChange: (value: string | undefined) => void | undefined;
    showTooltip?: boolean;
    title?: string;
    navigationDisabled?: boolean;
    selectedGeoAreas?: string[] | null ;
    onSelectedGeoAreasChange?: (value: string[]) => void;
    geoAreaOptions: GeoArea[] | null | undefined;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | null | undefined>>
    | undefined;
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
        selectedGeoAreas,
        onSelectedGeoAreasChange,
        geoAreaOptions,
        onGeoAreaOptionsChange,
    } = props;

    const [hoverFeatureProperties, setHoverFeatureProperties] = useState<KeyValue[]>([]);
    const [hoverLngLat, setHoverLngLat] = useState<LngLatLike>();

    const variables = useMemo(() => (regionId ? ({
        regionId,
    }) : undefined
    ), [regionId]);

    const {
        data: selectedRegion,
        loading: selectedRegionPending,
        refetch: adminLevelRetrigger,
        startPolling,
        stopPolling,
    } = useQuery<SelectedRegionQuery, SelectedRegionQueryVariables>(
        SELECTED_REGION,
        {
            skip: !regionId,
            variables,
        },
    );

    useEffect(
        () => {
            const adminLevels = selectedRegion?.region?.adminLevels;
            if (adminLevels?.some(
                (v) => (isNotDefined(v.boundsFile) || isNotDefined(v.geojsonFile)),
            )) {
                startPolling(5000);
            } else {
                stopPolling();
            }
            return stopPolling;
        },
        [selectedRegion, startPolling, stopPolling],
    );

    useEffect(
        () => {
            adminLevelRetrigger();
        },
        [triggerId, adminLevelRetrigger],
    );

    const adminLevels = selectedRegion?.region?.adminLevels;

    const activeAdminLevel = adminLevel ? adminLevels?.find(
        (item) => item.id.toString() === adminLevel,
    ) : undefined;

    const {
        pending: geoJsonPending,
        response: geoJsonResponse,
    } = useRequest<MapboxGeoJSONFeature>({
        url: activeAdminLevel?.geojsonFile?.url ?? undefined,
        method: 'GET',
    });

    const {
        pending: boundsPending,
        response: boundsResponse,
    } = useRequest<GeoAreaBoundsResponse>({
        url: activeAdminLevel?.boundsFile?.url ?? undefined,
        method: 'GET',
    });

    const selectedAdminLevelTitle = useMemo(() => (
        adminLevels?.find(
            (item) => item.id.toString() === adminLevel,
        )?.title
    ), [adminLevels, adminLevel]);

    const lineLayerOptions: Omit<Layer, 'id'> = useMemo(() => {
        const noOfAdminLevels = adminLevels?.length;
        const selectedAdminLevel = adminLevels?.find(
            (item) => item.id.toString() === adminLevel,
        );
        const thickness = (
            isDefined(noOfAdminLevels) && isDefined(selectedAdminLevel)
            && noOfAdminLevels > (selectedAdminLevel?.level ?? 0)
        )
            // eslint-disable-next-line max-len
            ? (1 + (scaleFactor * ((noOfAdminLevels - (selectedAdminLevel?.level ?? 0)) / noOfAdminLevels)))
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
        if (!onSelectedGeoAreasChange) {
            return false;
        }
        const selections = [...selectedGeoAreas ?? []];

        const {
            id,
            properties,
        } = feature;

        const selection = String(id);

        const index = selections.indexOf(selection);
        if (index === -1 && onGeoAreaOptionsChange) {
            selections.push(selection);

            const hasCachedData = (properties?.cached_data ?? '').length > 0;
            const parentTitles = hasCachedData
                ? (JSON.parse(properties?.cached_data)?.parent_titles ?? [])
                : [];

            const selectedGeoArea = {
                id: selection,
                title: properties?.title as (string | undefined | null) ?? '',
                regionTitle: selectedRegion?.region?.title ?? '',
                adminLevelTitle: selectedAdminLevelTitle ?? '',
                parentTitles,
            };
            const newOptions = unique([...(geoAreaOptions ?? []), selectedGeoArea], (d) => d.id);
            onGeoAreaOptionsChange(newOptions);
        } else {
            selections.splice(index, 1);
        }

        onSelectedGeoAreasChange(selections);
        return true;
    }, [
        onSelectedGeoAreasChange,
        selectedGeoAreas,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        selectedAdminLevelTitle,
        selectedRegion,
    ]);

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

    const attributes = useMemo(() => (
        selectedGeoAreas?.map((selection) => ({
            id: +selection,
            value: true,
        })) ?? []
    ), [selectedGeoAreas]);

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
                options={adminLevels ?? undefined}
                keySelector={adminLevelKeySelector}
                labelSelector={adminLevelLabelSelector}
                value={adminLevel ?? undefined}
                disabled={navigationDisabled}
            />
            {(selectedRegionPending || geoJsonPending || boundsPending) && (
                <Spinner className={styles.spinner} />
            )}
            <Map
                mapStyle={mapboxStyle}
                mapOptions={mapOptions}
                scaleControlShown={false}
                navControlShown={false}
            >
                <MapContainer className={styles.geoJsonMap} />
                {bounds && (
                    <MapBounds
                        bounds={bounds}
                        padding={10}
                        duration={100}
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
        </Container>
    );
}

export default RegionMap;
