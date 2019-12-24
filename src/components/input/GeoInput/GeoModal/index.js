import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import {
    listToMap,
    unique,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import Button from '#rsca/Button';
import DismissableListItem from '#rsca/DismissableListItem';
import ListView from '#rscv/List/ListView';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import SelectInput from '#rsci/SelectInput';
import MultiSelectInput from '#rsci/MultiSelectInput';
import SearchMultiSelectInput from '#rsci/SearchMultiSelectInput';
import _ts from '#ts';
import _cs from '#cs';

import RegionMap from '#components/geo/RegionMap';

import PolygonPropertiesModal from './PolygonPropertiesModal';

import styles from './styles.scss';

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
};

const defaultProps = {
    // FIXME: use strings
    title: 'Select geo areas',
    geoOptionsByRegion: {},
    geoOptionsById: {},
    selections: [],
    polygons: [],
    onApply: undefined,
    onCancel: undefined,
    modalLeftComponent: undefined,
};

@FaramInputElement
export default class GeoModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // Selector for regions
    static regionKeySelector = d => d.id;
    static regionLabelSelector = d => d.title;

    // Selector for polygon
    static polygonKeySelector = p => p.localId;
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
        const { polygons, selectedRegion } = this.state;

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

    // MODAL

    handleModalCancel = () => {
        this.setState({
            selectedPolygonInfo: undefined,
            showPolygonEditModal: false,
        });
    }

    handleModalSave = (polygon) => {
        const { polygons } = this.state;
        const index = polygons.findIndex(p => p.localId === polygon.localId);
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

    // SIDEBAR LIST

    handlePolygonRemove = (localId) => {
        this.setState(state => ({
            ...state,
            polygons: state.polygons.filter(p => p.localId !== localId),
        }));
    }

    handlePolygonEdit = (localId) => {
        const { polygons } = this.state;
        const polygon = polygons.find(p => p.localId === localId);
        if (!polygon) {
            console.error('Could not find index for polygon localId', localId);
            return;
        }
        this.setState({
            selectedPolygonInfo: polygon,
            showPolygonEditModal: true,
        });
    }

    handleItemDismiss = (itemKey) => {
        this.setState(state => ({
            ...state,
            selections: state.selections.filter(v => v !== itemKey),
        }));
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

    // RENDERERS

    polygonGroupRendererParams = groupKey => ({
        children: groupKey,
    })

    polygonListRendererParams = (key, polygon) => ({
        className: styles.item,
        itemKey: key,
        onDismiss: this.handlePolygonRemove,
        onEdit: this.handlePolygonEdit,
        value: polygon.geoJson.properties.title,
        marker: null,
    })

    groupRendererParams = (groupKey) => {
        const { geoOptionsByRegion } = this.props;
        const { selectedRegion } = this.state;

        const adminLevelTitles = this.getAdminLevelTitles(
            geoOptionsByRegion,
            selectedRegion,
        );

        const adminLevel = adminLevelTitles.find(
            a => String(a.key) === String(groupKey),
        );

        return {
            children: adminLevel ? adminLevel.title : '',
        };
    }

    listRendererParams = (key, geoOption) => ({
        className: styles.item,
        itemKey: key,
        onDismiss: this.handleItemDismiss,
        value: geoOption.title,
    })

    render() {
        const {
            regions,
            title,
            modalLeftComponent,
            geoOptionsByRegion,
            geoOptionsById,
        } = this.props;

        const {
            selectedRegion,
            selectedAdminLevel,
            selections,
            polygons,

            selectedPolygonInfo,
            showPolygonEditModal,
        } = this.state;

        const adminLevelTitles = this.getAdminLevelTitles(
            geoOptionsByRegion,
            selectedRegion,
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

        const selectionsForSelectedRegion = this.getSelectionsForSelectedRegion(
            geoOptionsById,
            selectedRegion,
            selections,
        );

        const selectionsForSelectedAdminLevels = this.getSelectionsForSelectedAdminLevels(
            optionsForSelectedAdminLevelsMap,
            selectionsForSelectedRegion,
        );

        const mappedSelectionsForSelectedRegion = this.getMappedSelectionsForSelectedRegion(
            geoOptionsById,
            selectionsForSelectedRegion,
        );

        const polygonsForSelectedRegion = this.getPolygonsForSelectedRegion(
            selectedRegion,
            polygons,
        );

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
                                    hideSelectAllButton
                                />
                            </div>
                        </div>
                        <RegionMap
                            className={_cs(
                                styles.map,
                                modalLeftComponent && styles.hasLeft,
                            )}
                            regionId={selectedRegion}

                            selections={selectionsForSelectedRegion}
                            polygons={polygonsForSelectedRegion}

                            onSelectionsChange={this.handleSelectionsChangeForRegion}
                            onPolygonsChange={this.handlePolygonsChangeForRegion}

                            onPolygonClick={this.handlePolygonClick}
                        />
                        {showPolygonEditModal && selectedPolygonInfo && (
                            <PolygonPropertiesModal
                                value={selectedPolygonInfo}
                                onSave={this.handleModalSave}
                                onClose={this.handleModalCancel}
                            />
                        )}
                    </div>
                    <div className={styles.right}>
                        <h3 className={styles.heading}>
                            {_ts('components.geo.geoModal', 'listHeading')}
                        </h3>
                        <ListView
                            data={mappedSelectionsForSelectedRegion}
                            emptyComponent={null}
                            keySelector={GeoModal.geoOptionKeySelector}
                            renderer={DismissableListItem}
                            rendererParams={this.listRendererParams}
                            groupKeySelector={GeoModal.groupKeySelector}
                            groupRendererParams={this.groupRendererParams}
                        />
                        <ListView
                            data={polygonsForSelectedRegion}
                            emptyComponent={null}
                            keySelector={GeoModal.polygonKeySelector}
                            renderer={DismissableListItem}
                            rendererParams={this.polygonListRendererParams}
                            groupKeySelector={GeoModal.polygonGroupKeySelector}
                            groupRendererParams={this.polygonGroupRendererParams}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleCancelClick} >
                        {_ts('components.geo.geoModal', 'cancelButtonLabel')}
                    </Button>
                    <PrimaryButton onClick={this.handleApplyClick} >
                        {_ts('components.geo.geoModal', 'applyButtonLabel')}
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}
