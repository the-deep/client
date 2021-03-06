import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import {
    _cs,
    listToMap,
    mapToList,
    isDefined,
    isObject,
    unique,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import AccentButton from '#rsca/Button/AccentButton';
import SearchMultiSelectInput from '#rsci/SearchMultiSelectInput';

import GeoInputList from './GeoModal/GeoInputList';
import GeoModal from './GeoModal';
import styles from './styles.scss';

const MAX_DISPLAY_OPTIONS = 100;

const keySelector = v => v.key;

const propTypes = {
    className: PropTypes.string,

    onChange: PropTypes.func,
    geoOptionsByRegion: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types

    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,

    placeholder: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
    hint: PropTypes.string,
    persistentHintAndError: PropTypes.bool,
    showLabel: PropTypes.bool,
    showHintAndError: PropTypes.bool,

    // hideButton: PropTypes.bool,
    hideList: PropTypes.bool,
    hideInput: PropTypes.bool,

    polygonsEnabled: PropTypes.bool,

    modalLeftComponent: PropTypes.node,
    icons: PropTypes.node,
};

const defaultProps = {
    className: undefined,
    label: undefined,
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
    placeholder: undefined,
    hint: '',
    error: '',
    showHintAndError: true,
    persistentHintAndError: true,
    polygonsEnabled: false,
    icons: undefined,
};

@FaramInputElement
export default class GeoInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
        };
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

    getAllGeoOptionsMap = memoize((geoOptionsByRegion) => {
        const geoOptionsList = this.getAllGeoOptions(geoOptionsByRegion);
        const geoOptionsMapping = listToMap(
            geoOptionsList,
            geoOption => geoOption.key,
            geoOption => geoOption,
        );
        return geoOptionsMapping;
    })

    getAllAdminLevelTitles = memoize((geoOptions) => {
        const adminLevelTitles = unique(
            geoOptions,
            geoOption => `${geoOption.region}-${geoOption.adminLevel}`,
        ).map(geoOption => ({
            key: geoOption.adminLevel,
            title: geoOption.adminLevelTitle,

            regionKey: geoOption.region,
            regionTitle: geoOption.regionTitle,
        }));
        return adminLevelTitles;
    })

    getSelections = memoize(value => (
        value.filter(v => !isObject(v))
    ))

    getPolygons = memoize(value => (
        value.filter(isObject)
    ))

    // SELECTOR

    labelSelector = (v) => {
        const {
            geoOptionsByRegion,
            regions,
        } = this.props;

        const allGeoOptionsMap = this.getAllGeoOptionsMap(geoOptionsByRegion);

        const key = keySelector(v);

        const option = allGeoOptionsMap[key];

        return regions.length > 0
            ? `${option.regionTitle} / ${option.label}`
            : option.label;
    }

    handleSelectionsChange = (newSelections) => {
        const { onChange, value } = this.props;
        const polygons = this.getPolygons(value);
        if (onChange) {
            onChange([
                ...newSelections,
                ...polygons,
            ]);
        }
    }

    // MODAL

    handleModalShow = () => {
        this.setState({ showModal: true });
    }

    handleModalCancel = () => {
        this.setState({ showModal: false });
    }

    handleModalApply = (selections, polygons) => {
        this.setState(
            { showModal: false },
            () => {
                const { onChange } = this.props;
                const newValue = [...selections, ...polygons];
                if (onChange) {
                    onChange(newValue);
                }
            },
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
            regions,
            geoOptionsByRegion,
            modalLeftComponent,
            value,
            disabled,
            readOnly,
            hideInput,
            placeholder,

            hideList,

            polygonsEnabled,
            icons,
        } = this.props;

        const { showModal } = this.state;

        const className = _cs(
            classNameFromProps,
            styles.geoListInput,
            'geoListInput',
        );

        const selections = this.getSelections(value);
        const polygons = this.getPolygons(value);
        const options = this.getAllGeoOptions(geoOptionsByRegion);

        return (
            <div className={className}>
                <div className={styles.inputContainer}>
                    {!hideInput && (
                        <SearchMultiSelectInput
                            className={styles.selectInput}
                            value={selections}
                            onChange={this.handleSelectionsChange}
                            options={options}
                            labelSelector={this.labelSelector}
                            keySelector={keySelector}

                            placeholder={placeholder}
                            hideSelectAllButton
                            disabled={disabled}
                            readOnly={readOnly}
                            maxDisplayOptions={MAX_DISPLAY_OPTIONS}

                            error={error}
                            hint={hint}
                            label={label}
                            persistentHintAndError={persistentHintAndError}
                            showHintAndError={showHintAndError}
                            showLabel={showLabel}
                        />
                    )}
                    <AccentButton
                        className={styles.action}
                        iconName="globe"
                        onClick={this.handleModalShow}
                        disabled={disabled || readOnly}
                        transparent
                    >
                        {hideInput && label}
                    </AccentButton>
                    {icons}
                </div>
                {!hideList && (
                    <GeoInputList
                        className={styles.checklist}
                        selections={selections}
                        geoOptionsById={this.getAllGeoOptionsMap(geoOptionsByRegion)}
                        polygons={polygons}
                        adminLevelTitles={this.getAllAdminLevelTitles(options)}
                        polygonHidden
                        sortHidden
                        polygonDisabled
                        onSelectionsChange={this.handleSelectionsChange}
                        // onPolygonsChange={handlePolygonsChangeForRegion}
                        // onPolygonEditClick={handlePolygonClick}
                    />
                )}
                {showModal && (
                    <GeoModal
                        title={label}
                        regions={regions}
                        modalLeftComponent={modalLeftComponent}
                        geoOptionsByRegion={geoOptionsByRegion}
                        geoOptionsById={this.getAllGeoOptionsMap(geoOptionsByRegion)}
                        adminLevelTitles={this.getAllAdminLevelTitles(options)}

                        // NOTE: this value is only set on mount
                        selections={selections}
                        polygons={polygons}

                        onApply={this.handleModalApply}
                        onCancel={this.handleModalCancel}
                        polygonsEnabled={polygonsEnabled}
                    />
                )}
            </div>
        );
    }
}
