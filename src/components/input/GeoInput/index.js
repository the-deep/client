import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import {
    _cs,
    listToMap,
    mapToList,
    isDefined,
    isObject,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import AccentButton from '#rsca/Button/AccentButton';
import MultiSelectInputWithList from '#rsci/MultiSelectInputWithList';
import HintAndError from '#rsci/HintAndError';
import Label from '#rsci/Label';

import { activeUserSelector } from '#redux';

import GeoModal from './GeoModal';
import styles from './styles.scss';

const MAX_DISPLAY_OPTIONS = 100;

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
});

const propTypes = {
    className: PropTypes.string,
    activeUser: PropTypes.shape({
        accessibleFeatures: PropTypes.array,
    }),

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
    emptyComponent: PropTypes.func,
};

const defaultProps = {
    className: undefined,
    label: undefined,
    showLabel: true,
    activeUser: {},
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
    polygonsEnabled: false,
};

@FaramInputElement
@connect(mapStateToProps, undefined)
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

    getSelections = memoize(value => (
        value.filter(v => !isObject(v))
    ))

    getPolygons = memoize(value => (
        value.filter(isObject)
    ))

    // SELECTOR

    keySelector = v => v.key;

    labelSelector = (v) => {
        const {
            geoOptionsByRegion,
            regions,
        } = this.props;

        const allGeoOptionsMap = this.getAllGeoOptionsMap(geoOptionsByRegion);

        const key = this.keySelector(v);

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
            hideList,
            hideInput,
            placeholder,
            emptyComponent,
            polygonsEnabled,
            activeUser: {
                accessibleFeatures = [],
            },
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

        const polygonSupportIndex = accessibleFeatures.findIndex(f => f.key === 'polygon_support_geo');
        const isPolygonFeatureEnabled = polygonSupportIndex !== -1;
        const shouldEnablePloygon = isPolygonFeatureEnabled && polygonsEnabled;

        return (
            <div className={className}>
                {showLabel &&
                    <Label
                        show={showLabel}
                        text={label}
                    />
                }
                <MultiSelectInputWithList
                    value={selections}
                    showLabel={false}
                    onChange={this.handleSelectionsChange}
                    className={styles.selectInput}
                    options={options}
                    labelSelector={this.labelSelector}
                    keySelector={this.keySelector}
                    showHintAndError={false}
                    hideSelectAllButton
                    disabled={disabled}
                    readOnly={readOnly}

                    hideList={hideList}
                    hideInput={hideInput}
                    maxDisplayOptions={MAX_DISPLAY_OPTIONS}
                    placeholder={placeholder}

                    emptyComponent={emptyComponent}
                    topRightChild={(
                        // FIXME: use modal button
                        <AccentButton
                            className={styles.action}
                            iconName="globe"
                            onClick={this.handleModalShow}
                            disabled={disabled || readOnly}
                            transparent
                        >
                            {hideInput && label}
                        </AccentButton>
                    )}
                />
                <HintAndError
                    show={showHintAndError}
                    hint={hint}
                    error={error}
                    persistent={persistentHintAndError}
                />
                {showModal && (
                    <GeoModal
                        title={label}
                        regions={regions}
                        geoOptionsByRegion={geoOptionsByRegion}
                        geoOptionsById={this.getAllGeoOptionsMap(geoOptionsByRegion)}
                        // NOTE: this value is only set on mount
                        selections={selections}
                        polygons={polygons}
                        onApply={this.handleModalApply}
                        onCancel={this.handleModalCancel}
                        modalLeftComponent={modalLeftComponent}
                        polygonsEnabled={shouldEnablePloygon}
                    />
                )}
            </div>
        );
    }
}
