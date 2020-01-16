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
import SearchMultiSelectInput from '#rsci/SearchMultiSelectInput';
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
    onChange: PropTypes.func,
    onApply: PropTypes.func,
    onCancel: PropTypes.func,
    modalLeftComponent: PropTypes.node,
};

const defaultProps = {
    title: '',
    geoOptionsByRegion: {},
    geoOptionsById: {},
    value: [],
    onChange: undefined,
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

        // Set default selectedRegion to the first region
        const { regions } = props;
        const selectedRegion = regions.length > 0 ? regions[0].id : undefined;

        // Calculate state from initial value
        this.state = {
            ...this.calcValueState(props, selectedRegion),
            selectedRegion,
            selectedAdminLevel: [],
        };
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.value !== nextProps.value ||
            this.props.geoOptionsByRegion !== nextProps.geoOptionsByRegion
        ) {
            this.setState(this.calcValueState(nextProps, this.state.selectedRegion));
        }
    }

    getAdminLevels = memoize((geoOptionsByRegion, selectedRegion) => {
        if (!geoOptionsByRegion[selectedRegion]) {
            return {};
        }
        const adminLevelsById = listToGroupList(
            geoOptionsByRegion[selectedRegion],
            geoOption => geoOption.adminLevel,
        );
        return adminLevelsById;
    })

    getAdminLevelTitles = memoize((geoOptionsByRegion, selectedRegion) => {
        if (!geoOptionsByRegion[selectedRegion]) {
            return [];
        }
        const adminLevelTitles = unique(
            geoOptionsByRegion[selectedRegion],
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
        const selectedRegionAdminLevels = this.getAdminLevels(geoOptionsByRegion, selectedRegion);
        let optionsForSelectedAdminLevels = [];
        if (selectedAdminLevel.length > 0) {
            selectedAdminLevel.forEach((adminLevel) => {
                optionsForSelectedAdminLevels = optionsForSelectedAdminLevels
                    .concat(...selectedRegionAdminLevels[adminLevel]);
            });
        } else {
            optionsForSelectedAdminLevels = geoOptionsByRegion[selectedRegion];
        }
        const optionMap = listToMap(optionsForSelectedAdminLevels, d => d.key);
        return {
            optionsForSelectedAdminLevels,
            optionsForSelectedAdminLevelsMap: optionMap,
        };
    });

    getFilteredOutValues = (value, options) => (
        value.filter(o => !options[o])
    )

    getFilteredValues = (value, options) => (
        value.filter(o => !!options[o])
    )

    calcValueState = ({ value: originalValue, geoOptionsById }, selectedRegion) => {
        const value = originalValue.filter(v => (
            geoOptionsById[v] &&
            geoOptionsById[v].region === selectedRegion
        ));

        const valueMap = value.map(v => geoOptionsById[v]);

        return {
            value,
            selectedRegion,
            valueMap,
        };
    }

    handleCancelClick = () => {
        const { onCancel } = this.props;
        if (onCancel) {
            onCancel();
        }
    }

    handleApplyClick = () => {
        const { onApply } = this.props;
        if (onApply) {
            onApply();
        }
    }

    handleRegionChange = (selectedRegion) => {
        this.setState({
            ...this.calcValueState(this.props, selectedRegion),
            selectedAdminLevel: [],
        });
    }

    handleFilteredRegionValueChange = (regionValue) => {
        const { geoOptionsByRegion } = this.props;

        const {
            value,
            selectedRegion,
            selectedAdminLevel,
        } = this.state;

        const { optionsForSelectedAdminLevelsMap } = this.getOptionsForSelectedAdminLevels(
            geoOptionsByRegion,
            selectedRegion,
            selectedAdminLevel,
        );

        const filteredValues = this.getFilteredOutValues(
            value,
            optionsForSelectedAdminLevelsMap,
        );

        this.handleRegionValueChange([
            ...regionValue,
            ...filteredValues,
        ]);
    }

    handleRegionValueChange = (regionValue) => {
        const { onChange, value, geoOptionsById } = this.props;
        if (!onChange) {
            return;
        }
        const { selectedRegion } = this.state;
        const newValue = [
            ...value.filter(v => (
                (geoOptionsById[v] || emptyObject).region !== selectedRegion
            )),
            ...regionValue,
        ];
        onChange(newValue);
    }

    handleAdminLevelChange = (selectedAdminLevel) => {
        this.setState({ selectedAdminLevel });
    }

    handleGroupValueChange = (itemKey) => {
        const { value } = this.state;
        const { onChange } = this.props;

        const newValue = value.filter(v => v !== itemKey);
        onChange(newValue);
    }

    geoValueLabelSelector = v => GeoModal.geoOptionLabelSelector(this.props.geoOptionsById[v]);
    geoValueKeySelector = v => v;

    groupRendererParams = (groupKey) => {
        const { geoOptionsByRegion } = this.props;

        const { selectedRegion } = this.state;
        const adminLevelTitles = this.getAdminLevelTitles(
            geoOptionsByRegion,
            selectedRegion,
        );

        const adminLevel = adminLevelTitles.find(a => String(a.key) === String(groupKey));

        return {
            children: adminLevel ? adminLevel.title : '',
        };
    }

    listRendererParams = (key, geoOption) => ({
        className: styles.item,
        itemKey: key,
        onDismiss: this.handleGroupValueChange,
        value: geoOption.title,
    })

    render() {
        const {
            regions,
            title,
            modalLeftComponent,
            geoOptionsByRegion,
        } = this.props;

        const {
            value,
            valueMap,
            selectedRegion,
            selectedAdminLevel,
        } = this.state;

        const adminLevelTitles = this.getAdminLevelTitles(
            geoOptionsByRegion,
            selectedRegion,
        );

        const {
            optionsForSelectedAdminLevels,
            optionsForSelectedAdminLevelsMap,
        } = this.getOptionsForSelectedAdminLevels(
            geoOptionsByRegion,
            selectedRegion,
            selectedAdminLevel,
        );

        const filteredValues = this.getFilteredValues(
            value,
            optionsForSelectedAdminLevelsMap,
        );

        const geoModalClassName = _cs(
            styles.geoModal,
            modalLeftComponent && styles.hasLeft,
        );

        const mapClassName = _cs(
            styles.map,
            modalLeftComponent && styles.hasLeft,
        );

        return (
            <Modal className={geoModalClassName}>
                <ModalHeader title={title} />
                <ModalBody className={styles.body}>
                    {modalLeftComponent &&
                        <div className={styles.left}>
                            {modalLeftComponent}
                        </div>
                    }
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
                                    onChange={this.handleFilteredRegionValueChange}
                                    value={filteredValues}
                                    showHintAndError={false}
                                    placeholder={_ts('components.geo.geoModal', 'geoAreasPlaceholder')}
                                    maxDisplayOptions={MAX_DISPLAY_OPTIONS}
                                    // hideSelectAllButton
                                />
                            </div>
                        </div>
                        <RegionMap
                            className={mapClassName}
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
                            data={valueMap}
                            emptyComponent={EmptyComponent}
                            renderer={DismissableListItem}
                            rendererParams={this.listRendererParams}
                            keySelector={GeoModal.geoOptionKeySelector}
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
