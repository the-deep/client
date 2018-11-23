import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import Map from '#rscz/Map';
import MapLayer from '#rscz/Map/MapLayer';
import MapSource from '#rscz/Map/MapSource';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';

import { RequestClient } from '#request';
import _ts from '#ts';

const propTypes = {
    className: PropTypes.string,
    adminLevel: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        level: PropTypes.number,
    }).isRequired,
    geoJsonRequest: RequestClient.propType.isRequired,
    geoBoundsRequest: RequestClient.propType.isRequired,
    active: PropTypes.bool,
};

const defaultProps = {
    className: '',
    active: false,
};

const requests = {
    geoJsonRequest: {
        onMount: true,
        onPropsChanged: ['adminLevel'],
        url: ({ props: { adminLevel } }) => `/admin-levels/${adminLevel.id}/geojson/`,
    },
    geoBoundsRequest: {
        onMount: true,
        onPropsChanged: ['adminLevel'],
        url: ({ props: { adminLevel } }) => `/admin-levels/${adminLevel.id}/geojson/bounds/`,
    },
};

@RequestClient(requests)
export default class AdminLevel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    calcBoundsArray = memoize(boundsObj => [
        boundsObj.minX,
        boundsObj.minY,
        boundsObj.maxX,
        boundsObj.maxY,
    ])

    calcFillPaint = memoize(adminLevel => ({
        'fill-color': '#00897B',
        'fill-opacity': 0.4,
    }))

    calcBorderPaint = memoize(adminLevel => ({
        'line-color': '#ffffff',
        'line-opacity': 1,
        'line-width': 1,
    }))

    render() {
        const {
            className,
            active,
            adminLevel,
            geoJsonRequest,
            geoBoundsRequest,
        } = this.props;

        if (!active) {
            return null;
        }

        if (geoJsonRequest.pending || geoBoundsRequest.pending) {
            return (
                <LoadingAnimation />
            );
        }

        if (geoJsonRequest.responseError || geoBoundsRequest.responseError) {
            return (
                <Message>
                    {_ts('geoViz', 'invalidAdminLevel')}
                </Message>
            );
        }

        const { bounds } = geoBoundsRequest.response;
        const geoJson = geoJsonRequest.response;

        return (
            <Map
                className={className}
                bounds={this.calcBoundsArray(bounds)}
                boundsPadding={8}
            >
                <MapSource
                    sourceKey="bounds"
                    geoJson={geoJson}
                >
                    <MapLayer
                        layerKey="bounds-fill"
                        type="fill"
                        paint={this.calcFillPaint(adminLevel)}
                    />
                    <MapLayer
                        layerKey="bounds-border"
                        type="line"
                        paint={this.calcBorderPaint(adminLevel)}
                    />
                </MapSource>
            </Map>
        );
    }
}
