import React from 'react';
import PropTypes from 'prop-types';
import produce from 'immer';
import memoize from 'memoize-one';
import colors from 'colorbrewer';
import { _cs, getRandomFromList } from '@togglecorp/fujs';

import boundError from '#rscg/BoundError';
import { FgRestBuilder } from '#rsu/rest';
import Button from '#rsca/Button';
import SegmentInput from '#rsci/SegmentInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';

import ComponentError from '#components/error/ComponentError';

import Map from '#re-map';
import MapBounds from '#re-map/MapBounds';
import MapContainer from '#re-map/MapContainer';
import MapSource from '#re-map/MapSource';
import MapLayer from '#re-map/MapSource/MapLayer';
import MapState from '#re-map/MapSource/MapState';
import MapTooltip from '#re-map/MapTooltip';
import MapShapeEditor from '#re-map/MapShapeEditor';

import {
    createParamsForGet,
    createUrlForAdminLevelsForRegion,
    createUrlForGeoAreasLoadTrigger,
    createUrlForGeoJsonMap,
    createUrlForGeoJsonBounds,
} from '#rest';
import _ts from '#ts';

import drawStyles from './drawStyles';
import styles from './styles.scss';

const ErrorDecorator = boundError(ComponentError);

const defaultGeoJson = {
    type: 'FeatureCollection',
    features: [],
};

const mapOptions = {
    zoom: 2,
    center: [50, 10],
};

const drawOptions = {
    displayControlsDefault: false,
    controls: {
        point: true,
        polygon: true,
        trash: true,
    },
    userProperties: true,
    styles: drawStyles,
};

const sourceOptions = {
    type: 'geojson',
};

const polygonSourceOptions = {
    type: 'geojson',
    promoteId: 'code',
};

// Paired returns quantitative colors from colorbrewer
const getRandomColor = () => getRandomFromList(colors.Paired[12]);

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

const geoJsonFillOptions = {
    id: 'not-required',
    type: 'fill',
    paint: {
        'fill-color': [
            'case',
            ['has', 'color'],
            ['get', 'color'],
            '#404040',
        ],
        'fill-opacity': 0.1,
    },
    filter: ['==', '$type', 'Polygon'],
};

const geoJsonLineOptions = {
    id: 'not-required-okay',
    type: 'line',
    paint: {
        'line-width': 2,
        'line-color': ['get', 'color'],
    },
    filter: ['==', '$type', 'Polygon'],
};

const geoJsonCircleOptions = {
    id: 'not-required-much',
    type: 'circle',
    paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': 3,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
    },
    filter: ['==', '$type', 'Point'],
};

const tooltipOptions = {
    closeOnClick: false,
    closeButton: false,
    offset: 12,
};

const propTypes = {
    className: PropTypes.string,
    regionId: PropTypes.number,
    selections: PropTypes.arrayOf(PropTypes.string),
    onSelectionsChange: PropTypes.func,
    polygons: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    editMode: PropTypes.bool,
    polygonsEnabled: PropTypes.bool,

    onPolygonEditStart: PropTypes.func,
    onPolygonEditEnd: PropTypes.func,
    onPolygonsChange: PropTypes.func,
    onPolygonClick: PropTypes.func,
};

const defaultProps = {
    className: undefined,
    regionId: undefined,
    selections: [],
    onSelectionsChange: undefined,
    polygons: [],
    editMode: false,
    polygonsEnabled: false,

    onPolygonEditStart: undefined,
    onPolygonEditEnd: undefined,
    onPolygonsChange: undefined,
    onPolygonClick: undefined,
};

class RegionMap extends React.PureComponent {
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

            hoverInfo: undefined,

