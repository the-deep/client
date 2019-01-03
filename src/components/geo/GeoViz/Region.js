import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { RequestHandler } from '@togglecorp/react-rest-request';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';

import Map from '#rscz/Map';
import MapLayer from '#rscz/Map/MapLayer';
import MapSource from '#rscz/Map/MapSource';

import { RequestClient } from '#request';
import _ts from '#ts';

const emptyObject = {};

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/no-unused-prop-types
    regionId: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
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

const boundsFilter = ['==', '$type', 'Polygon'];
const pointsFilter = ['==', '$type', 'Point'];

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

    calcFillPaint = memoize(() => ({
        'fill-color': '#088',
        'fill-opacity': 0.5,
    }))

    calcSelectionFillPaint = memoize(() => ({
        'fill-color': '#6e599f',
        'fill-opacity': 0.5,
    }))

    calcBorderPaint = memoize(() => ({
        'line-color': '#fff',
        'line-opacity': 1,
        'line-width': 1,
    }))

    calcBoundsHoverInfo = memoize(() => ({
        paint: {
            'fill-color': '#fff',
            'fill-opacity': 0.2,
        },
        showTooltip: true,
        tooltipProperty: 'title',
    }))

    calcPointPaint = memoize(() => ({
        'circle-color': '#088',
        'circle-radius': 8,
    }))

    calcSelectionPointPaint = memoize(() => ({
        'circle-color': '#6e599f',
        'circle-opacity': 0.5,
        'circle-radius': 8,
    }))

    calcPointHoverInfo = memoize(() => ({
        paint: {
            'circle-color': '#fff',
            'circle-opacity': 0.2,
        },
        showTooltip: true,
        tooltipProperty: 'title',
    }))

    calcSelectedBoundsFilter = memoize(value => [
        'all',
        boundsFilter,
        ['in', 'pk', ...value],
    ])
    calcNonSelectedBoundsFilter = memoize(value => [
        'all',
        boundsFilter,
        ['!in', 'pk', ...value],
    ])

    calcSelectedPointsFilter = memoize(value => [
        'all',
        pointsFilter,
        ['in', 'pk', ...value],
    ])
    calcNonSelectedPointsFilter = memoize(value => [
        'all',
        pointsFilter,
        ['!in', 'pk', ...value],
    ])

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

    renderMapLayers = ({ geoJsonRequest, pending, error }) => {
        const {
            adminLevels,
            adminLevelId,
            value,
        } = this.props;

        if (pending) {
            return <LoadingAnimation />;
        }

        if (error) {
            return (
                <Message>
                    {_ts('geoViz', 'invalidRegion')}
                </Message>
            );
        }

        const adminLevel = adminLevels.find(a => String(a.id) === adminLevelId);
        const { response: geoJson } = geoJsonRequest;

        return (
            <MapSource
                sourceKey="bounds"
                geoJson={geoJson}
                supportHover
            >
                <MapLayer
                    layerKey="bounds-fill"
                    type="fill"
                    property="pk"
                    filter={this.calcNonSelectedBoundsFilter(value)}
                    paint={this.calcFillPaint(adminLevel)}
                    hoverInfo={this.calcBoundsHoverInfo(adminLevel)}
                />
                <MapLayer
                    layerKey="bounds-fill-selection"
                    type="fill"
                    property="pk"
                    filter={this.calcSelectedBoundsFilter(value)}
                    paint={this.calcSelectionFillPaint(adminLevel)}
                    hoverInfo={this.calcBoundsHoverInfo(adminLevel)}
                />
                <MapLayer
                    layerKey="bounds-border"
                    type="line"
                    filter={boundsFilter}
                    paint={this.calcBorderPaint(adminLevel)}
                />

                <MapLayer
                    layerKey="points"
                    type="circle"
                    property="pk"
                    filter={this.calcNonSelectedPointsFilter(value)}
                    paint={this.calcPointPaint(adminLevel)}
                    hoverInfo={this.calcPointHoverInfo(adminLevel)}
                />
                <MapLayer
                    layerKey="points-selection"
                    type="circle"
                    property="pk"
                    filter={this.calcSelectedPointsFilter(value)}
                    paint={this.calcSelectionPointPaint(adminLevel)}
                    hoverInfo={this.calcPointHoverInfo(adminLevel)}
                />
            </MapSource>
        );
    }

    renderContent = () => {
        const {
            className,
            adminLevelId,
            regionRequest,
        } = this.props;

        const geoJsonKey = adminLevelId && `geoJson-${adminLevelId}`;
        const geoJsonRequest = (geoJsonKey && this.state[geoJsonKey]) || emptyObject;

        const geoBoundsKey = adminLevelId && `geoBounds-${adminLevelId}`;
        const geoBoundsRequest = (geoBoundsKey && this.state[geoBoundsKey]) || emptyObject;

        const pending = (
            regionRequest.pending ||
            geoJsonRequest.pending ||
            geoBoundsRequest.pending
        );
        const error = (
            regionRequest.responseError ||
            geoJsonRequest.responseError ||
            geoBoundsRequest.responseError
        );
        const { bounds } = geoBoundsRequest;

        const MapLayers = this.renderMapLayers;

        return (
            <Map
                className={className}
                bounds={bounds}
                boundsPadding={8}
                hideNavControl
            >
                <MapLayers
                    geoJsonRequest={geoJsonRequest}
                    pending={pending}
                    error={!!error}
                />
            </Map>
        );
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
