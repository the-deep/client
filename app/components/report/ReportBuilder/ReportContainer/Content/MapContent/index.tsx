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

import {
    mapboxStyle,
    mapboxToken,
} from '#base/configs/env';

import {
    type MapConfigType,
    type ContentDataType,
} from '../../../../schema';

interface Props {
    className?: string;
    configuration?: MapConfigType;
    contentData: ContentDataType[] | undefined;
    downloadedGeoData: Record<string, unknown>;
    downloadsPending: boolean;
}

function MapContent(props: Props) {
    const {
        className,
        configuration,
        contentData,
        downloadedGeoData,
        downloadsPending,
    } = props;

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
            /*
            if (item.type === 'SYMBOL_LAYER') {
                const referenceId = item?.layerConfig?.symbolLayer?.contentReferenceId;
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
                return ({
                    ...item,
                    type: 'symbol',
                    data: downloadedGeoData[uploadId],
                });
            }
            */
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
            return item;
        });
        return ({
            height: 512,
            width: 654,
            showHeader: true,
            mainTitle: 'Default map',
            subTitle: 'Country level',
            dateText: '',
            maxZoom: 7,
            minZoom: 1,
            showScale: true,
            showLogos: [],
            scaleUnits: 'metric',
            scaleBar: false,
            scaleBarPosition: 'bottomRight',
            enableMouseWheelZoom: false,
            enableDoubleClickZoom: false,
            enableZoomControls: true,
            zoomControlsPosition: 'topRight',
            showLegend: true,
            legendPosition: 'bottomLeft',
            showFooter: true,
            sources: 'My Source',
            headerStyle: {
                fontWeight: 'normal',
                fontFamily: 'Roboto Slab',
                color: {
                    r: 0, g: 0, b: 0, a: 1,
                },
            },
            fontStyle: {
                fontWeight: 'normal',
                fontFamily: 'Roboto Slab',
                color: {
                    r: 0, g: 0, b: 0, a: 1,
                },
            },
            center: {
                lon: 30,
                lat: 16.8,
            },
            zoom: 5.6,
            layers: layers?.filter(isDefined) ?? [],
        });
    }, [
        downloadsPending,
        downloadedGeoData,
        configuration?.layers,
        usedFiles,
    ]);
    console.log('here', finalConfig);

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
            Map Content
        </div>
    );
}

export default MapContent;
