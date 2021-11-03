import PropTypes from 'prop-types';
import React, { useState, useMemo, useCallback } from 'react';
import produce from 'immer';
import {
    _cs,
    listToMap,
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

import RegionMap from '#components/geo/RegionMap';

import PolygonPropertiesModal from './PolygonPropertiesModal';
import GeoInputList from './GeoInputList';

import styles from './styles.scss';

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
    adminLevelTitles: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    title: undefined,
    geoOptionsByRegion: {},
    geoOptionsById: {},
    selections: [],
    polygons: [],
    adminLevelTitles: [],
    onApply: undefined,
    onCancel: undefined,
    modalLeftComponent: undefined,
    polygonsEnabled: false,
};

// Selector for regions
const regionKeySelector = d => d.id;
const regionLabelSelector = d => d.title;

// Selector for polygon
const polygonKeySelector = p => p.geoJson.id;

// Selector for geo options
const geoOptionKeySelector = option => option.key;
const geoOptionLabelSelector = option => option.title;
const geoOptionLongLabelSelector = option => option.label;

function GeoModal(props) {
    const {
        title = _ts('components.geo.geoModal', 'title'),
        modalLeftComponent,
        geoOptionsByRegion,
        geoOptionsById,
        polygonsEnabled,
        requests: {
            intersectRequest,
        },

        onCancel,
        onApply,

        selections: selectionsFromProps,
        polygons: polygonsFromProps,
        regions,

        adminLevelTitles,
    } = props;

    const {
        pending,
        // response,
        responseError,
    } = intersectRequest;

    const [selectedRegion, setSelectedRegion] = useState(() => (
        regions.length > 0 ? regions[0].id : undefined
    ));
    const [selections, setSelections] = useState(selectionsFromProps);
    const [polygons, setPolygons] = useState(polygonsFromProps);

    const [selectedAdminLevel, setSelectedAdminLevel] = useState([]); // FIXME: change name
    const [selectedPolygonInfo, setSelectedPolygonInfo] = useState(undefined);
    const [showPolygonEditModal, setShowPolygonEditModal] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const selectedAdminLevelTitles = useMemo(() => (
        adminLevelTitles.filter(adminLevel => adminLevel.regionKey === selectedRegion)
    ), [adminLevelTitles, selectedRegion]);

    const geoOptionsForSelectedRegion = geoOptionsByRegion[selectedRegion];

    const selectionsForSelectedRegion = useMemo(
        () => {
            const filteredSelections = selections.filter(v => (
                geoOptionsById[v] && geoOptionsById[v].region === selectedRegion
            ));
            return filteredSelections;
        },
        [geoOptionsById, selectedRegion, selections],
    );

    const polygonsForSelectedRegion = useMemo(
        () => {
            const filteredPolygons = polygons.filter(
                polygon => polygon.region === selectedRegion,
            );
            return filteredPolygons;
        },
        [selectedRegion, polygons],
    );

    const geoOptionsForSelectedAdminLevels = useMemo(
        () => {
            if (!geoOptionsForSelectedRegion) {
                return [];
            }
            if (!selectedAdminLevel || selectedAdminLevel.length <= 0) {
                return geoOptionsForSelectedRegion;
            }

            // NOTE: get geoOptions for current region and currently selected
            // admin levels
            const adminLevelMapping = listToMap(
                selectedAdminLevel,
                al => al,
                () => true,
            );

            return geoOptionsForSelectedRegion.filter(
                geoOption => adminLevelMapping[geoOption.adminLevel],
            );
        },
        [geoOptionsForSelectedRegion, selectedAdminLevel],
    );

    const selectionsForSelectedAdminLevels = useMemo(
        () => {
            const geoOptionsForSelectedAdminLevelsMap = listToMap(
                geoOptionsForSelectedAdminLevels,
                item => item.key,
                item => item,
            );

            const filteredSelections = selectionsForSelectedRegion.filter(
                v => !!geoOptionsForSelectedAdminLevelsMap[v],
            );
            return filteredSelections;
        },
        [geoOptionsForSelectedAdminLevels, selectionsForSelectedRegion],
    );

    // top bar

    const handleRegionChange = useCallback(
        (region) => {
            setSelectedRegion(region);
            setSelectedAdminLevel([]);
            setEditMode(false);
        },
        [],
    );

    // map

    const handlePolygonEditStart = useCallback(
        () => {
            setEditMode(true);
        },
        [],
    );

    const handlePolygonEditEnd = useCallback(
        () => {
            setEditMode(false);
        },
        [],
    );

    // misc

    const handlePolygonPropertiesUpdate = useCallback(
        (polygonsProperties) => {
            setPolygons(statePolygons => statePolygons.map((statePolygon) => {
                const polygonProperties = polygonsProperties.find(
                    p => p.id === polygonKeySelector(statePolygon),
                );
                if (
                    !polygonProperties
                    || polygonProperties.regionId !== statePolygon.region
                ) {
                    return statePolygon;
                }

                return produce(statePolygon, (safePolygon) => {
                    // eslint-disable-next-line no-param-reassign
                    safePolygon.geoJson.properties.geoareas = polygonProperties.geoareas;
                });
            }));
        },
        [],
    );

    const handlePolygonsChangeForRegion = useCallback(
        (newPolygonsForSelectedRegion) => {
            // NOTE: get good diff-ing algorithm here
            const filteredPolygons = newPolygonsForSelectedRegion
                .filter(item => item.type === 'Polygon')
                .map(item => item.geoJson);
            if (filteredPolygons && filteredPolygons.length > 0) {
                intersectRequest.do({
                    regionId: selectedRegion,
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: filteredPolygons,
                    },
                    updatePolygons: handlePolygonPropertiesUpdate,
                });
            }

            const polygonsExceptForSelectedRegion = polygons
                .filter(polygon => polygon.region !== selectedRegion);

            setPolygons([
                ...polygonsExceptForSelectedRegion,
                ...newPolygonsForSelectedRegion,
            ]);
        },
        [polygons, selectedRegion, handlePolygonPropertiesUpdate, intersectRequest],
    );

    const handleSelectionsChangeForRegion = useCallback(
        (newSelectionsForSelectedRegion) => {
            const selectionsExceptForSelectedRegion = selections
                .filter(v => (!geoOptionsById[v] || geoOptionsById[v].region !== selectedRegion));

            setSelections([
                ...selectionsExceptForSelectedRegion,
                ...newSelectionsForSelectedRegion,
            ]);
        },
        [geoOptionsById, selectedRegion, selections],
    );

    const handleSelectionsChangeForAdminLevels = useCallback(
        (newSelectionsForSelectedAdminLevels) => {
            const geoOptionsForSelectedAdminLevelsMap = listToMap(
                geoOptionsForSelectedAdminLevels,
                item => item.key,
                item => item,
            );
            const selectionsExceptForSelectedAdminLevels = selectionsForSelectedRegion.filter(
                v => !geoOptionsForSelectedAdminLevelsMap[v],
            );

            handleSelectionsChangeForRegion([
                ...selectionsExceptForSelectedAdminLevels,
                ...newSelectionsForSelectedAdminLevels,
            ]);
        },
        [
            geoOptionsForSelectedAdminLevels, handleSelectionsChangeForRegion,
            selectionsForSelectedRegion,
        ],
    );

    // polygon properties modal

    const handlePolygonClick = useCallback(
        (polygon) => {
            setSelectedPolygonInfo(polygon);
            setShowPolygonEditModal(true);
        },
        [],
    );

    const handlePolygonModalCancel = useCallback(
        () => {
            setSelectedPolygonInfo(undefined);
            setShowPolygonEditModal(false);
        },
        [],
    );

    const handlePolygonModalSave = useCallback(
        (polygon) => {
            const index = polygons.findIndex(
                p => polygonKeySelector(p) === polygonKeySelector(polygon),
            );
            if (index === -1) {
                console.error('Could not find index for polygon', polygon);
                return;
            }

            const newPolygons = [...polygons];
            newPolygons[index] = polygon;

            setSelectedPolygonInfo(undefined);
            setShowPolygonEditModal(false);
            setPolygons(newPolygons);
        },
        [polygons],
    );

    // modal

    const handleCancelClick = useCallback(
        () => {
            if (onCancel) {
                onCancel();
            }
        },
        [onCancel],
    );

    const handleApplyClick = useCallback(
        () => {
            if (onApply) {
                onApply(selections, polygons);
            }
        },
        [onApply, polygons, selections],
    );

    return (
        <Modal
            className={_cs(
                styles.geoModal,
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
                            keySelector={regionKeySelector}
                            labelSelector={regionLabelSelector}
                            onChange={handleRegionChange}
                            value={selectedRegion}
                            hideClearButton
                            showHintAndError={false}
                            disabled={pending || !!responseError}
                        />
                        <div className={styles.leftInputs}>
                            <MultiSelectInput
                                label={_ts('components.geo.geoModal', 'adminLevelLabel')}
                                className={styles.selectInput}
                                options={selectedAdminLevelTitles}
                                labelSelector={geoOptionLabelSelector}
                                keySelector={geoOptionKeySelector}
                                onChange={setSelectedAdminLevel}
                                value={selectedAdminLevel}
                                showHintAndError={false}
                            />

                            <SearchMultiSelectInput
                                label={_ts('components.geo.geoModal', 'geoAreasLabel')}
                                className={styles.selectInput}
                                options={geoOptionsForSelectedAdminLevels}
                                labelSelector={geoOptionLongLabelSelector}
                                keySelector={geoOptionKeySelector}
                                onChange={handleSelectionsChangeForAdminLevels}
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
                        )}
                        editMode={editMode}

                        regionId={selectedRegion}

                        selections={selectionsForSelectedRegion}
                        onSelectionsChange={handleSelectionsChangeForRegion}

                        polygons={polygonsForSelectedRegion}
                        polygonsEnabled={polygonsEnabled}
                        onPolygonsChange={handlePolygonsChangeForRegion}
                        onPolygonClick={handlePolygonClick}
                        onPolygonEditStart={handlePolygonEditStart}
                        onPolygonEditEnd={handlePolygonEditEnd}
                    />
                    {showPolygonEditModal && selectedPolygonInfo && (
                        <PolygonPropertiesModal
                            value={selectedPolygonInfo}
                            onSave={handlePolygonModalSave}
                            onClose={handlePolygonModalCancel}
                        />
                    )}
                </div>
                <GeoInputList
                    className={styles.right}
                    header={_ts('components.geo.geoModal', 'listHeading')}

                    selections={selectionsForSelectedRegion}
                    geoOptionsById={geoOptionsById}
                    polygons={polygonsForSelectedRegion}
                    polygonsEnabled={polygonsEnabled}
                    adminLevelTitles={adminLevelTitles}

                    onSelectionsChange={handleSelectionsChangeForRegion}
                    onPolygonsChange={handlePolygonsChangeForRegion}

                    onPolygonEditClick={handlePolygonClick}
                />
            </ModalBody>
            <ModalFooter>
                <Button onClick={handleCancelClick} >
                    {_ts('components.geo.geoModal', 'cancelButtonLabel')}
                </Button>
                <PrimaryButton
                    onClick={handleApplyClick}
                    disabled={pending || !!responseError}
                >
                    {_ts('components.geo.geoModal', 'applyButtonLabel')}
                </PrimaryButton>
            </ModalFooter>
        </Modal>
    );
}
GeoModal.propTypes = propTypes;
GeoModal.defaultProps = defaultProps;

export default FaramInputElement(
    RequestClient(requestOptions)(
        GeoModal,
    ),
);
