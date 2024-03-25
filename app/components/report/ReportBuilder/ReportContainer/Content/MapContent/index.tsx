import React, { useMemo } from 'react';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import { PendingAnimation } from '@the-deep/deep-ui';
import {
    Map,
    type MapProps,
    type Symbols,
} from '@the-deep/reporting-module-components';
import {
    type Point,
    type Geometry,
    type FeatureCollection,
    type GeoJsonProperties,
} from 'geojson';

import ErrorBoundary from '#base/components/ErrorBoundary';
import { ReportGeoUploadType } from '#components/report/ReportBuilder/GeoDataSelectInput';

import {
    mapboxStyle,
    mapboxToken,
} from '#base/configs/env';

import {
    type MapConfigType,
    type ContentDataType,
} from '../../../../schema';
import { type D3InterpolationSchemes } from '../../MapEdit/MapLayerEdit/ColorSchemeInput';
import {
    resolveTextStyle,
} from '../../../../utils';

type GeoJson = FeatureCollection<Geometry, GeoJsonProperties>;
type PointGeoJson = FeatureCollection<Point, GeoJsonProperties>;

const scaleTypeMap = {
    FIXED: 'fixed' as const,
    PROPORTIONAL: 'proportional' as const,
};

interface Props {
    className?: string;
    configuration?: MapConfigType;
    contentData: ContentDataType[] | undefined;
    downloadedGeoData: Record<string, unknown>;
    geoDataUploads: ReportGeoUploadType[] | undefined | null;
    downloadsPending: boolean;
}

