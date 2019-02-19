import React from 'react';
import PropTypes from 'prop-types';
import { FaramOutputElement } from '@togglecorp/faram';

import ListView from '#rscv/List/ListView';
import ListItem from '#components/general/ListItem';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    geoOptionsByRegion: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    geoOptionsByRegion: {},
    value: [],
    regions: [],
};

@FaramOutputElement
export default class GeoListOutput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static valueKeySelector = v => v.key;

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

    static getAllGeoOptions = (geoOptionsByRegion, value) => (
        Object.values(geoOptionsByRegion)
            .reduce((acc, r) => [...acc, ...r], [])
            .filter(o => value.find(v => v === o.key))
    )

    constructor(props) {
        super(props);
        const {
            geoOptionsByRegion,
            value,
        } = props;

        // Calculate state from initial value
        this.geoOptionsById = GeoListOutput.calcGeoOptionsById(props.geoOptionsByRegion);
        this.geoSelections = GeoListOutput.getAllGeoOptions(geoOptionsByRegion, value || []);
    }

    componentWillReceiveProps(nextProps) {
        const {
            geoOptionsByRegion: newGeoOptionsByRegion,
            value: newValue,
        } = nextProps;

        const {
            geoOptionsByRegion: oldGeoOptionsByRegion,
            value: oldValue,
        } = this.props;

        if (
            newGeoOptionsByRegion !== oldGeoOptionsByRegion ||
            newValue !== oldValue
        ) {
            this.geoOptionsById = GeoListOutput.calcGeoOptionsById(newGeoOptionsByRegion);
            this.geoSelections = GeoListOutput.getAllGeoOptions(newGeoOptionsByRegion, newValue);
        }
    }

    valueLabelSelector = (v) => {
        const option = this.geoOptionsById[GeoListOutput.valueKeySelector(v)];
        if (this.props.regions.length > 0) {
            return `${option.regionTitle} / ${option.label}`;
        }
        return option.label;
    }

    rendererParams = (key, option) => ({
        value: this.valueLabelSelector(option),
    })

    render() {
        const { className } = this.props;

        return (
            <ListView
                className={`${className} ${styles.list}`}
                data={this.geoSelections}
                keySelector={GeoListOutput.valueKeySelector}
                renderer={ListItem}
                rendererParams={this.rendererParams}
                emptyComponent={null}
            />
        );
    }
}
