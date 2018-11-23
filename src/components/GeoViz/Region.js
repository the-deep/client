import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';

import Map from '#rscz/Map';
import MapLayer from '#rscz/Map/MapLayer';
import MapSource from '#rscz/Map/MapSource';

import { RequestClient } from '#request';
import _ts from '#ts';

import RequestHandler from '../../RequestHandler';

const emptyObject = {};

const propTypes = {
    className: PropTypes.string,
    regionId: PropTypes.number.isRequired,
    onAdminLevelsFetched: PropTypes.func.isRequired,
    adminLevels: PropTypes.arrayOf(PropTypes.object),
    adminLevelId: PropTypes.string,
    regionRequest: RequestClient.propType.isRequired,
    value: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    className: '',
    adminLevels: [],
    adminLevelId: undefined,
    value: [],
};

const requests = {
    regionRequest: {
        onMount: true,
        onPropsChanged: ['regionId'],
        url: ({ props: { regionId } }) => `/regions/${regionId}/`,
        onSuccess: ({ response, props: { onAdminLevelsFetched } }) => {
            onAdminLevelsFetched(response.adminLevels);
        },
    },
};

// TODO POINT TYPE LAYERS

@RequestClient(requests)
export default class Region extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static calcBoundsArray = boundsObj => [
        boundsObj.minX,
        boundsObj.minY,
        boundsObj.maxX,
        boundsObj.maxY,
    ]

    constructor(props) {
        super(props);
        this.state = {};
        this.fillPaints = {};
        this.borderPaints = {};
    }

    calcFillPaint = memoize(adminLevel => ({
        'fill-color': '#088',
        'fill-opacity': 0.5,
    }))

    calcSelectionFillPaint = memoize(adminLevel => ({
        'fill-color': '#6e599f',
        'fill-opacity': 0.5,
    }))

    calcBorderPaint = memoize(adminLevel => ({
        'line-color': '#fff',
        'line-opacity': 1,
        'line-width': 1,
    }))

    calcHoverInfo = memoize(adminLevel => ({
        paint: {
            'fill-color': '#fff',
            'fill-opacity': 0.2,
        },
        showTooltip: true,
        tooltipProperty: 'title',
    }))

    calcSelectedFilter = memoize(value => ['in', 'pk', ...value])
    calcNonSelectedFilter = memoize(value => ['!in', 'pk', ...value])

    handleGeoJsonRequest = (request, adminLevel) => {
        this.setState({
            [`geoJson-${adminLevel.id}`]: request,
        });
    }

    handleGeoBoundsRequest = (actualRequest, adminLevel) => {
        const request = {
            ...actualRequest,
            bounds: actualRequest.response && Region.calcBoundsArray(
                actualRequest.response.bounds,
            ),
        };

        this.setState({
            [`geoBounds-${adminLevel.id}`]: request,
        });
    }

    renderAdminLevel = adminLevel => (
        <React.Fragment key={adminLevel.id}>
            <RequestHandler
                url={`/admin-levels/${adminLevel.id}/geojson/`}
                changeParams={adminLevel}
                onRequestChange={this.handleGeoJsonRequest}
            />
            <RequestHandler
                url={`/admin-levels/${adminLevel.id}/geojson/bounds/`}
                changeParams={adminLevel}
                onRequestChange={this.handleGeoBoundsRequest}
            />
        </React.Fragment>
    )

    renderMap = (geoJsonRequest, geoBoundsRequest) => {
        const {
            className,
            adminLevels,
            adminLevelId,
            value,
        } = this.props;

        if (!geoJsonRequest || !geoBoundsRequest) {
            return (
                <Message>
                    {_ts('geoViz', 'invalidAdminLevel')}
                </Message>
            );
        }

        const adminLevel = adminLevels.find(a => String(a.id) === adminLevelId);
        const { response: geoJson } = geoJsonRequest;
        const { bounds } = geoBoundsRequest;

        return (
            <Map
                className={className}
                bounds={bounds}
                boundsPadding={8}
            >
                <MapSource
                    sourceKey="bounds"
                    geoJson={geoJson}
                    supportHover
                >
                    <MapLayer
                        layerKey="bounds-fill"
                        type="fill"
                        property="pk"
                        filter={this.calcNonSelectedFilter(value)}
                        paint={this.calcFillPaint(adminLevel)}
                        hoverInfo={this.calcHoverInfo(adminLevel)}
                    />
                    <MapLayer
                        layerKey="bounds-fill-selection"
                        type="fill"
                        property="pk"
                        filter={this.calcSelectedFilter(value)}
                        paint={this.calcSelectionFillPaint(adminLevel)}
                        hoverInfo={this.calcHoverInfo(adminLevel)}
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

    renderContent = () => {
        const {
            className,
            regionId,
            adminLevels,
            adminLevelId,
            onAdminLevelsFetched,
            regionRequest,
        } = this.props;

        const geoJsonKey = adminLevelId && `geoJson-${adminLevelId}`;
        const geoJsonRequest = (geoJsonKey && this.state[geoJsonKey]) || emptyObject;

        const geoBoundsKey = adminLevelId && `geoBounds-${adminLevelId}`;
        const geoBoundsRequest = (geoBoundsKey && this.state[geoBoundsKey]) || emptyObject;

        if (
            regionRequest.pending ||
            geoJsonRequest.pending ||
            geoBoundsRequest.pending
        ) {
            return (
                <div className={className}>
                    <LoadingAnimation />
                </div>
            );
        }

        if (
            regionRequest.responseError ||
            geoJsonRequest.responseError ||
            geoBoundsRequest.responseError
        ) {
            return (
                <div className={className}>
                    <Message>
                        {_ts('geoViz', 'invalidRegion')}
                    </Message>
                </div>
            );
        }

        return this.renderMap(geoJsonRequest, geoBoundsRequest);
    }

    render() {
        return (
            <React.Fragment>
                {this.renderContent()}
                {this.props.adminLevels.map(this.renderAdminLevel)}
            </React.Fragment>
        );
    }
}
