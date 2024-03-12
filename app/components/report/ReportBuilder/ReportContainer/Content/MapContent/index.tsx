import React, { useMemo } from 'react';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import { PendingAnimation } from '@the-deep/deep-ui';
import {
    Map,
} from '@the-deep/reporting-module-components';

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
import {
    resolveTextStyle,
} from '../../../../utils';

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

    const finalConfig = useMemo(() => {
        if (downloadsPending) {
            return undefined;
        }
        const layers = configuration?.layers?.map((item, index) => {
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
                return ({
                    id: index + 1,
                    type: 'symbol',
                    visible: item.visible,
                    options: {
                        opacity: item.opacity,
                        zIndex: item.order,
                        data: downloadedGeoData[uploadId],
                        labelPropertyKey: layerConfig.labelPropertyKey
                            ? columnLabel?.[layerConfig.labelPropertyKey]
                            : undefined,
                        showLabels: layerConfig?.showLabels,
                        scale: layerConfig?.scale,
                        scaleType: layerConfig?.scaleType ?? 'fixed',
                        symbol: layerConfig?.symbol ?? 'circle',
                        labelStyle: {
                            fontSize: 12,
                            showHalo: true,
                            color: '#000000',
                            fontFamily: 'Roboto Mono',
                            ...resolveTextStyle(
                                layerConfig?.style?.label,
                                undefined,
                            ),
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
                    id: index + 1,
                    type: 'heatmap',
                    visible: item.visible,
                    options: {
                        opacity: item.opacity,
                        zIndex: item.order,
                        data: downloadedGeoData[uploadId],
                        blur: layerConfig?.blur,
                        scaleDataMax: layerConfig?.scaleDataMax,
                        fillPalette: 'Oranges',
                        radius: layerConfig?.radius,
                        weighted: layerConfig?.weighted,
                        weightPropertyKey: layerConfig.weightPropertyKey
                            ? columnLabel?.[layerConfig.weightPropertyKey]
                            : undefined,
                    },
                });
            }
            if (item.type === 'OSM_LAYER') {
                return ({
                    id: index + 1,
                    type: 'osm',
                    visible: item.visible,
                    options: {
                        opacity: item.opacity,
                        zIndex: item.order,
                    },
                });
            }
            if (item.type === 'MAPBOX_LAYER') {
                const layerConfig = item?.layerConfig?.mapboxLayer;
                return ({
                    id: index + 1,
                    type: 'mapbox',
                    visible: item.visible,
                    options: {
                        opacity: item.opacity,
                        zIndex: item.order,
                        styleUrl: layerConfig?.mapboxStyle ?? mapboxStyle,
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
