import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import {
    _cs,
    listToMap,
    mapToList,
    isDefined,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import AccentButton from '#rsca/Button/AccentButton';
import SelectInputWithList from '#rsci/SelectInputWithList';
import SearchMultiSelectInput from '#rsci/SearchMultiSelectInput';
import HintAndError from '#rsci/HintAndError';
import Label from '#rsci/Label';

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
    error: PropTypes.string,
    hint: PropTypes.string,
    showHintAndError: PropTypes.bool,
    persistentHintAndError: PropTypes.bool,
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
    hint: '',
    error: '',
    showHintAndError: true,
    persistentHintAndError: true,
};

@FaramInputElement
export default class GeoInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            modalValue: props.value,
            showModal: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
            this.setState({ modalValue: nextProps.value });
        }
    }

    getAllGeoOptions = memoize((geoOptionsByRegion) => {
        const geoOptionsList = mapToList(
            geoOptionsByRegion,
            geoOption => geoOption,
        )
            .filter(isDefined)
            .flat();
        return geoOptionsList;
    })

    getAllGeoOptionsMap = memoize((geoOptionsList) => {
        const geoOptionsMapping = listToMap(
            geoOptionsList,
            geoOption => geoOption.key,
            geoOption => geoOption,
        );
        return geoOptionsMapping;
    })

    handleModalCancel = () => {
        const { value: modalValue } = this.props;
        this.setState({
            showModal: false,
            modalValue,
        });
    }

    handleModalApply = () => {
        const { onChange } = this.props;
        const { modalValue } = this.state;
        this.setState(
            { showModal: false },
            () => {
                if (onChange) {
                    onChange(modalValue);
                }
            },
        );
    }

    handleSelectChange = (newValues) => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(newValues);
        }
    }

    handleModalValueChange = (modalValue) => {
        this.setState({ modalValue });
    }

    handleShowModal = () => {
        this.setState({ showModal: true });
    }

    valueLabelSelector = (v) => {
        const {
            geoOptionsByRegion,
            regions,
        } = this.props;

        const allGeoOptionsMap = this.getAllGeoOptionsMap(
            this.getAllGeoOptions(geoOptionsByRegion),
        );
        const option = allGeoOptionsMap[this.valueKeySelector(v)];

        if (regions.length > 0) {
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
                geoOptionsById={this.getAllGeoOptionsMap(
                    this.getAllGeoOptions(geoOptionsByRegion),
                )}
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
            geoOptionsByRegion,
        } = this.props;

        if (hideList || hideInput) {
            return (
                <div className={styles.noListSelection} >
                    {!hideInput &&
                        <SearchMultiSelectInput
                            showLabel={false}
                            value={value}
                            onChange={this.handleSelectChange}
                            options={this.getAllGeoOptions(geoOptionsByRegion)}
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
                options={this.getAllGeoOptions(geoOptionsByRegion)}
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
            hint,
            error,
            showHintAndError,
            persistentHintAndError,
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
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                    persistent={persistentHintAndError}
                />
            </div>
        );
    }
}
