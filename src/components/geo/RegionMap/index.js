import React from 'react';
import PropTypes from 'prop-types';
import produce from 'immer';
import memoize from 'memoize-one';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';


import { FgRestBuilder } from '#rsu/rest';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';
import Button from '#rsca/Button';
import SegmentInput from '#rsci/SegmentInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';

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

import styles from './styles.scss';

const getIdFromFeature = feature => (
    feature.id
);

const getIdFromPolygon = polygon => (
    getIdFromFeature(polygon.geoJson)
);

// TODO: disable shape edit

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
    offset: 12,
};

const geoJsonFillOptions = {
    id: 'not-required',
    type: 'fill',
    paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': ['case',
            ['boolean', ['feature-state', 'hovered'], false],
            0.7,
            0.3,
        ],
    },
    filter: ['==', '$type', 'Polygon'],
};

const geoJsonLineOptions = {
    id: 'not-required-okay',
    type: 'line',
    paint: {
        'line-width': 1,
        'line-color': ['get', 'color'],
        'line-opacity': 0.8,
    },
    filter: ['==', '$type', 'Polygon'],
};

const geoJsonCircleOptions = {
    id: 'not-required-much',
    type: 'circle',
    paint: {
        'circle-color': ['get', 'color'],
        'circle-opacity': ['case',
            ['boolean', ['feature-state', 'hovered'], false],
            0.7,
            0.3,
        ],
        'circle-radius': 5,
        'circle-stroke-width': 1,
        'circle-stroke-color': ['get', 'color'],
        'circle-stroke-opacity': 0.8,
    },
    filter: ['==', '$type', 'Point'],
};

const propTypes = {
    className: PropTypes.string,
    regionId: PropTypes.number,
    selections: PropTypes.arrayOf(PropTypes.string),
    onSelectionsChange: PropTypes.func,
    polygons: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    onPolygonsChange: PropTypes.func,
};

