import React, { useMemo, useState, useCallback, useRef } from 'react';
import { _cs, isDefined, isTruthyString } from '@togglecorp/fujs';
import Map, {
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
    SegmentInput,
    TextOutput,
} from '@the-deep/deep-ui';

import { mapboxStyle } from '#base/configs/env';
import { AryDashboardFilterQuery } from '#generated/types';
import { getTimeseriesWithoutGaps } from '#utils/temporal';
import { DEEP_START_DATE, todaysDate } from '#utils/common';
import useSizeTracking from '#hooks/useSizeTracking';
import BrushLineChart from '#views/ExploreDeepContent/BrushLineChart';
import EntityCreationLineChart from '#views/ExploreDeepContent/EntityCreationLineChart';

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
const adminLevels = [
    {
        id: '1',
        title: 'Country',
    },
    {
        id: '2',
        title: 'Province',
    },
];

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
    data?: AryDashboardFilterQuery;
    startDate: number;
    endDate: number;
    onStartDateChange: ((newDate: number | undefined) => void) | undefined;
    onEndDateChange: ((newDate: number | undefined) => void) | undefined;
    readOnly?: boolean;
    navigationDisabled?: boolean;
}

function GeographicalAreaAssessments(props: Props) {
    const {
        className,
        defaultZoom = 2,
        data,
        startDate,
        endDate,
        onStartDateChange,
        onEndDateChange,
        navigationDisabled,
        readOnly,
    } = props;

    const [activeAdminLevel, setActiveAdminLevel] = useState<string>('1');
    const [hoverFeatureProperties, setHoverFeatureProperties] = useState<KeyValue[]>([]);
    const [hoverLngLat, setHoverLngLat] = useState<LngLatLike>();
    const barContainerRef = useRef<HTMLDivElement>(null);
    const {
        width,
    } = useSizeTracking(barContainerRef) ?? {};

    const mapOptions: Partial<MapboxOptions> = useMemo(() => ({
        zoom: defaultZoom,
        center: [50, 10],
    }), [defaultZoom]);

    const adminLevelGeojson = useMemo(
        () => data?.project?.regions?.map(
            (region) => region.adminLevels?.find(
                (adminLevel) => adminLevel.id === activeAdminLevel,
            ),
        ), [activeAdminLevel, data?.project?.regions],
    );

    const lineLayerOptions: Omit<Layer, 'id'> = useMemo(() => {
        const noOfAdminLevels = adminLevelGeojson?.length;
        const selectedAdminLevel = adminLevelGeojson?.find(
            (item) => item?.id === activeAdminLevel,
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
    }, [activeAdminLevel, adminLevelGeojson]);

    const attributes = useMemo(() => (
        data?.project?.assessmentDashboardStatistics?.assessmentGeographicAreas?.map(
            (selection) => ({
                id: selection?.geoId,
                value: true,
            }),
        ) ?? []
    ), [data?.project?.assessmentDashboardStatistics?.assessmentGeographicAreas]);

    const selectedAdminLevelTitle = useMemo(() => (
        adminLevels?.find(
            (item) => item.id === activeAdminLevel,
        )?.title
    ), [activeAdminLevel]);

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

    const handleDateRangeChange = useCallback(
        (foo: number | undefined, bar: number | undefined) => {
            if (onStartDateChange) {
                onStartDateChange(foo);
            }
            if (onEndDateChange) {
                onEndDateChange(bar);
            }
        },
        [onStartDateChange, onEndDateChange],
    );

    const timeseriesWithoutGaps = useMemo(
        () => getTimeseriesWithoutGaps(
            data?.project?.assessmentDashboardStatistics?.assessmentByOverTime ?? undefined,
            'month',
            DEEP_START_DATE,
            todaysDate,
        ),
        [data?.project?.assessmentDashboardStatistics?.assessmentByOverTime],
    );

    return (
        <div className={_cs(className)}>
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
                {/* {bounds && (
                    <MapBounds
                        bounds={bounds}
                        padding={10}
                        duration={100}
                    />
                )} */}
                <MapSource
                    sourceKey="regions"
                    sourceOptions={sourceOptions}
                    geoJson={adminLevelGeojson?.[0]?.geojsonFile?.url ?? ''}
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
            <div ref={barContainerRef}>
                <BrushLineChart
                    width={width ?? 0}
                    height={160}
                    data={timeseriesWithoutGaps}
                    endDate={endDate}
                    startDate={startDate}
                    onChange={handleDateRangeChange}
                    readOnly={readOnly}
                />
            </div>
            <EntityCreationLineChart
                className={styles.lineChart}
                heading="Number of Assessment Over Time"
                // eslint-disable-next-line max-len
                timeseries={data?.project?.assessmentDashboardStatistics?.assessmentByOverTime ?? undefined}
                startDate={startDate}
                endDate={endDate}
            />
        </div>
    );
}

export default GeographicalAreaAssessments;
