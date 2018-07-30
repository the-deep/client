import PropTypes from 'prop-types';
import React from 'react';

import AccentButton from '#rsca/Button/AccentButton';
import SelectInputWithList from '#rsci/SelectInputWithList';
import MultiSelectInput from '#rsci/MultiSelectInput';
import Label from '#rsci/Label';
import FaramElement from '#rsci/Faram/FaramElement';
import { iconNames } from '#constants';

import GeoModal from '../GeoModal';
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
    hideList: PropTypes.bool,
    modalLeftComponent: PropTypes.node,
};

const defaultProps = {
    className: '',
    label: '',
    showLabel: true,
    onChange: undefined,
    geoOptionsByRegion: {},
    disabled: false,
    hideList: false,
    value: [],
    regions: [],
    modalLeftComponent: undefined,
};

@FaramElement('input')
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

    static getAllGeoOptions = geoOptionsByRegion => (
        Object.values(geoOptionsByRegion).reduce((acc, r) => [...acc, ...r], [])
    )

    constructor(props) {
        super(props);

        // Calculate state from initial value
        this.geoOptionsById = GeoInput.calcGeoOptionsById(props.geoOptionsByRegion);
        this.geoOptions = GeoInput.getAllGeoOptions(props.geoOptionsByRegion);
        this.state = {
            modalValue: props.value,
            showModal: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.geoOptionsByRegion !== nextProps.geoOptionsByRegion) {
            this.geoOptionsById = GeoInput.calcGeoOptionsById(nextProps.geoOptionsByRegion);
            this.geoOptions = GeoInput.getAllGeoOptions(nextProps.geoOptionsByRegion);
        }

        if (this.props.value !== nextProps.value) {
            this.setState({ modalValue: nextProps.value });
        }
    }

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.geoListInput,
            'geoListInput',
        ];

        return classNames.join(' ');
    }

    handleModalApply = () => {
        const { onChange } = this.props;
        const { modalValue } = this.state;
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
                value={modalValue}
                onChange={this.handleModalValueChange}
                onApply={this.handleModalApply}
                onCancel={this.handleModalCancel}
                modalLeftComponent={modalLeftComponent}
            />
        );
    }

    renderShowModalButton = () => {
        const { disabled } = this.props;

        return (
            <AccentButton
                className={styles.action}
                iconName={iconNames.globe}
                onClick={this.handleShowModal}
                disabled={disabled}
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
            hideList,
        } = this.props;

        if (hideList) {
            return (
                <div className={styles.noListSelection} >
                    <MultiSelectInput
                        value={value}
                        onChange={this.handleSelectChange}
                        options={this.geoOptions}
                        labelSelector={this.valueLabelSelector}
                        keySelector={this.valueKeySelector}
                        showHintAndError={false}
                        hideSelectAllButton
                        disabled={disabled}
                    />
                    <AccentButton
                        className={styles.action}
                        iconName={iconNames.globe}
                        onClick={this.handleShowModal}
                        disabled={disabled}
                        transparent
                    />
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
            />
        );
    }

    render() {
        const {
            label,
            showLabel,
        } = this.props;

        const GeoModalRender = this.renderGeoModal;
        const Selection = this.renderSelection;

        return (
            <div className={this.getClassName()}>
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
