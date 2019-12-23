import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import {
    listToMap,
    listToGroupList,
    unique,
} from '@togglecorp/fujs';

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
// import SearchMultiSelectInput from '#rsci/SearchMultiSelectInput';
import { FaramInputElement } from '@togglecorp/faram';
import _ts from '#ts';
import _cs from '#cs';

import RegionMap from '#components/geo/RegionMap';
import styles from './styles.scss';

const EmptyComponent = () => '';

const MAX_DISPLAY_OPTIONS = 100;

const propTypes = {
    title: PropTypes.string,
    geoOptionsByRegion: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    geoOptionsById: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    // onChange: PropTypes.func,
    onApply: PropTypes.func,
    onCancel: PropTypes.func,
    modalLeftComponent: PropTypes.node,
};

const defaultProps = {
    title: '',
    geoOptionsByRegion: {},
    geoOptionsById: {},
    value: [],
    // onChange: undefined,
    onApply: undefined,
    onCancel: undefined,
    modalLeftComponent: undefined,
};

const emptyObject = {};

@FaramInputElement
export default class GeoModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // Selector for regions
    static regionKeySelector = d => d.id;
    static regionLabelSelector = d => d.title;

    // Selector for geo options
    static geoOptionKeySelector = option => option.key;
    static geoOptionLabelSelector = option => option.title;
    static geoOptionLongLabelSelector = option => option.label;

    static groupKeySelector = option => option.adminLevel;

    constructor(props) {
        super(props);

        const { regions, value } = props;

        // NOTE: Set default selectedRegion to the first region
        const selectedRegion = regions.length > 0
            ? regions[0].id
            : undefined;

        this.state = {
            value,
            selectedRegion,
            selectedAdminLevel: [],
        };
    }

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

        return geoOptions.filter(geoOption => adminLevelMapping[geoOption.adminLevel]);
    });

    handleCancelClick = () => {
        const { onCancel } = this.props;
        if (onCancel) {
            onCancel();
        }
    }

    handleApplyClick = () => {
        const { onApply } = this.props;
        const { value } = this.state;
        if (onApply) {
            onApply(value);
        }
    }

    // State

    handleRegionChange = (selectedRegion) => {
        this.setState({
            selectedRegion,
            selectedAdminLevel: [],
        });
    }

    handleAdminLevelChange = (selectedAdminLevel) => {
        this.setState({ selectedAdminLevel });
    }

    // FIXME: simplify
    handleFilteredRegionValueChange = (regionValue) => {
        const { geoOptionsByRegion } = this.props;

        const {
            value,
            selectedRegion,
            selectedAdminLevel,
        } = this.state;

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

        const filteredValues = value.filter(
            v => !optionsForSelectedAdminLevelsMap[v],
        );

        this.handleRegionValueChange([
            ...regionValue,
            ...filteredValues,
        ]);
    }

    // FIXME: simplify
    handleRegionValueChange = (newValues) => {
        const { value, selectedRegion } = this.state;
        const { geoOptionsById } = this.props;
        const otherValues = value
            .filter(v => (
                !geoOptionsById[v] || geoOptionsById[v].region !== selectedRegion
            ));
        this.setState({
            value: [
                ...otherValues,
                ...newValues,
            ],
        });
    }

    handleItemDismiss = (itemKey) => {
        this.setState(state => ({
            ...state,
            value: state.value.filter(v => v !== itemKey),
        }));
    }

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
            value: unfilteredValue,
        } = this.state;

        const value = unfilteredValue
            .filter(v => (
                geoOptionsById[v] && geoOptionsById[v].region === selectedRegion
            ));

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

        const filteredValues = value.filter(
            v => !!optionsForSelectedAdminLevelsMap[v],
        );

        const optionsForValue = value.map(v => geoOptionsById[v]);

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

                                <MultiSelectInput
                                    label={_ts('components.geo.geoModal', 'geoAreasLabel')}
                                    className={styles.selectInput}
                                    options={optionsForSelectedAdminLevels}
                                    labelSelector={GeoModal.geoOptionLongLabelSelector}
                                    keySelector={GeoModal.geoOptionKeySelector}
                                    onChange={this.handleFilteredRegionValueChange}
                                    value={filteredValues}
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
                            onChange={this.handleRegionValueChange}
                            selections={value}
                        />
                    </div>
                    <div className={styles.right}>
                        <h3 className={styles.heading}>
                            {_ts('components.geo.geoModal', 'listHeading')}
                        </h3>
                        <ListView
                            data={optionsForValue}
                            emptyComponent={EmptyComponent}
                            keySelector={GeoModal.geoOptionKeySelector}
                            renderer={DismissableListItem}
                            rendererParams={this.listRendererParams}
                            groupKeySelector={GeoModal.groupKeySelector}
                            groupRendererParams={this.groupRendererParams}
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
