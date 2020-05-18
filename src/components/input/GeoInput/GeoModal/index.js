import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import {
    listToMap,
    unique,
    listToGroupList,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import SelectInput from '#rsci/SelectInput';
import MultiSelectInput from '#rsci/MultiSelectInput';
import SearchMultiSelectInput from '#rsci/SearchMultiSelectInput';

import {
    RequestClient,
    methods,
} from '#request';
import _ts from '#ts';
import _cs from '#cs';

import RegionMap from '#components/geo/RegionMap';

import PolygonPropertiesModal from './PolygonPropertiesModal';
import GeoInputList from './GeoInputList';

import styles from './styles.scss';

function groupList(
    list,
    keySelector,
    modifier,
) {
    if (isNotDefined(list)) {
        return [];
    }
    const mapping = list.reduce(
        (acc, elem, i) => {
            const key = keySelector(elem);
            const value = modifier
                ? modifier(elem, key, i, acc)
                : elem;
            if (acc[key]) {
                acc[key].values.push(value);
            } else {
                acc[key] = {
                    key,
                    values: [value],
                };
            }
            return acc;
        },
        {},
    );
    return Object.values(mapping);
}


const requestOptions = {
    intersectRequest: {
        url: ({ params }) => `/regions/${params.regionId}/intersects/`,
        body: ({ params }) => params.featureCollection,
        method: methods.POST,
        onSuccess: ({
            response,
            params,
        }) => {
            params.updatePolygons(response);
        },
    },
};


const MAX_DISPLAY_OPTIONS = 100;

const propTypes = {
    title: PropTypes.string,
    geoOptionsByRegion: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    geoOptionsById: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    selections: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    polygons: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    onApply: PropTypes.func,
    onCancel: PropTypes.func,
    modalLeftComponent: PropTypes.node,
    polygonsEnabled: PropTypes.bool,
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    title: undefined,
    geoOptionsByRegion: {},
    geoOptionsById: {},
    selections: [],
    polygons: [],
    onApply: undefined,
    onCancel: undefined,
    modalLeftComponent: undefined,
    polygonsEnabled: false,
};


@FaramInputElement
@RequestClient(requestOptions)
export default class GeoModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // Selector for regions
    static regionKeySelector = d => d.id;
    static regionLabelSelector = d => d.title;

    // Selector for polygon
    static polygonKeySelector = p => p.geoJson.id;
    static polygonGroupKeySelector = p => p.type;

    // Selector for geo options
    static geoOptionKeySelector = option => option.key;
    static geoOptionLabelSelector = option => option.title;
    static geoOptionLongLabelSelector = option => option.label;

    static groupKeySelector = option => option.adminLevel;

    constructor(props) {
        super(props);

        const {
            regions,
            selections,
            polygons,
        } = props;

        // NOTE: Set default selectedRegion to the first region
        const selectedRegion = regions.length > 0
            ? regions[0].id
            : undefined;

        this.state = {
            selections,
            polygons,
            selectedRegion,
            selectedAdminLevel: [],

            selectedPolygonInfo: undefined,
            showPolygonEditModal: false,

            editMode: false,
        };
    }

    // NOTE: Iterate over geoOptions for selectedRegion and get unique admin levels
    getAdminLevelTitles = memoize((geoOptionsByRegion, selectedRegion) => {
        const geoOptions = geoOptionsByRegion[selectedRegion];
        if (!geoOptions) {
            return [];
        }

        const adminLevelTitles = unique(
            geoOptions,
            geoOption => geoOption.adminLevel,
        ).map(geoOption => ({
            key: geoOption.adminLevel,
            title: geoOption.adminLevelTitle,
        }));
        return adminLevelTitles;
    })

    // NOTE: get geoOptions for current region and currently selected admin levels
    getOptionsForSelectedAdminLevels = memoize((
        geoOptionsByRegion,
        selectedRegion,
        selectedAdminLevel,
    ) => {
        const geoOptions = geoOptionsByRegion[selectedRegion];
        if (!geoOptions) {
            return [];
        }
        if (selectedAdminLevel.length <= 0) {
            return geoOptions;
        }

        const adminLevelMapping = listToMap(
            selectedAdminLevel,
            al => al,
            () => true,
        );

        return geoOptions.filter(
            geoOption => adminLevelMapping[geoOption.adminLevel],
        );
    })

    getSelectionsForSelectedRegion = memoize((
        geoOptionsById,
        selectedRegion,
        selections,
    ) => (
        selections.filter(v => (geoOptionsById[v] && geoOptionsById[v].region === selectedRegion))
    ))

    getPolygonsForSelectedRegion = memoize((selectedRegion, polygons) => (
        polygons.filter(polygon => polygon.region === selectedRegion)
    ))

    getSelectionsForSelectedAdminLevels = memoize((
        optionsForSelectedAdminLevelsMap,
        selectionsForSelectedRegion,
    ) => (
        selectionsForSelectedRegion.filter(v => !!optionsForSelectedAdminLevelsMap[v])
    ))

    // NOTE: get list of options that are selected
    getMappedSelectionsForSelectedRegion = memoize((
        geoOptionsById,
        selectionsForSelectedRegion,
    ) => (
        selectionsForSelectedRegion.map(v => geoOptionsById[v])
    ))

    // TOP BAR

    handleRegionChange = (selectedRegion) => {
        this.setState({
            selectedRegion,
            selectedAdminLevel: [],
            editMode: false,
        });
    }

    handleAdminLevelChange = (selectedAdminLevel) => {
        this.setState({ selectedAdminLevel });
    }

    handleSelectionsChangeForAdminLevels = (selectionsForSelectedAdminLevels) => {
        const {
            geoOptionsById,
            geoOptionsByRegion,
        } = this.props;

        const {
            selections,
            selectedRegion,
            selectedAdminLevel,
        } = this.state;

        const selectionsForSelectedRegion = this.getSelectionsForSelectedRegion(
            geoOptionsById,
            selectedRegion,
            selections,
        );

        const optionsForSelectedAdminLevels = this.getOptionsForSelectedAdminLevels(
            geoOptionsByRegion,
            selectedRegion,
            selectedAdminLevel,
        );

        const optionsForSelectedAdminLevelsMap = listToMap(
            optionsForSelectedAdminLevels,
            item => item.key,
            item => item,
        );

        const selectionsExceptForSelectedAdminLevels = selectionsForSelectedRegion.filter(
            v => !optionsForSelectedAdminLevelsMap[v],
        );

        this.handleSelectionsChangeForRegion([
            ...selectionsForSelectedAdminLevels,
            ...selectionsExceptForSelectedAdminLevels,
        ]);
    }

    // MAP

    handleSelectionsChangeForRegion = (selectionsForSelectedRegion) => {
        const { selections, selectedRegion } = this.state;
        const { geoOptionsById } = this.props;

        const selectionsExceptForSelectedRegion = selections
            .filter(v => (!geoOptionsById[v] || geoOptionsById[v].region !== selectedRegion));

        this.setState({
            selections: [
                ...selectionsExceptForSelectedRegion,
                ...selectionsForSelectedRegion,
            ],
        });
    }

    handlePolygonsChangeForRegion = (polygonsForSelectedRegion) => {
        const {
            polygons,
            selectedRegion,
        } = this.state;

        const {
            requests: {
                intersectRequest,
            },
        } = this.props;

        const filteredPolygons = polygonsForSelectedRegion
            .filter(item => item.type === 'Polygon')
            .map(item => item.geoJson);

        if (filteredPolygons && filteredPolygons.length > 0) {
            // NOTE: get good diff-ing algorithm here

            intersectRequest.do({
                regionId: selectedRegion,
                featureCollection: {
                    type: 'FeatureCollection',
                    features: filteredPolygons,
                },
                updatePolygons: (responsePolygons) => {
                    this.setState(
                        (state) => {
                            const { polygons: statePolygons } = state;
                            // FIXME: use immer
                            const newStatePolygons = statePolygons.map((statePolygon) => {
                                const responsePolygon = responsePolygons.find(
                                    polygon => polygon.id === statePolygon.geoJson.id,
                                );
                                if (
                                    !responsePolygon
                                    || responsePolygon.regionId !== statePolygon.region
                                ) {
                                    return statePolygon;
                                }
                                return {
                                    ...statePolygon,
                                    geoJson: {
                                        ...statePolygon.geoJson,
                                        properties: {
                                            ...statePolygon.geoJson.properties,
                                            geoareas: responsePolygon.geoareas,
                                        },
                                    },
                                };
                            });
                            return {
                                ...state,
                                polygons: newStatePolygons,
                            };
                        },
                        () => {
                            console.warn(this.state.polygons);
                        },
                    );
                },
            });
        }

        const polygonsExceptForSelectedRegion = polygons
            .filter(polygon => polygon.region !== selectedRegion);

        this.setState({
            polygons: [
                ...polygonsExceptForSelectedRegion,
                ...polygonsForSelectedRegion,
            ],
        });
    }

    handlePolygonClick = (polygon) => {
        this.setState({
            selectedPolygonInfo: polygon,
            showPolygonEditModal: true,
        });
    }

    handleEditStart = () => {
        this.setState({ editMode: true });
    }

    handleEditEnd = () => {
        this.setState({ editMode: false });
    }

    // MODAL

    handleModalCancel = () => {
        this.setState({
            selectedPolygonInfo: undefined,
            showPolygonEditModal: false,
        });
    }

    handleModalSave = (polygon) => {
        const { polygons } = this.state;
        const index = polygons.findIndex(p => p.geoJson.id === polygon.geoJson.id);
        if (index === -1) {
            console.error('Could not find index for polygon', polygon);
            return;
        }

        const newPolygons = [...polygons];
        newPolygons[index] = polygon;

        this.setState({
            selectedPolygonInfo: undefined,
            showPolygonEditModal: false,
            polygons: newPolygons,
        });
    }

    // FOOTER

    handleCancelClick = () => {
        const { onCancel } = this.props;
        if (onCancel) {
            onCancel();
        }
    }

    handleApplyClick = () => {
        const { onApply } = this.props;
        const { selections, polygons } = this.state;
        if (onApply) {
            onApply(selections, polygons);
        }
    }

    render() {
        const {
            regions,
            title = _ts('components.geo.geoModal', 'title'),
            modalLeftComponent,
            geoOptionsByRegion,
            geoOptionsById,
            polygonsEnabled,
            requests: {
                intersectRequest: {
                    pending,
                    // response,
                    responseError,
                },
            },
        } = this.props;

        const {
            selectedRegion,
            selectedAdminLevel,
            selections,
            polygons,

            selectedPolygonInfo,
            showPolygonEditModal,

            editMode,
        } = this.state;

        const polygonsForSelectedRegion = this.getPolygonsForSelectedRegion(
            selectedRegion,
            polygons,
        );

        const adminLevelTitles = this.getAdminLevelTitles(
            geoOptionsByRegion,
            selectedRegion,
        );

        const optionsForSelectedAdminLevels = this.getOptionsForSelectedAdminLevels(
            geoOptionsByRegion,
            selectedRegion,
            selectedAdminLevel,
        );

        const selectionsForSelectedRegion = this.getSelectionsForSelectedRegion(
            geoOptionsById,
            selectedRegion,
            selections,
        );

        // FIXME: move this inside getSelectionsForSelectedAdminLevels
        const optionsForSelectedAdminLevelsMap = listToMap(
            optionsForSelectedAdminLevels,
            item => item.key,
            item => item,
        );

        // NOTE: for value
        const selectionsForSelectedAdminLevels = this.getSelectionsForSelectedAdminLevels(
            optionsForSelectedAdminLevelsMap,
            selectionsForSelectedRegion,
        );

        // NOTE: for viewing
        const mappedSelectionsForSelectedRegion = this.getMappedSelectionsForSelectedRegion(
            geoOptionsById,
            selectionsForSelectedRegion,
        );

        /*
        const selectionsMapping = listToMap(
            selections,
            selection => selection,
            () => true,
        );
        const autoSelectionsForSelectedRegion = polygons
            .filter(polygon => isDefined(polygon.geoJson.properties.geoareas))
            .map(
                polygon => polygon.geoJson.properties.geoareas.map(
                    geoarea => ({
                        id: geoarea,
                        geoJson: polygon.geoJson,
                    }),
                ),
            )
            .flat()
            .filter(item => selectionsMapping[item.id]);

        const autoSelectionsGrouped = groupList(
            autoSelectionsForSelectedRegion,
            e => e.id,
            e => e.geoJson,
        );
        console.warn(autoSelectionsGrouped);
        */

        return (
            <Modal
                className={_cs(
                    styles.geoModal,
                    modalLeftComponent && styles.hasLeft,
                )}
            >
                <ModalHeader title={title} />
                <ModalBody className={styles.body}>
                    {modalLeftComponent && (
                        <div className={styles.left}>
                            {modalLeftComponent}
                        </div>
                    )}
                    <div className={styles.mapWrapper}>
                        <div className={styles.selectInputs}>
                            <SelectInput
                                label={_ts('components.geo.geoModal', 'regionLabel')}
                                options={regions}
                                className={styles.selectInput}
                                keySelector={GeoModal.regionKeySelector}
                                labelSelector={GeoModal.regionLabelSelector}
                                onChange={this.handleRegionChange}
                                value={selectedRegion}
                                hideClearButton
                                showHintAndError={false}
                                disabled={pending || !!responseError}
                            />
                            <div className={styles.leftInputs} >
                                <MultiSelectInput
                                    label={_ts('components.geo.geoModal', 'adminLevelLabel')}
                                    className={styles.selectInput}
                                    options={adminLevelTitles}
                                    labelSelector={GeoModal.geoOptionLabelSelector}
                                    keySelector={GeoModal.geoOptionKeySelector}
                                    onChange={this.handleAdminLevelChange}
                                    value={selectedAdminLevel}
                                    showHintAndError={false}
                                />

                                <SearchMultiSelectInput
                                    label={_ts('components.geo.geoModal', 'geoAreasLabel')}
                                    className={styles.selectInput}
                                    options={optionsForSelectedAdminLevels}
                                    labelSelector={GeoModal.geoOptionLongLabelSelector}
                                    keySelector={GeoModal.geoOptionKeySelector}
                                    onChange={this.handleSelectionsChangeForAdminLevels}
                                    value={selectionsForSelectedAdminLevels}
                                    showHintAndError={false}
                                    placeholder={_ts('components.geo.geoModal', 'geoAreasPlaceholder')}
                                    maxDisplayOptions={MAX_DISPLAY_OPTIONS}
                                    // hideSelectAllButton
                                />
                            </div>
                        </div>
                        <RegionMap
                            className={_cs(
                                styles.map,
                                modalLeftComponent && styles.hasLeft,
                            )}
                            editMode={editMode}

                            regionId={selectedRegion}

                            selections={selectionsForSelectedRegion}
                            onSelectionsChange={this.handleSelectionsChangeForRegion}

                            polygons={polygonsForSelectedRegion}
                            polygonsEnabled={polygonsEnabled}
                            onPolygonsChange={this.handlePolygonsChangeForRegion}
                            onPolygonClick={this.handlePolygonClick}
                            onPolygonEditStart={this.handleEditStart}
                            onPolygonEditEnd={this.handleEditEnd}
                        />
                        {showPolygonEditModal && selectedPolygonInfo && (
                            <PolygonPropertiesModal
                                value={selectedPolygonInfo}
                                onSave={this.handleModalSave}
                                onClose={this.handleModalCancel}
                            />
                        )}
                    </div>
                    <GeoInputList
                        className={styles.right}
                        header={_ts('components.geo.geoModal', 'listHeading')}

                        selections={selectionsForSelectedRegion}
                        mappedSelections={mappedSelectionsForSelectedRegion}
                        polygons={polygonsForSelectedRegion}
                        adminLevelTitles={adminLevelTitles}

                        onSelectionsChange={this.handleSelectionsChangeForRegion}
                        onPolygonsChange={this.handlePolygonsChangeForRegion}

                        onPolygonEditClick={this.handlePolygonClick}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleCancelClick} >
                        {_ts('components.geo.geoModal', 'cancelButtonLabel')}
                    </Button>
                    <PrimaryButton
                        onClick={this.handleApplyClick}
                        disabled={pending || !!responseError}
                    >
                        {_ts('components.geo.geoModal', 'applyButtonLabel')}
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}
