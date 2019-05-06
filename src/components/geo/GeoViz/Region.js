import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { RequestHandler as createRequestHandler } from '@togglecorp/react-rest-request';

import LoadingAnimation from '#rscv/LoadingAnimation';
import { currentStyle } from '#rsu/styles';
import Message from '#rscv/Message';

import Map from '#rscz/Map';
import MapLayer from '#rscz/Map/MapLayer';
import MapLegend from '#rscz/Map/Legend';
import MapSource from '#rscz/Map/MapSource';


import {
    RequestClient,
    RequestCoordinator,
} from '#request';
import _ts from '#ts';

import styles from './styles.scss';

const RequestHandler = createRequestHandler(RequestClient);

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
    frequency: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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

const colors = [
    '#ffffff',
    '#e0eeea',
    '#c2ddd6',
    '#a3ccc2',
    '#84bbae',
    '#64aa9a',
    '#409a87',
    '#008975',
];

@RequestCoordinator
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

    calcLegendDetails = (frequency, step) => {
        const maxFreq = Math.max(...Object.values(frequency));
        const stepSize = maxFreq / step;
        const details = [];

        // eslint-disable-next-line no-plusplus
        for (let i = 1; i <= step; i++) {
            const min = Math.floor(stepSize * (i - 1));
            const max = Math.floor(stepSize * i);
            const unit = {
                min,
                max,
                label: `${min} - ${max}`,
                color: colors[i - 1],
            };
            details.push(unit);
        }
        return details;
    }

    calcSelectionFillPaint = memoize((_, frequency) => {
        const details = this.calcLegendDetails(frequency, colors.length);
        const iterableDetails = [];
        let max = 0;

        details.forEach((d) => {
            iterableDetails.push(d.min);
            iterableDetails.push(d.color);
            max = d.max > max ? d.max : max;
        });

        return ({
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'count'],
                0, '#ffffff',
                max, currentStyle.colorAccent,
            ],
            'fill-opacity': 1,
        });
    });

    calcBorderPaint = memoize(() => ({
        'line-color': '#717171',
        'line-opacity': 0.8,
        'line-width': 1,
    }))

    calcBoundsHoverInfo = memoize(() => ({
        paint: {
            'fill-color': '#fff',
            'fill-opacity': 0.2,
        },
        showTooltip: true,
        tooltipProperty: 'tooltip',
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

    calcNewGeojsonWithFrequency = memoize((geoJson, frequency) => {
        const newFeatures = [];
        geoJson.features.forEach((f) => {
            const featurePk = f.properties.pk;
            const newFeature = { ...f };
            // eslint-disable-next-line no-param-reassign
            f.properties.count = frequency[featurePk] || 0;
            // eslint-disable-next-line no-param-reassign
            f.properties.tooltip = `${f.properties.title} - ${frequency[featurePk] || 0}`;
            newFeatures.push(newFeature);
        });
        return ({
            ...geoJson,
            features: newFeatures,
        });
    });

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
            frequency,
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
        const newGeoJson = this.calcNewGeojsonWithFrequency(geoJson, frequency);
        const bgPaint = this.calcSelectionFillPaint(adminLevel, frequency);

        return (
            <MapSource
                sourceKey="bounds"
                geoJson={newGeoJson}
                supportHover
            >
                <MapLayer
                    layerKey="bounds-fill-selection"
                    type="fill"
                    property="pk"
                    paint={bgPaint}
                    hoverInfo={this.calcBoundsHoverInfo(adminLevel)}
                />
                <MapLayer
                    layerKey="bounds-border"
                    type="line"
                    filter={boundsFilter}
                    paint={this.calcBorderPaint(adminLevel)}
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
        const {
            frequency,
            showLegend,
            adminLevels,
        } = this.props;

        // FIXME: No hardcoded numbers
        const legendItems = this.calcLegendDetails(frequency, colors.length);

        return (
            <React.Fragment>
                {this.renderContent()}
                {adminLevels.map(this.renderAdminLevel)}
                {showLegend &&
                    <MapLegend
                        className={styles.legend}
                        legendItems={legendItems}
                        type="square"
                    />
                }
            </React.Fragment>
        );
    }
}
