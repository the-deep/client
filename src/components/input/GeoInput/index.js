import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import AccentButton from '#rsca/Button/AccentButton';
import SelectInputWithList from '#rsci/SelectInputWithList';
import SearchMultiSelectInput from '#rsci/SearchMultiSelectInput';
import Label from '#rsci/Label';
import { FaramInputElement } from '@togglecorp/faram';
import {
    listToMap,
    mapToList,
    mapToMap,
    listToGroupList,
    isDefined,
    unique,
} from '@togglecorp/fujs';
import _cs from '#cs';

import GeoModal from './GeoModal';
import styles from './styles.scss';

const MAX_DISPLAY_OPTIONS = 100;

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
        const geoOptionsList = mapToList(
            geoOptionsByRegion,
            geoOption => geoOption,
        )
            .filter(isDefined)
            .flat();
        const geoOptionsMapping = listToMap(
            geoOptionsList,
            geoOption => geoOption.key,
            geoOption => geoOption,
        );
        return geoOptionsMapping;
    }

    static calcAdminLevelsById = (geoOptionsByRegion) => {
        const adminLevelsById = mapToMap(
            geoOptionsByRegion,
            key => key,
            geoOptions => listToGroupList(
                geoOptions,
                geoOption => geoOption.adminLevel,
            ),
        );

        const adminLevelTitlesById = mapToMap(
            geoOptionsByRegion,
            key => key,
            geoOptions => unique(
                geoOptions,
                geoOption => geoOption.adminLevel,
            ).map(geoOption => ({
                key: geoOption.adminLevel,
                title: geoOption.adminLevelTitle,
            })),
        );

        return { adminLevelsById, adminLevelTitlesById };
    }

    // FIXME: repeated code here
    static getAllGeoOptions = (geoOptionsByRegion) => {
        const geoOptionsList = mapToList(
            geoOptionsByRegion,
            geoOption => geoOption,
        )
            .filter(isDefined)
            .flat();
        return geoOptionsList;
    }

    /*
    static getRegionDetails = memoize((regions = emptyArray, allRegions = emptyArray) => {
        const allRegionsMap = listToMap(
            allRegions,
            region => region.key,
            region => region,
        );
        return regions.map(selectedRegion => allRegionsMap[selectedRegion]);
    });
    */

    constructor(props) {
        super(props);

        const {
            adminLevelsById,
            adminLevelTitlesById,
        } = GeoInput.calcAdminLevelsById(props.geoOptionsByRegion);

        this.adminLevelsById = adminLevelsById;
        this.adminLevelTitlesById = adminLevelTitlesById;

        // For value selector and select input
        this.geoOptionsById = GeoInput.calcGeoOptionsById(props.geoOptionsByRegion);

        // For select input
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
        // const detailedValue = GeoInput.getRegionDetails(modalValue, this.geoOptions);
        this.setState({ showModal: false }, () => {
            if (onChange) {
                onChange(modalValue);
            }
        });
    }

    handleModalCancel = () => {
        const { value: modalValue } = this.props;
        this.setState({ showModal: false, modalValue });
    }

    handleSelectChange = (newValues) => {
        // const detailedValue = GeoInput.getRegionDetails(newValues, this.geoOptions);
        if (this.props.onChange) {
            this.props.onChange(newValues);
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
                iconName="globe"
                // FIXME: use strings
                title="Open geo modal"
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
            emptyComponent,
        } = this.props;

        if (hideList || hideInput) {
            return (
                <div className={styles.noListSelection} >
                    {!hideInput &&
                        <SearchMultiSelectInput
                            showLabel={false}
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
                            maxDisplayOptions={MAX_DISPLAY_OPTIONS}
                        />
                    }
                    <AccentButton
                        className={styles.action}
                        iconName="globe"
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
                showLabel={false}
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
                emptyComponent={emptyComponent}
                maxDisplayOptions={MAX_DISPLAY_OPTIONS}
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
