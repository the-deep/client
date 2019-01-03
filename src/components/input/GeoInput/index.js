import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import AccentButton from '#rsca/Button/AccentButton';
import SelectInputWithList from '#rsci/SelectInputWithList';
import MultiSelectInput from '#rsci/MultiSelectInput';
import Label from '#rsci/Label';
import { FaramInputElement } from '#rscg/FaramElements';
import { iconNames } from '#constants';
import {
    listToMap,
    mapToList,
} from '#rsu/common';
import _cs from '#cs';

import GeoModal from './GeoModal';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func,
    geoOptionsByRegion: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    label: PropTypes.string,
    showLabel: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    hideList: PropTypes.bool,
    hideInput: PropTypes.bool,
    modalLeftComponent: PropTypes.node,
    emptyComponent: PropTypes.func,
    placeholder: PropTypes.string,
};

const defaultProps = {
    className: '',
    label: '',
    showLabel: true,
    onChange: undefined,
    geoOptionsByRegion: {},
    disabled: false,
    readOnly: false,
    hideList: false,
    hideInput: false,
    value: [],
    regions: [],
    modalLeftComponent: undefined,
    emptyComponent: undefined,
    placeholder: undefined,
};

const emptyArray = [];

@FaramInputElement
export default class GeoInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // Calculate the mapping from id to options for all geo options
    // Useful for fast reference
    static calcGeoOptionsById = (geoOptionsByRegion) => {
        const geoOptionsById = {};
        Object.keys(geoOptionsByRegion).forEach((region) => {
            const options = geoOptionsByRegion[region];
            if (!options) {
                return;
            }

            options.forEach((geoOption) => {
                geoOptionsById[geoOption.key] = geoOption;
            }, {});
        });

        return geoOptionsById;
    }

    static calcAdminLevelsById = (geoOptionsByRegion) => {
        const adminLevelsById = {};
        const adminLevelTitlesByIdMap = {};
        Object.keys(geoOptionsByRegion).forEach((region) => {
            const options = geoOptionsByRegion[region];
            if (!options) {
                return;
            }
            adminLevelsById[region] = {};
            adminLevelTitlesByIdMap[region] = {};

            options.forEach((option) => {
                if (!adminLevelTitlesByIdMap[region][option.adminLevel]) {
                    adminLevelTitlesByIdMap[region][option.adminLevel] = option.adminLevelTitle;
                }
                adminLevelsById[region][option.adminLevel] = [
                    option,
                    ...(adminLevelsById[region][option.adminLevel] || []),
                ];
            }, {});
        });
        const adminLevelTitlesById = {};
        Object.keys(adminLevelTitlesByIdMap).forEach((region) => {
            const adminLevels = mapToList(
                adminLevelTitlesByIdMap[region],
                (data, key) => ({
                    key,
                    title: data,
                }),
            );
            adminLevelTitlesById[region] = adminLevels;
        });

        return { adminLevelsById, adminLevelTitlesById };
    }

    static getAllGeoOptions = geoOptionsByRegion => (
        Object.values(geoOptionsByRegion).reduce((acc, r) => [...acc, ...r], [])
    )

    static getRegionDetails = memoize((regions = emptyArray, allRegions = emptyArray) => {
        const allRegionsMap = listToMap(allRegions, r => r.key);
        return regions.map(selectedRegion => allRegionsMap[selectedRegion]);
    });

    constructor(props) {
        super(props);

        // Calculate state from initial value
        this.geoOptionsById = GeoInput.calcGeoOptionsById(props.geoOptionsByRegion);

        const {
            adminLevelsById,
            adminLevelTitlesById,
        } = GeoInput.calcAdminLevelsById(props.geoOptionsByRegion);

        this.adminLevelsById = adminLevelsById;
        this.adminLevelTitlesById = adminLevelTitlesById;

        this.geoOptions = GeoInput.getAllGeoOptions(props.geoOptionsByRegion);
        this.state = {
            modalValue: props.value,
            showModal: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.geoOptionsByRegion !== nextProps.geoOptionsByRegion) {
            this.geoOptionsById = GeoInput.calcGeoOptionsById(nextProps.geoOptionsByRegion);
            const {
                adminLevelsById,
                adminLevelTitlesById,
            } = GeoInput.calcAdminLevelsById(nextProps.geoOptionsByRegion);

            this.adminLevelsById = adminLevelsById;
            this.adminLevelTitlesById = adminLevelTitlesById;

            this.geoOptions = GeoInput.getAllGeoOptions(nextProps.geoOptionsByRegion);
        }

        if (this.props.value !== nextProps.value) {
            this.setState({ modalValue: nextProps.value });
        }
    }

    handleModalApply = () => {
        const { onChange } = this.props;
        const { modalValue } = this.state;
        const detailedValue = GeoInput.getRegionDetails(modalValue, this.geoOptions);
        this.setState({ showModal: false }, () => {
            if (onChange) {
                onChange(modalValue, detailedValue);
            }
        });
    }

    handleModalCancel = () => {
        const { value: modalValue } = this.props;
        this.setState({ showModal: false, modalValue });
    }

    handleSelectChange = (newValues) => {
        const detailedValue = GeoInput.getRegionDetails(newValues, this.geoOptions);
        if (this.props.onChange) {
            this.props.onChange(newValues, detailedValue);
        }
    }

    handleModalValueChange = (modalValue) => {
        this.setState({ modalValue });
    }

    handleShowModal = () => {
        this.setState({ showModal: true });
    }

    valueLabelSelector = (v) => {
        const option = this.geoOptionsById[this.valueKeySelector(v)];
        if (this.props.regions.length > 0) {
            return `${option.regionTitle} / ${option.label}`;
        }
        return option.label;
    }

    valueKeySelector = v => v.key;

    renderGeoModal = () => {
        const {
            label,
            regions,
            geoOptionsByRegion,
            modalLeftComponent,
        } = this.props;
        const {
            showModal,
            modalValue,
        } = this.state;

        if (!showModal) {
            return null;
        }

        return (
            <GeoModal
                title={label}
                regions={regions}
                geoOptionsByRegion={geoOptionsByRegion}
                geoOptionsById={this.geoOptionsById}
                adminLevelsById={this.adminLevelsById}
                adminLevelTitlesById={this.adminLevelTitlesById}
                value={modalValue}
                onChange={this.handleModalValueChange}
                onApply={this.handleModalApply}
                onCancel={this.handleModalCancel}
                modalLeftComponent={modalLeftComponent}
            />
        );
    }

    renderShowModalButton = () => {
        const { disabled, readOnly } = this.props;

        return (
            <AccentButton
                className={styles.action}
                iconName={iconNames.globe}
                onClick={this.handleShowModal}
                disabled={disabled || readOnly}
                transparent
            />
        );
    }

    renderSelection = () => {
        /* TODO: Don't toggle between MultiSelect & SelectInputWithList
            Make a separate ListComponent and use that in SelectInputWithList
            Use that component to build custom SelectInputWithList to use in GeoInput
            and organigram input
        */
        const {
            value,
            disabled,
            readOnly,
            hideList,
            label,
            hideInput,
            placeholder,
        } = this.props;

        if (hideList || hideInput) {
            return (
                <div className={styles.noListSelection} >
                    {!hideInput &&
                        <MultiSelectInput
                            value={value}
                            onChange={this.handleSelectChange}
                            options={this.geoOptions}
                            labelSelector={this.valueLabelSelector}
                            keySelector={this.valueKeySelector}
                            showHintAndError={false}
                            hideSelectAllButton
                            disabled={disabled}
                            readOnly={readOnly}
                            placeholder={placeholder}
                        />
                    }
                    <AccentButton
                        className={styles.action}
                        iconName={iconNames.globe}
                        onClick={this.handleShowModal}
                        disabled={disabled || readOnly}
                        transparent
                    >
                        {hideInput && label}
                    </AccentButton>
                </div>
            );
        }

        return (
            <SelectInputWithList
                value={value}
                onChange={this.handleSelectChange}
                className={styles.selectInput}
                options={this.geoOptions}
                labelSelector={this.valueLabelSelector}
                keySelector={this.valueKeySelector}
                showHintAndError={false}
                topRightChild={this.renderShowModalButton}
                hideSelectAllButton
                disabled={disabled}
                readOnly={readOnly}
                emptyComponent={this.props.emptyComponent}
            />
        );
    }

    render() {
        const {
            label,
            showLabel,
            className: classNameFromProps,
        } = this.props;

        const GeoModalRender = this.renderGeoModal;
        const Selection = this.renderSelection;

        const className = _cs(
            classNameFromProps,
            styles.geoListInput,
            'geoListInput',
        );

        return (
            <div className={className}>
                {showLabel &&
                    <Label
                        show={showLabel}
                        text={label}
                    />
                }
                <Selection />
                <GeoModalRender />
            </div>
        );
    }
}
