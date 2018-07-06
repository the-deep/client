import PropTypes from 'prop-types';
import React from 'react';

import AccentButton from '#rs/components/Action/Button/AccentButton';
import SelectInputWithList from '#rs/components/Input/SelectInputWithList';
import FaramElement from '#rs/components/Input/Faram/FaramElement';
import { iconNames } from '#constants';

import GeoModal from '../GeoModal';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    onChange: PropTypes.func,
    geoOptionsByRegion: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    showHeader: PropTypes.bool,
};

const defaultProps = {
    className: '',
    title: '',
    onChange: undefined,
    geoOptionsByRegion: {},
    value: [],
    regions: [],
    showHeader: true,
};

@FaramElement('input')
export default class GeoListInput extends React.PureComponent {
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

    static getAllGeoOptions = (geoOptionsByRegion) => {
        const allGeoOptions = [];
        Object.values(geoOptionsByRegion).forEach((r) => {
            allGeoOptions.push(...r);
        });
        return allGeoOptions;
    }

    constructor(props) {
        super(props);

        // Calculate state from initial value
        this.geoOptionsById = GeoListInput.calcGeoOptionsById(props.geoOptionsByRegion);
        this.geoOptions = GeoListInput.getAllGeoOptions(props.geoOptionsByRegion);
        this.state = {
            modalValue: props.value,
            showModal: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.geoOptionsByRegion !== nextProps.geoOptionsByRegion) {
            this.geoOptionsById = GeoListInput.calcGeoOptionsById(nextProps.geoOptionsByRegion);
            this.geoOptions = GeoListInput.getAllGeoOptions(nextProps.geoOptionsByRegion);
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
        const option = this.geoOptionsById[v.key];
        if (this.props.regions.length > 0) {
            return `${option.regionTitle} / ${option.label}`;
        }
        return option.label;
    }
    valueKeySelector = v => v.key;

    renderGeoModal = () => {
        const {
            title,
            regions,
            geoOptionsByRegion,
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
                title={title}
                regions={regions}
                geoOptionsByRegion={geoOptionsByRegion}
                geoOptionsById={this.geoOptionsById}
                value={modalValue}
                onChange={this.handleModalValueChange}
                onApply={this.handleModalApply}
                onCancel={this.handleModalCancel}
            />
        );
    }

    render() {
        const {
            title,
            value,
            geoOptionsByRegion,
            showHeader,
        } = this.props;

        const titleClassName = `${styles.title} title`;
        const headerClassName = `${styles.header} header`;

        const GeoModalRender = this.renderGeoModal;

        return (
            <div className={this.getClassName()}>
                {showHeader &&
                    <header className={headerClassName}>
                        <div className={titleClassName}>
                            { title }
                        </div>
                        <AccentButton
                            className={styles.action}
                            iconName={iconNames.map}
                            onClick={this.handleShowModal}
                            transparent
                        />
                    </header>
                }
                <SelectInputWithList
                    value={value}
                    onChange={this.handleSelectChange}
                    className={styles.selectInput}
                    options={this.geoOptions}
                    labelSelector={this.valueLabelSelector}
                    keySelector={this.valueKeySelector}
                    showHintAndError={false}
                    topRightChild={!showHeader &&
                        <AccentButton
                            className={styles.action}
                            iconName={iconNames.chart}
                            onClick={this.handleShowModal}
                            transparent
                        />
                    }
                    hideSelectAllButton
                />
                <GeoModalRender />
            </div>
        );
    }
}
