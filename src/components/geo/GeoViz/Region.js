import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import LoadingAnimation from '#rscv/LoadingAnimation';
import { currentStyle } from '#rsu/styles';
import Message from '#rscv/Message';

import Map from '#rscz/Map';
import MapContainer from '#rscz/Map/MapContainer';
import MapLayer from '#rscz/Map/MapLayer';
import MapSource from '#rscz/Map/MapSource';
import Numeral from '#rscv/Numeral';

import {
    RequestHandler,
    RequestClient,
    RequestCoordinator,
} from '#request';

import _ts from '#ts';

const emptyObject = {};

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/no-unused-prop-types
    regionId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onAdminLevelsFetched: PropTypes.func.isRequired,
    adminLevels: PropTypes.arrayOf(PropTypes.object),
    adminLevelId: PropTypes.string,
    frequency: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    showLegend: PropTypes.bool,
};

const defaultProps = {
    className: '',
    adminLevels: [],
    adminLevelId: undefined,
    showLegend: true,
};

// FIXME: don't use this
const noAuthBody = { $noAuth: true };

const requestOptions = {
    regionRequest: {
        onMount: true,
        onPropsChanged: ['regionId'],
        url: '/admin-levels/',
        query: ({ props: { regionId } }) => ({
            region: regionId,
            fields: [
                'code_prop',
                'geo_shape_file',
                'id',
                'level',
                'name_prop',
                'parent_code_prop',
                'parent_name_prop',
                'geojson_file',
                'bounds_file',
                'region',
                'stale-geo-areas',
                'title',
                'tolerance',
            ],
        }),
        onSuccess: ({ response, props: { onAdminLevelsFetched } }) => {
            onAdminLevelsFetched(response.results);
        },
    },
};

const boundsFilter = ['==', '$type', 'Polygon'];

/*
const colorScheme = [
    '#ffffff',
    '#e0eeea',
    '#c2ddd6',
    '#a3ccc2',
    '#84bbae',
    '#64aa9a',
    '#409a87',
    '#008975',
];
*/

const colorScheme = [
    '#ffffff',
    currentStyle.colorAccent,
];

const LinearLegend = ({ min, max, colors }) => {
    const style = {
        backgroundImage: `linear-gradient(to right, ${colors.join(',')})`,
    };

    return (
        <div>
            <header>
                <h4>
                    {_ts('geoViz', 'legendTitle')}
                </h4>
            </header>
            <div
                style={style}
            />
            <div>
                <Numeral
                    value={min}
                    precision={0}
                />
                <Numeral
                    value={max}
                    precision={0}
                />
            </div>
        </div>
    );
};

LinearLegend.propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    colors: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

@RequestCoordinator
@RequestClient(requestOptions)
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

    /*
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
                color: colorScheme[i - 1],
            };
            details.push(unit);
        }
        return details;
    }
    */

    calcDataRange = memoize((frequency) => {
        const values = Object.values(frequency);
        const sortedFreq = values.sort((a, b) => b - a);

        return ({
            min: sortedFreq[values.length - 1],
            max: sortedFreq[0],
        });
    })

    calcSelectionFillPaint = memoize((_, frequency) => {
        // const details = this.calcLegendDetails(frequency, colorScheme.length);
        // const iterableDetails = [];

        // details.forEach((d) => {
        //     iterableDetails.push(d.min);
        //     iterableDetails.push(d.color);
        //     max = d.max > max ? d.max : max;
        // });
        const { max } = this.calcDataRange(frequency);

        return ({
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'count'],
                0, colorScheme[0],
                max, colorScheme[1],
            ],
            'fill-opacity': 0.9,
        });
    });

    calcBorderPaint = () => ({
        'line-color': currentStyle.colorText,
        'line-opacity': 0.9,
        'line-width': 1,
    })

    calcBoundsHoverInfo = () => ({
        paint: {
            'fill-color': currentStyle.colorForeground,
            'fill-opacity': 0.2,
        },
        showTooltip: true,
        tooltipProperty: 'tooltip',
    })

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

    renderAdminLevel = (adminLevel) => {
        const geojsonUrl = adminLevel.geojsonFile || `/admin-levels/${adminLevel.id}/geojson/`;
        const boundsUrl = adminLevel.boundsFile || `/admin-levels/${adminLevel.id}/geojson/bounds/`;

        const geojsonBody = adminLevel.geojsonFile ? noAuthBody : undefined;
        const boundsBody = adminLevel.boundsFile ? noAuthBody : undefined;

        return (
            <React.Fragment key={adminLevel.id}>
                <RequestHandler
                    url={geojsonUrl}
                    changeParams={adminLevel}
                    body={geojsonBody}
                    onRequestChange={this.handleGeoJsonRequest}
                />
                <RequestHandler
                    url={boundsUrl}
                    changeParams={adminLevel}
                    body={boundsBody}
                    onRequestChange={this.handleGeoBoundsRequest}
                />
            </React.Fragment>
        );
    }

    renderMapLayers = ({ geoJsonRequest, pending, error }) => {
        const {
            adminLevels,
            adminLevelId,
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
            requests: {
                regionRequest,
            },
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
                bounds={bounds}
                boundsPadding={8}
                hideNavControl
            >
                <MapContainer className={className} />
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

        // const legendItems = this.calcLegendDetails(frequency, colorScheme.length);
        const { max } = this.calcDataRange(frequency);

        return (
            <React.Fragment>
                {this.renderContent()}
                {adminLevels.map(this.renderAdminLevel)}
                {showLegend &&
                    <LinearLegend
                        min={0}
                        max={max}
                        colors={colorScheme}
                    />
                }
            </React.Fragment>
        );
    }
}
