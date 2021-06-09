import PropTypes from 'prop-types';
import React from 'react';

import Icon from '#rscg/Icon';
import RotatingInput from '#rsci/RotatingInput';
import GeoInput from '#components/input/GeoInput/';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    label: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    geoOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    label: '',
    disabled: false,
    value: {
        includeSubRegions: true,
        areas: [],
    },
};

const rendererSelector = d => d.renderer;
const keySelector = d => d.key;

const options = [
    {
        renderer: (
            <div
                className={styles.subRegionSelected}
                title={_ts('entries', 'includeSubRegionsTitle')}
            >
                <Icon name="suborgIcon" />
            </div>
        ),
        key: true,
    },
    {
        renderer: (
            <div
                className={styles.subRegionNotSelected}
                title={_ts('entries', 'includeSubRegionsTitle')}
            >
                <Icon name="suborgIcon" />
            </div>
        ),
        key: false,
    },
];

export default class GeoFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleGeoChange = (areas) => {
        this.props.onChange({
            ...this.props.value,
            areas,
        });
    }

    handleRotatingInputChange = (includeSubRegions) => {
        this.props.onChange({
            ...this.props.value,
            includeSubRegions,
        });
    }

    render() {
        const {
            value: {
                areas = [],
                includeSubRegions = false,
            } = {},
            label,
            disabled,
            geoOptions,
            regions,
        } = this.props;

        return (
            <GeoInput
                className={styles.geoFilter}
                value={areas}
                geoOptionsByRegion={geoOptions}
                onChange={this.handleGeoChange}
                regions={regions}
                placeholder={_ts('entries', 'geoPlaceholder')}
                showHeader={false}
                label={label}
                disabled={disabled}
                hideList
                showHintAndError={false}
                icons={(
                    <RotatingInput
                        className={_cs(styles.rotatingInput)}
                        value={includeSubRegions}
                        options={options}
                        onChange={this.handleRotatingInputChange}
                        rendererSelector={rendererSelector}
                        keySelector={keySelector}
                        showHintAndError={false}
                        showLabel={false}
                        disabled={disabled}
                    />
                )}
            />
        );
    }
}