            // polygons: undefined,
        };

        this.geoJsonRequests = undefined; // TODO: use coordinator
        this.hasTriggeredOnce = undefined; // TODO: can be replaced
    }

    componentDidMount() {
        const { regionId } = this.props;
        this.create(regionId);
    }

    componentWillReceiveProps(nextProps) {
        const {
            regionId: oldRegionId,
        } = this.props;
        const {
            regionId: newRegionId,
        } = nextProps;

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
            'line-width': ['case',
                ['boolean', ['feature-state', 'hovered'], false],
                thickness + 2,
                thickness,
            ],
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

    getGeoJsonsFromPolygons = memoize(polygons => (
        polygons ? polygons.map(p => p.geoJson) : undefined
    ))

    getPolygonCollectionFromPolygons = memoize(polygons => (
        polygons
            ? ({
                type: 'FeatureCollection',
                features: polygons.map(p => p.geoJson),
            })
            : undefined
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

            hoverInfo: undefined,

            // polygons: undefined,
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
            onSelectionsChange,
            selections: selectionsFromProps,
        } = this.props;

        if (!onSelectionsChange) {
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

        onSelectionsChange(selections);
    }

    // NOTE: used for both geo-areas and polygons
    handleMouseEnter = (feature, lngLat) => {
        this.setState({
            hoverInfo: {
                title: feature.properties.title || feature.id,
                lngLat,
            },
        });
    }

    handleMouseLeave = () => {
        this.setState({
            hoverInfo: undefined,
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

    handlePolygonCreate = (features) => {
        const { regionId, onPolygonsChange, polygons } = this.props;

        const maxValue = Math.max(0, ...polygons.map(item => item.geoJson.properties.code));

        const createdPolygons = features.map((feature, index) => ({
            region: regionId,
            type: feature.geometry.type,
            geoJson: {
                ...feature,
                properties: {
                    ...feature.properties,
                    color: getRandomColor(),
                    code: maxValue + index + 1,
                    title: `${feature.geometry.type} ${maxValue + index + 1}`,
                },
            },
        }));
        const newPolygons = [
            ...polygons,
            ...createdPolygons,
        ];

        onPolygonsChange(newPolygons);
    }

    handlePolygonDelete = (features) => {
        const { polygons, onPolygonsChange } = this.props;

        const newPolygons = [...polygons];
        features.forEach((feature) => {
            const index = polygons.findIndex(polygon => polygon.geoJson.id === feature.id);

            if (index === -1) {
                console.error(`Couldn't find polygon with id ${feature.id}`, feature);
                return;
            }

            newPolygons.splice(index, 1);
        });

        onPolygonsChange(newPolygons);
    }

    handlePolygonUpdate = (features) => {
        const { polygons, onPolygonsChange } = this.props;

        const newPolygons = [...polygons];
        features.forEach((feature) => {
            const index = polygons.findIndex(polygon => polygon.geoJson.id === feature.id);

            if (index === -1) {
                console.error(`Couldn't find polygon with id ${feature.id}`, feature);
                return;
            }

            newPolygons[index] = {
                ...newPolygons[index],
                geoJson: feature,
            };
        });

        onPolygonsChange(newPolygons);
    }

    handlePolygonClick = (feature) => {
        const { onPolygonClick, polygons } = this.props;
        if (!onPolygonClick) {
            return true;
        }

        const polygon = polygons.find(
            p => p.geoJson.properties.code === feature.id,
        );
        if (polygon) {
            onPolygonClick(polygon);
        }
        return true;
    }

    render() {
        const {
            className: classNameFromProps,
            selections,
            editMode,
            onPolygonEditStart,
            onPolygonEditEnd,
            polygons,
            polygonsEnabled,
        } = this.props;

        const {
            pending,
            error,
            adminLevels = [],
            selectedAdminLevelId,
            // polygons: polygonsFromState,
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
                // NOTE: myGeoJson should never be undefined
                [selectedAdminLevelId]: myGeoJson = defaultGeoJson,
            },
            geoJsonBounds: {
                [selectedAdminLevelId]: myGeoJsonBounds,
            },
            adminLevelPending: {
                [selectedAdminLevelId]: myAdminLevelPending,
            },
            hoverInfo,
        } = this.state;

        const adminLevel = this.getSelectedAdminLevel(adminLevels, selectedAdminLevelId);
        const thickness = 1 + (3 * ((adminLevels.length - adminLevel.level) / adminLevels.length));
        const lineLayerOptions = this.getLineLayerOptions(thickness);

        const attributes = this.getSelectedState(selections);

        const bounds = this.getValidBounds(myGeoJsonBounds);

        const polygonCollection = this.getPolygonCollectionFromPolygons(polygons);

        return (
            <div className={className}>
                <div className={styles.mapContainer}>
                    <div className={styles.topContainer}>
                        <Button
                            className={styles.button}
                            onClick={this.handleRefresh}
                            iconName="refresh"
                            pending={myAdminLevelPending}
                        >

                            {_ts('components.regionMap', 'reloadButtonLabel')}
                        </Button>
                    </div>
                    { polygonsEnabled && (
                        <>
                            {editMode ? (
                                <Button
                                    className={styles.lockButton}
                                    onClick={onPolygonEditEnd}
                                    disabled={myAdminLevelPending}
                                    iconName="locked"
                                    title={_ts('components.regionMap', 'polygonExitButtonLabel')}
                                />
                            ) : (
                                <Button
                                    className={styles.lockButton}
                                    onClick={onPolygonEditStart}
                                    disabled={myAdminLevelPending}
                                    iconName="unlocked"
                                    title={_ts('components.regionMap', 'polygonEditButtonLabel')}
                                />
                            )}
                        </>
                    )}
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
                        <MapContainer className={styles.geoJsonMap} />
                        {bounds && (
                            <MapBounds
                                bounds={bounds}
                                padding={10}
                            />
                        )}
                        <MapSource
                            sourceKey="region"
                            sourceOptions={sourceOptions}
                            geoJson={myGeoJson}
                        >
                            <MapLayer
                                layerKey="fill"
                                onClick={editMode ? undefined : this.handleAreaClick}
                                onMouseEnter={editMode ? undefined : this.handleMouseEnter}
                                onMouseLeave={editMode ? undefined : this.handleMouseLeave}
                                layerOptions={fillLayerOptions}
                            />
                            <MapLayer
                                layerKey="line"
                                layerOptions={lineLayerOptions}
                            />
                            <MapState
                                attributes={attributes}
                                attributeKey="selected"
                            />
                        </MapSource>
                        {polygonsEnabled && (
                            <MapShapeEditor
                                drawOptions={drawOptions}
                                drawPosition="top-right"
                                onCreate={this.handlePolygonCreate}
                                onDelete={this.handlePolygonDelete}
                                onUpdate={this.handlePolygonUpdate}
                                onModeChange={this.handleModeChange}
                                disabled={!editMode}

                                geoJsons={this.getGeoJsonsFromPolygons(polygons)}
                            />
                        )}
                        {!editMode && hoverInfo && (
                            <MapTooltip
                                coordinates={hoverInfo.lngLat}
                                tooltipOptions={tooltipOptions}
                                trackPointer
                            >
                                <div>
                                    {hoverInfo.title}
                                </div>
                            </MapTooltip>
                        )}
                        {!editMode && polygonCollection && (
                            <MapSource
                                sourceKey="polygons"
                                sourceOptions={polygonSourceOptions}
                                geoJson={polygonCollection}
                            >
                                <MapLayer
                                    layerKey="fill"
                                    layerOptions={geoJsonFillOptions}
                                    onClick={this.handlePolygonClick}
                                    onMouseEnter={this.handleMouseEnter}
                                    onMouseLeave={this.handleMouseLeave}
                                />
                                <MapLayer
                                    layerKey="line"
                                    layerOptions={geoJsonLineOptions}
                                />
                                <MapLayer
                                    layerKey="circle"
                                    layerOptions={geoJsonCircleOptions}
                                    onClick={this.handlePolygonClick}
                                    onMouseEnter={this.handleMouseEnter}
                                    onMouseLeave={this.handleMouseLeave}
                                />
                            </MapSource>
                        )}
                    </Map>
                </div>
            </div>
        );
    }
}

export default ErrorDecorator(RegionMap);