const defaultProps = {
    className: undefined,
    regionId: undefined,
    selections: [],
    onSelectionsChange: undefined,
    polygons: [],
    onPolygonsChange: undefined,
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

            hoverInfo: undefined,

            // FIXME: Editing polygons move this
            editMode: false,
            polygons: props.polygons,
        };

        this.geoJsonRequests = undefined; // TODO: use coordinator
        this.hasTriggeredOnce = undefined; // TODO: can be replaced

        // TODO: support circle along with fill  for selections
        // TODO: support element id from server
    }

    componentDidMount() {
        const { regionId } = this.props;
        this.create(regionId);
    }

    componentWillReceiveProps(nextProps) {
        const { regionId: oldRegionId, polygons: oldPolygons } = this.props;
        const { regionId: newRegionId, polygons: newPolygons } = nextProps;
        if (oldRegionId !== newRegionId) {
            this.create(newRegionId);
        }
        if (oldPolygons !== newPolygons) {
            this.setState({ polygons: newPolygons, editMode: false });
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

    getGeoJsonsFromPolygons = memoize(polygons => (
        polygons ? polygons.map(p => p.geoJson) : undefined
    ))

    getPolygonCollectionFromPolygons = memoize(polygons => (
        polygons
            ? ({
                type: 'FeatureCollection',
                features: polygons.map(p => ({
                    ...p.geoJson,
                    // NOTE: id used by mapboxgl draw is not a number
                    // NOTE: Also, there was a problem with numeric
                    // id with polygon on update and delete
                    id: p.localId,
                })),
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

    handleModeChange = (editMode) => {
        this.setState({ editMode });
    }

    handlePolygonCreate = (features) => {
        const { regionId } = this.props;
        const { polygons } = this.state;

        const createdPolygons = features.map((feature) => {
            const newFeature = feature;
            return {
                region: regionId,
                geoJson: newFeature,
                type: newFeature.geometry.type,
            };
        });
        const newPolygons = [
            ...polygons,
            ...createdPolygons,
        ];

        this.setState({ polygons: newPolygons });
    }

    handlePolygonDelete = (features) => {
        const { polygons } = this.state;

        const newPolygons = [...polygons];
        features.forEach((feature) => {
            const idFromFeature = getIdFromFeature(feature);
            const index = polygons.findIndex(
                polygon => getIdFromPolygon(polygon) === idFromFeature,
            );
            if (index === -1) {
                console.error(`Couldn't find polygon with id ${idFromFeature}`, feature);
                return;
            }

            newPolygons.splice(index, 1);
        });

        this.setState({ polygons: newPolygons });
    }

    handlePolygonUpdate = (features) => {
        const { polygons } = this.state;

        const newPolygons = [...polygons];
        features.forEach((feature) => {
            const idFromFeature = getIdFromFeature(feature);
            const index = polygons.findIndex(
                polygon => getIdFromPolygon(polygon) === idFromFeature,
            );
            if (index === -1) {
                console.error(`Couldn't find polygon with id ${idFromFeature}`, feature);
                return;
            }

            newPolygons[index] = {
                ...newPolygons[index],
                geoJson: feature,
            };
        });
        this.setState({ polygons: newPolygons });
    }

    handleEnableEditMode = () => {
        this.setState({ editMode: true });
    }

    handleCompleteEditMode = () => {
        const { onPolygonsChange, polygons: polygonsFromProps } = this.props;

        const { polygons } = this.state;
        const polygonsWithLocalId = polygons.filter(
            polygon => isDefined(polygon.localId),
        );
        const polygonsWithoutLocalId = polygons.filter(
            polygon => isNotDefined(polygon.localId),
        );
        const maxId = Math.max(-1, ...polygonsWithLocalId.map(polygon => polygon.localId));
        const mappedPolygons = polygonsWithoutLocalId.map((polygon, i) => {
            const newPolygon = produce(polygon, (safePolygon) => {
                const localId = maxId + i + 1;
                // eslint-disable-next-line
                safePolygon.localId = localId;
                // eslint-disable-next-line
                safePolygon.geoJson.properties.title = `${safePolygon.type} ${localId}`;
            });
            return newPolygon;
        });

        this.setState(
            {
                editMode: false,
                polygons: polygonsFromProps,
            },
            () => {
                onPolygonsChange([
                    ...polygonsWithLocalId,
                    ...mappedPolygons,
                ]);
            },
        );
    }

    handleCancelEditMode = () => {
        const { polygons } = this.props;
        this.setState({ editMode: false, polygons });
    }

    handlePolygonClick = (feature) => {
        const { onPolygonClick } = this.props;
        if (!onPolygonClick) {
            return true;
        }

        const { polygons } = this.state;
        const polygon = polygons.find(
            p => p.localId === feature.id,
        );
        if (!polygon) {
            return true;
        }

        onPolygonClick(polygon);
        return true;
    }

    render() {
        const {
            className: classNameFromProps,
            selections,
        } = this.props;
        const {
            polygons,
        } = this.state;

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
            hoverInfo,
            editMode,
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
                    <div className={styles.refreshButton}>
                        <Button
                            className={styles.button}
                            onClick={this.handleRefresh}
                            iconName="refresh"
                            pending={myAdminLevelPending}
                        />
                        {editMode ? (
                            <>
                                <PrimaryButton
                                    className={styles.button}
                                    onClick={this.handleCompleteEditMode}
                                    disabled={myAdminLevelPending}
                                >
                                    Save
                                </PrimaryButton>
                                <DangerButton
                                    className={styles.button}
                                    onClick={this.handleCancelEditMode}
                                    disabled={myAdminLevelPending}
                                >
                                    Cancel
                                </DangerButton>
                            </>
                        ) : (
                            <Button
                                className={styles.button}
                                onClick={this.handleEnableEditMode}
                                disabled={myAdminLevelPending}
                            >
                                {/* FIXME: use strings */}
                                Edit shapes
                            </Button>
                        )}
                    </div>
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
                        <MapContainer
                            className={styles.geoJsonMap}
                        />
                        {bounds && (
                            <MapBounds
                                bounds={bounds}
                                padding={10}
                            />
                        )}
                        {editMode && (
                            <MapShapeEditor
                                onCreate={this.handlePolygonCreate}
                                onDelete={this.handlePolygonDelete}
                                onUpdate={this.handlePolygonUpdate}
                                onModeChange={this.handleModeChange}

                                geoJsons={this.getGeoJsonsFromPolygons(polygons)}
                            />
                        )}
                        {myGeoJson && (
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
                        {!editMode && polygonCollection && myGeoJson && (
                            <MapSource
                                sourceKey="polygons"
                                sourceOptions={sourceOptions}
                                geoJson={polygonCollection}
                            >
                                <MapLayer
                                    layerKey="fill"
                                    layerOptions={geoJsonFillOptions}
                                    onClick={editMode ? undefined : this.handlePolygonClick}
                                    onMouseEnter={editMode ? undefined : this.handleMouseEnter}
                                    onMouseLeave={editMode ? undefined : this.handleMouseLeave}
                                />
                                <MapLayer
                                    layerKey="line"
                                    layerOptions={geoJsonLineOptions}
                                />
                                <MapLayer
                                    layerKey="circle"
                                    layerOptions={geoJsonCircleOptions}
                                    onClick={editMode ? undefined : this.handlePolygonClick}
                                    onMouseEnter={editMode ? undefined : this.handleMouseEnter}
                                    onMouseLeave={editMode ? undefined : this.handleMouseLeave}
                                />
                            </MapSource>
                        )}
                    </Map>
                </div>
            </div>
        );
    }
}
