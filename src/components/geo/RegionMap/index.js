import React from 'react';
import PropTypes from 'prop-types';
import produce from 'immer';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';
import SegmentInput from '#rsci/SegmentInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import { FgRestBuilder } from '#rsu/rest';

import Map from '#re-map';
import MapBounds from '#re-map/MapBounds';
import MapContainer from '#re-map/MapContainer';
import MapSource from '#re-map/MapSource';
import MapLayer from '#re-map/MapSource/MapLayer';
import MapState from '#re-map/MapSource/MapState';
import MapTooltip from '#re-map/MapTooltip';

import {
    createParamsForGet,
    createUrlForAdminLevelsForRegion,
    createUrlForGeoAreasLoadTrigger,
    createUrlForGeoJsonMap,
    createUrlForGeoJsonBounds,
} from '#rest';
import _ts from '#ts';

import styles from './styles.scss';

const mapOptions = {
    zoom: 2,
    center: [50, 10],
};

const sourceOptions = {
    type: 'geojson',
};

const fillLayerOptions = {
    type: 'fill',
    paint: {
        'fill-opacity': ['case',
            ['boolean', ['feature-state', 'hovered'], false],
            0.7,
            0.5,
        ],
        'fill-color': ['case',
            ['boolean', ['feature-state', 'selected'], false],
            '#6e599f',
            '#088',
        ],
    },
};

const tooltipOptions = {
    closeOnClick: false,
    closeButton: false,
    offset: 8,
};


const propTypes = {
    className: PropTypes.string,
    regionId: PropTypes.number,
    selections: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
};

const defaultProps = {
    className: undefined,
    regionId: undefined,
    selections: [],
    onChange: undefined,
};

