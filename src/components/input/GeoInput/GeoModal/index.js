import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import SelectInput from '#rsci/SelectInput';
import MultiSelectInput from '#rsci/MultiSelectInput';
import ListInput from '#rsci/ListInput';
import { FaramInputElement } from '#rscg/FaramElements';
import { listToMap } from '#rsu/common';
import _ts from '#ts';
import _cs from '#cs';

import RegionMap from '#components/geo/RegionMap';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string,
    geoOptionsByRegion: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    adminLevelsById: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    adminLevelTitlesById: PropTypes.object, // eslint-disable-line react/forbid-prop-types
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
    adminLevelsById: {},
    adminLevelTitlesById: {},
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

    constructor(props) {
        super(props);

        // Set default selectedRegion to the first region
        const { regions } = props;
        let selectedRegion;
        if (regions.length > 0) {
            selectedRegion = regions[0].id;
        }

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

    getOptionsForSelectedAdminLevels = memoize((selectedRegion, selectedAdminLevel) => {
        const { adminLevelsById, geoOptionsByRegion } = this.props;
        const selectedRegionAdminLevels = adminLevelsById[selectedRegion];
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

    // calcValueState = (props, selectedRegion)
    calcValueState = ({ value: originalValue, geoOptionsById }, selectedRegion) => {
        const adminLevels = {};
        const value = originalValue.filter(v => (
            geoOptionsById[v] &&
            geoOptionsById[v].region === selectedRegion
        ));

        const groupMap = value.reduce(
            (acc, v) => {
                const geoOption = geoOptionsById[v];
                if (!acc[geoOption.adminLevel]) {
                    acc[geoOption.adminLevel] = [v];
                    adminLevels[geoOption.adminLevel] = geoOption.adminLevelTitle;
                } else {
                    acc[geoOption.adminLevel].push(v);
                }
                return acc;
            },
            {},
        );

        const groupedValue = Object.entries(adminLevels)
            .sort(l => l[0] - l[1])
            .map(al => ({
                level: al[0],
                title: al[1],
                value: groupMap[al[0]],
            }));

        return {
            value,
            groupedValue,
            selectedRegion,
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
        const {
            value,
            selectedRegion,
            selectedAdminLevel,
        } = this.state;

        const { optionsForSelectedAdminLevelsMap } = this.getOptionsForSelectedAdminLevels(
            selectedRegion,
            selectedAdminLevel,
        );
        const filteredValues = value.filter(o => !optionsForSelectedAdminLevelsMap[o]);
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

    handleGroupValueChange = (adminLevel, groupValue) => {
        const { groupedValue } = this.state;
        const regionValue = groupedValue.reduce((acc, group) => {
            if (group.level === adminLevel) {
                return [...acc, ...groupValue];
            }

            return [...acc, ...group.value];
        }, []);

        this.handleRegionValueChange(regionValue);
    }

    geoValueLabelSelector = v => GeoModal.geoOptionLabelSelector(this.props.geoOptionsById[v]);
    geoValueKeySelector = v => v;

    renderGroupSelectionList = ({ selection }) => (
        <div className={styles.selectionGroup}>
            <div className={styles.title}>
                {selection.title}
            </div>
            <ListInput
                onChange={value => this.handleGroupValueChange(selection.level, value)}
                value={selection.value}
                labelSelector={this.geoValueLabelSelector}
                keySelector={this.geoValueKeySelector}
            />
        </div>
    )

    render() {
        const {
            regions,
            title,
            modalLeftComponent,
            adminLevelTitlesById,
        } = this.props;

        const {
            value,
            selectedRegion,
            groupedValue,
            selectedAdminLevel,
        } = this.state;

        const GroupSelectionList = this.renderGroupSelectionList;
        const {
            optionsForSelectedAdminLevels,
            optionsForSelectedAdminLevelsMap,
        } = this.getOptionsForSelectedAdminLevels(
            selectedRegion,
            selectedAdminLevel,
        );
        const filteredValues = value.filter(o => !!optionsForSelectedAdminLevelsMap[o]);

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
                                showHintAndError={false}
                            />
                            <div className={styles.leftInputs} >
                                <MultiSelectInput
                                    label={_ts('components.geo.geoModal', 'adminLevelLabel')}
                                    className={styles.selectInput}
                                    options={adminLevelTitlesById[selectedRegion]}
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
                        {groupedValue.map(v => (
                            // FIXME: use List
                            <GroupSelectionList
                                key={v.level}
                                selection={v}
                            />
                        ))}
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