function MapContent(props: Props) {
    const {
        className,
        configuration,
        contentData,
        downloadedGeoData,
        downloadsPending,
        geoDataUploads,
    } = props;

    const metadataMap = useMemo(() => (
        listToMap(
            geoDataUploads ?? [],
            (item) => item.id,
            (item) => item.metadata,
        )
    ), [geoDataUploads]);

    const usedFiles = listToMap(
        contentData,
        (item) => item.clientReferenceId ?? '',
        (item) => item.upload,
    );

    const finalConfig = useMemo((): MapProps | undefined => {
        if (downloadsPending) {
            return undefined;
        }
        const layers = configuration?.layers?.map((item, index): MapProps['layers'][number] | undefined => {
            if (item.type === 'SYMBOL_LAYER') {
                const layerConfig = item?.layerConfig?.symbolLayer;
                const referenceId = layerConfig?.contentReferenceId;
                if (!referenceId) {
                    return undefined;
                }
                const uploadId = usedFiles?.[referenceId];
                if (!uploadId) {
                    return undefined;
                }
                if (!downloadedGeoData[uploadId]) {
                    return undefined;
                }
                const variables = metadataMap[uploadId]?.geojson?.variables;
                const columnLabel = listToMap(
                    variables,
                    (variableItem) => variableItem.clientId ?? '',
                    (variableItem) => variableItem.name,
                );

                const resolvedLabelStyle = resolveTextStyle(
                    layerConfig?.style?.label,
                    {
                        size: 12,
                        color: '#000000',
                        family: 'Roboto Mono',
                    },
                );
                return ({
                    id: String(index + 1),
                    type: 'symbol',
                    visible: !!item.visible,
                    options: {
                        opacity: item.opacity,
                        zIndex: item.order ?? index + 1,
                        data: downloadedGeoData[uploadId] as GeoJson,
                        labelPropertyKey: layerConfig.labelPropertyKey
                            ? (columnLabel?.[layerConfig.labelPropertyKey] ?? undefined)
                            : undefined,
                        showLabels: !!layerConfig?.showLabels,
                        scale: layerConfig?.scale,
                        // TODO: Implement this
                        scaleDataMax: undefined,
                        scaleType: layerConfig?.scaleType
                            ? scaleTypeMap[layerConfig.scaleType] : undefined,
                        symbol: (layerConfig?.symbol ?? 'circle') as Symbols,
                        labelStyle: {
                            showHalo: true,
                            color: resolvedLabelStyle?.color ?? '#000000',
                            fontSize: resolvedLabelStyle?.fontSize ?? 14,
                            fontFamily: resolvedLabelStyle?.fontFamily,
                            // textAlign: resolvedLabelStyle?.textAlign,
                        },
                        // FIXME: Create symbol style
                        symbolStyle: {
                            strokeWidth: 1.4,
                            stroke: '#000',
                            fill: '#FFF',
                        },
                    },
                });
            }
            if (item.type === 'HEAT_MAP_LAYER') {
                const layerConfig = item?.layerConfig?.heatmapLayer;
                const referenceId = layerConfig?.contentReferenceId;
                if (!referenceId) {
                    return undefined;
                }
                const uploadId = usedFiles?.[referenceId];
                if (!uploadId) {
                    return undefined;
                }
                if (!downloadedGeoData[uploadId]) {
                    return undefined;
                }
                const variables = metadataMap[uploadId]?.geojson?.variables;
                const columnLabel = listToMap(
                    variables,
                    (variableItem) => variableItem.clientId ?? '',
                    (variableItem) => variableItem.name,
                );
                return ({
                    id: String(index + 1),
                    type: 'heatmap',
                    visible: !!item.visible,
                    options: {
                        opacity: item.opacity,
                        zIndex: item.order ?? index + 1,
                        data: downloadedGeoData[uploadId] as PointGeoJson,
                        blur: layerConfig?.blur,
                        scaleDataMax: layerConfig?.scaleDataMax,
                        fillPalette: (layerConfig?.fillPalette ?? 'Oranges') as D3InterpolationSchemes,
                        radius: layerConfig?.radius,
                        weighted: !!layerConfig?.weighted,
                        weightPropertyKey: layerConfig.weightPropertyKey
                            ? (columnLabel?.[layerConfig.weightPropertyKey] ?? undefined)
                            : undefined,
                    },
                });
            }
            if (item.type === 'OSM_LAYER') {
                return ({
                    id: String(index + 1),
                    type: 'osm',
                    visible: !!item.visible,
                    options: {
                        opacity: item.opacity,
                        zIndex: item.order ?? (index + 1),
                    },
                });
            }
            if (item.type === 'MAPBOX_LAYER') {
                const layerConfig = item?.layerConfig?.mapboxLayer;
                const finalMapboxStyle = layerConfig?.mapboxStyle ?? mapboxStyle;
                if (!finalMapboxStyle) {
                    return undefined;
                }

                return ({
                    id: String(index + 1),
                    type: 'mapbox',
                    visible: !!item.visible,
                    options: {
                        opacity: item.opacity,
                        zIndex: item.order ?? (index + 1),
                        styleUrl: finalMapboxStyle,
                        accessToken: layerConfig?.accessToken ?? mapboxToken,
                    },
                });
            }
            return undefined;
        });
        return ({
            title: {
                children: configuration?.title,
                style: resolveTextStyle(
                    configuration?.style?.title,
                    undefined,
                ),
            },
            subTitle: {
                children: configuration?.subTitle,
                style: resolveTextStyle(
                    configuration?.style?.subTitle,
                    undefined,
                ),
            },
            mapHeight: configuration?.mapHeight ?? 320,
            maxZoom: configuration?.maxZoom ?? 7,
            minZoom: configuration?.minZoom ?? 1,
            showScale: configuration?.showScale,
            scaleBar: configuration?.scaleBar,
            center: (configuration?.centerLatitude && configuration?.centerLongitude)
                ? ([
                    configuration?.centerLongitude,
                    configuration?.centerLatitude,
                ]) as [number, number] : ([
                    30,
                    16.8,
                ]) as [number, number],
            zoom: configuration?.zoom ?? 5.6,
            enableZoomControls: configuration?.enableZoomControls,
            enableMouseWheelZoom: true,
            enableDoubleClickZoom: true,
            layers: layers?.filter(isDefined) ?? [],
        });
    }, [
        metadataMap,
        downloadsPending,
        downloadedGeoData,
        configuration,
        usedFiles,
    ]);

    return (
        <div className={className}>
            {downloadsPending && <PendingAnimation />}
            {finalConfig && (
                <ErrorBoundary>
                    <Map
                        {...finalConfig}
                    />
                </ErrorBoundary>
            )}
        </div>
    );
}

export default MapContent;