export default class RegionMap extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static adminLevelKeySelector = d => String(d.id);

    static adminLevelLabelSelector = d => d.title;

    static isStale = adminLevels => (
        adminLevels.reduce(
            (acc, adminLevel) => (
                adminLevel.staleGeoAreas || acc
            ),
            false,
        )
    )

    constructor(props) {
        super(props);

        this.state = {
            // for adminLevels
            error: undefined,
            pending: undefined,
            adminLevels: undefined,
            selectedAdminLevelId: undefined,

            // for each admin level
            adminLevelPending: {},
            geoJsons: {},
            geoJsonBounds: {}, // TODO: can be calculated using turf

            hoverTitle: undefined,
            hoverLngLat: undefined,
        };

        this.geoJsonRequests = undefined; // TODO: use coordinator
        this.hasTriggeredOnce = undefined; // TODO: can be replaced

        // TODO: support points
        // TODO: support element id from server
    }

    componentDidMount() {
        const { regionId } = this.props;
        this.create(regionId);
    }

    componentWillReceiveProps(nextProps) {
        const { regionId: oldRegionId } = this.props;
        const { regionId: newRegionId } = nextProps;
        if (oldRegionId !== newRegionId) {
            this.create(newRegionId);
        }
    }

    componentWillUnmount() {
        this.destroy();
    }

    getSelectedAdminLevel = memoize((adminLevels, selectedAdminLevelId) => (
        adminLevels.find(l => String(l.id) === selectedAdminLevelId)
    ))

    getLineLayerOptions = memoize(thickness => ({
        type: 'line',
        paint: {
            'line-color': '#fff',
            'line-width': thickness,
        },
    }))

    getValidBounds = memoize(geoJsonBounds => (
        geoJsonBounds
            ? [...geoJsonBounds[0], ...geoJsonBounds[1]]
            : undefined
    ))

    getSelectedState = memoize(selections => (
        selections.map(id => ({
            id: +id,
            value: true,
        }))
    ))

    // NOTE: initialize state for a region
    init = (initialPending = true) => {
        this.setState({
            error: false,
            pending: initialPending,

            adminLevels: [],
            selectedAdminLevelId: '',

            adminLevelPending: {},
            geoJsons: {},
            geoJsonBounds: {},

            hoverTitle: undefined,
            hoverLngLat: undefined,
            // NOTE: let's not clear geoJson and geoJson bounds
        });

        this.geoJsonRequests = [];
        this.hasTriggeredOnce = false;
    }

    // NOTE: call appropriate request
    create = (regionId) => {
        this.destroy();

        if (!regionId) {
            this.init(false);
            return;
        }

        this.init();
        this.adminLevelsRequest = this.createAdminLevelsRequest(regionId);
        this.adminLevelsRequest.start();
    }

    // NOTE: stop all requests
    destroy = () => {
        if (this.geoJsonRequests) {
            this.geoJsonRequests.forEach(
                request => request.stop(),
            );
        }

        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }

        if (this.adminLevelsRequest) {
            this.adminLevelsRequest.stop();
        }
    }

    // NOTE: triggered by admin level request
    createTriggerRequest = regionId => (
        new FgRestBuilder()
            .url(createUrlForGeoAreasLoadTrigger(regionId))
            .params(createParamsForGet)
            .success(() => {
                console.log(`Triggered geo areas loading task for ${regionId}`);
                this.adminLevelsRequest = this.createAdminLevelsRequest(regionId);
                this.adminLevelsRequest.start();
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: _ts('components.regionMap', 'serverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: _ts('components.regionMap', 'connectionFailureText'),
                });
            })
            .build()
    )

    // NOTE: re-triggered by trigger request
    createAdminLevelsRequest = regionId => (
        new FgRestBuilder()
            .url(createUrlForAdminLevelsForRegion(regionId))
            .params(createParamsForGet)
            .maxPollAttempts(200)
            .pollTime(2000)
            .shouldPoll(response => (
                this.hasTriggeredOnce && RegionMap.isStale(response.results)
            ))
            .success((response) => {
                const { results } = response;
                const stale = RegionMap.isStale(results);

                if (stale) {
                    this.hasTriggeredOnce = true;
                    this.triggerRequest = this.createTriggerRequest(regionId);
                    this.triggerRequest.start();
                } else {
                    const selectedAdminLevelId = results.length > 0
                        ? `${results[0].id}`
                        : '';

                    this.setState(
                        {
                            pending: false,
                            adminLevels: results,
                            selectedAdminLevelId,
                        },
                        this.loadSelectedAdminGeoJson,
                    );
                }
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: _ts('components.regionMap', 'serverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: _ts('components.regionMap', 'connectionFailureText'),
                });
            })
            .build()
    )

    createGeoJsonRequest = (selectedAdminLevelId, adminLevels) => {
        const selectedAdminLevel = adminLevels.find(
            l => String(l.id) === selectedAdminLevelId,
        );

        const url = (selectedAdminLevel && selectedAdminLevel.geojsonFile)
            || createUrlForGeoJsonMap(selectedAdminLevelId);

        const params = selectedAdminLevel && selectedAdminLevel.geojsonFile
            ? undefined
            : createParamsForGet;

        return new FgRestBuilder()
            .url(url)
            .params(params)
            .preLoad(() => {
                this.setState(state => ({
                    ...state,
                    adminLevelPending: {
                        ...state.adminLevelPending,
                        [selectedAdminLevelId]: true,
                    },
                }));
            })
            .postLoad(() => {
                this.setState(state => ({
                    ...state,
                    adminLevelPending: {
                        ...state.adminLevelPending,
                        [selectedAdminLevelId]: false,
                    },
                }));
            })
            .success((response) => {
                const newGeoJson = produce(response, (safeResponse) => {
                    safeResponse.features.forEach((feature) => {
                        if (!feature.properties) {
                            return;
                        }
                        // eslint-disable-next-line no-param-reassign
                        feature.id = feature.properties.pk;
                    });
                });
                this.setState(
                    state => ({
                        ...state,
                        geoJsons: {
                            ...state.geoJsons,
                            [selectedAdminLevelId]: newGeoJson,
                        },
                    }),
                );
            })
            .failure((response) => {
                console.log(response);
            })
            .fatal((response) => {
                console.log(response);
            })
            .build();
    }

    createGeoJsonBoundsRequest = (selectedAdminLevelId, adminLevels) => {
        const selectedAdminLevel = adminLevels.find(
            l => String(l.id) === selectedAdminLevelId,
        );

        const url = (selectedAdminLevel && selectedAdminLevel.boundsFile)
            || createUrlForGeoJsonBounds(selectedAdminLevelId);

        const params = selectedAdminLevel && selectedAdminLevel.boundsFile
            ? undefined
            : createParamsForGet;

        return new FgRestBuilder()
            .url(url)
            .params(params)
            .success((response) => {
                const { bounds } = response;

                const myBounds = bounds && [
                    [bounds.minX, bounds.minY],
                    [bounds.maxX, bounds.maxY],
                ];

                this.setState(
                    state => ({
                        ...state,
                        geoJsonBounds: {
                            ...state.geoJsonBounds,
                            [selectedAdminLevelId]: myBounds,
                        },
                    }),
                );
            })
            .failure((response) => {
                console.log(response);
            })
            .fatal((response) => {
                console.log(response);
            })
            .build();
    }

    loadSelectedAdminGeoJson = () => {
        const {
            geoJsons: geoJsonsFromState,
            geoJsonBounds: geoJsonBoundsFromState,

            selectedAdminLevelId,
            adminLevels,
        } = this.state;

        if (!geoJsonsFromState[selectedAdminLevelId]) {
            const request = this.createGeoJsonRequest(selectedAdminLevelId, adminLevels);
            request.start();

            this.geoJsonRequests.push(request);
        }

        if (!geoJsonBoundsFromState[selectedAdminLevelId]) {
            const request = this.createGeoJsonBoundsRequest(selectedAdminLevelId, adminLevels);
            request.start();
            this.geoJsonRequests.push(request);
        }
    }

    handleAreaClick = (feature) => {
        const {
            onChange,
            selections: selectionsFromProps,
        } = this.props;

        if (!onChange) {
            return;
        }

        const { id } = feature;
        const selection = String(id);

        const selections = [...selectionsFromProps];

        const index = selections.indexOf(selection);
        if (index === -1) {
            selections.push(selection);
        } else {
            selections.splice(index, 1);
        }

        onChange(selections);
    }

    handleMouseEnter = (feature, lngLat) => {
        this.setState({
            hoverTitle: feature.properties.title,
            hoverLngLat: lngLat,
        });
    }

    handleMouseLeave = () => {
        this.setState({
            hoverTitle: undefined,
            hoverLngLat: undefined,
        });
    }

    handleAdminLevelSelection = (id) => {
        this.setState(
            {
                selectedAdminLevelId: id,
            },
            this.loadSelectedAdminGeoJson,
        );
    }

    handleRefresh = () => {
        const { regionId } = this.props;
        this.create(regionId);
    }

    render() {
        const {
            className: classNameFromProps,
            selections,
        } = this.props;

        const {
            pending,
            error,
            adminLevels = [],
            selectedAdminLevelId,
        } = this.state;

        const className = _cs(
            classNameFromProps,
            styles.regionMap,
        );

        if (pending) {
            return (
                <div className={className}>
                    <LoadingAnimation />
                </div>
            );
        }

        if (error) {
            return (
                <div className={className}>
                    <Message>
                        { error }
                    </Message>
                </div>
            );
        }

        if (adminLevels.length === 0 || !selectedAdminLevelId) {
            return (
                <div className={className}>
                    <Message>
                        {_ts('components.regionMap', 'mapNotAvailable')}
                    </Message>
                </div>
            );
        }

        const {
            geoJsons: {
                [selectedAdminLevelId]: myGeoJson,
            },
            geoJsonBounds: {
                [selectedAdminLevelId]: myGeoJsonBounds,
            },
            adminLevelPending: {
                [selectedAdminLevelId]: myAdminLevelPending,
            },
            hoverLngLat,
            hoverTitle,
        } = this.state;

        const adminLevel = this.getSelectedAdminLevel(adminLevels, selectedAdminLevelId);
        const thickness = 1 + (3 * ((adminLevels.length - adminLevel.level) / adminLevels.length));
        const lineLayerOptions = this.getLineLayerOptions(thickness);

        const attributes = this.getSelectedState(selections);

        const bounds = this.getValidBounds(myGeoJsonBounds);

        return (
            <div className={className}>
                <div className={styles.mapContainer}>
                    <Button
                        className={styles.refreshButton}
                        onClick={this.handleRefresh}
                        iconName="refresh"
                        pending={myAdminLevelPending}
                    />
                    <SegmentInput
                        className={styles.bottomContainer}
                        name="admin-levels"
                        options={adminLevels}
                        value={selectedAdminLevelId}
                        onChange={this.handleAdminLevelSelection}
                        keySelector={RegionMap.adminLevelKeySelector}
                        labelSelector={RegionMap.adminLevelLabelSelector}
                        showLabel={false}
                        showHintAndError={false}
                    />
                    <Map
                        mapStyle={process.env.REACT_APP_MAPBOX_STYLE}
                        mapOptions={mapOptions}
                        scaleControlShown={false}
                        navControlShown={false}
                    >
                        { bounds && (
                            <MapBounds
                                bounds={bounds}
                                padding={10}
                            />
                        )}

                        { myGeoJson && (
                            <MapSource
                                sourceKey="region"
                                sourceOptions={sourceOptions}
                                geoJson={myGeoJson}
                            >
                                <MapLayer
                                    layerKey="fill"
                                    onClick={this.handleAreaClick}
                                    onMouseEnter={this.handleMouseEnter}
                                    onMouseLeave={this.handleMouseLeave}
                                    layerOptions={fillLayerOptions}
                                />
                                <MapLayer
                                    layerKey="line"
                                    layerOptions={lineLayerOptions}
                                />
                                {hoverLngLat && (
                                    <MapTooltip
                                        coordinates={hoverLngLat}
                                        tooltipOptions={tooltipOptions}
                                        trackPointer
                                    >
                                        <div>
                                            {hoverTitle}
                                        </div>
                                    </MapTooltip>
                                )}
                                <MapState
                                    attributes={attributes}
                                    attributeKey="selected"
                                />
                            </MapSource>
                        )}
                        <MapContainer
                            className={styles.geoJsonMap}
                        />
                    </Map>
                </div>
            </div>
        );
    }
}
