import PropTypes from 'prop-types';
import React from 'react';

import Faram from '@togglecorp/faram';
import Icon from '#rscg/Icon';
import RotatingInput from '#rsci/RotatingInput';
import GeoInput from '#components/input/GeoInput/';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    label: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    geoOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    label: '',
    disabled: false,
    value: {
        includeSubRegions: false,
        areas: [],
    },
};

const rendererSelector = d => d.renderer;
const keySelector = d => d.key;

const options = [
    {
        renderer: (
            <Icon
                name="fork"
                title={_ts('entries', 'includeSubRegionsTitle')}
                className={styles.subRegionSelected}
            />
        ),
        key: true,
    },
    {
        renderer: (
            <Icon
                name="fork"
                title={_ts('entries', 'includeSubRegionsTitle')}
                className={styles.subRegionNotSelected}
            />
        ),
        key: false,
    },
];

export default class GeoFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.schema = {
            fields: {
                includeSubRegions: [],
                areas: [],
            },
        };
    }

    render() {
        const {
            value,
            label,
            disabled,
            geoOptions,
            onChange,
            regions,
        } = this.props;

        return (
            <Faram
                className={styles.geoFilter}
                onChange={onChange}
                schema={this.schema}
                value={value}
                disabled={disabled}
            >
                <GeoInput
                    faramElementName="areas"
                    className={styles.geoInput}
                    geoOptionsByRegion={geoOptions}
                    regions={regions}
                    placeholder={_ts('entries', 'geoPlaceholder')}
                    showHeader={false}
                    label={label}
                    hideList
                />
                <RotatingInput
                    className={styles.rotatingInput}
                    options={options}
                    rendererSelector={rendererSelector}
                    keySelector={keySelector}
                    faramElementName="includeSubRegions"
                    showHintAndError={false}
                />
            </Faram>
        );
    }
}
