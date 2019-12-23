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
import MultiSelectInputWithList from '#rsci/MultiSelectInputWithList';
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

    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,

    placeholder: PropTypes.string,
    label: PropTypes.string,
    showLabel: PropTypes.bool,
    error: PropTypes.string,
    showHintAndError: PropTypes.bool,
    hint: PropTypes.string,
    persistentHintAndError: PropTypes.bool,
    hideList: PropTypes.bool,
    hideInput: PropTypes.bool,

    modalLeftComponent: PropTypes.node,
    emptyComponent: PropTypes.func,
};

const defaultProps = {
    className: undefined,
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
            modalValue: undefined,
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

    handleSelectChange = (newValues) => {
        const { onChange } = this.props;
        if (onChange) {
            onChange(newValues);
        }
    }

    // MODAL

    handleModalShow = () => {
        const { value } = this.props;
        this.setState({
            modalValue: value,
            showModal: true,
        });
    }

    handleModalApply = (newValue) => {
        this.setState(
            {
                modalValue: undefined,
                showModal: false,
            },
            () => {
                const { onChange } = this.props;
                if (onChange) {
                    onChange(newValue);
                }
            },
        );
    }

    handleModalCancel = () => {
        this.setState({
            modalValue: undefined,
            showModal: false,
        });
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
        } = this.props;
        const {
            showModal,
            modalValue,
        } = this.state;

        const className = _cs(
            classNameFromProps,
            styles.geoListInput,
            'geoListInput',
        );

        const options = this.getAllGeoOptions(geoOptionsByRegion);

        return (
            <div className={className}>
                {showLabel &&
                    <Label
                        show={showLabel}
                        text={label}
                    />
                }
                <MultiSelectInputWithList
                    value={value}
                    showLabel={false}
                    onChange={this.handleSelectChange}
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
                        <AccentButton
                            className={styles.action}
                            iconName="globe"
                            onClick={this.handleModalShow}
                            disabled={disabled || readOnly}
                            transparent
                            // FIXME: use strings
                            title="Open geo modal"
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
                        value={modalValue}
                        // onChange={this.handleModalValueChange}
                        onApply={this.handleModalApply}
                        onCancel={this.handleModalCancel}
                        modalLeftComponent={modalLeftComponent}
                    />
                )}
            </div>
        );
    }
}
