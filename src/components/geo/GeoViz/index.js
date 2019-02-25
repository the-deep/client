import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rsca/Button';
import SelectInput from '#rsci/SelectInput';
import Message from '#rscv/Message';
import { randomString } from '@togglecorp/fujs';

import { iconNames } from '#constants';
import _cs from '#cs';
import _ts from '#ts';

import Region from './Region';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    regions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
    })).isRequired,
    value: PropTypes.arrayOf(PropTypes.string),
    frequency: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    adminLevel: PropTypes.number,
    showLegend: PropTypes.bool,
};

const defaultProps = {
    className: '',
    adminLevel: undefined,
    value: [],
    showLegend: true,
    frequency: {},
};

export default class GeoViz extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static entityKeySelector = r => String(r.id);
    static entityLevelSelector = r => r.level;
    static entityLabelSelector = r => r.title;

    constructor(props) {
        super(props);
        const { regions } = props;

        this.state = {
            regionId: regions[0] && GeoViz.entityKeySelector(regions[0]),
            adminLevelId: undefined,
            adminLevels: undefined,

            // Unique key to recreate map everytime the user refreshes
            uniqueKey: randomString(),
        };
    }

    handleRefresh = () => {
        this.setState({
            uniqueKey: randomString(),
        });
    }

    handleRegionChange = (regionId) => {
        this.setState({
            regionId,
            adminLevelId: undefined,
            adminLevels: undefined,
        });
    }

    handleAdminLevelChange = (adminLevelId) => {
        this.setState({ adminLevelId });
    }

    handleAdminLevelsChange = (adminLevels) => {
        const { adminLevel } = this.props;
        const filteredAdminLevels = adminLevel && adminLevels
            .filter(a => (String(GeoViz.entityLevelSelector(a)) === String(adminLevel)));

        this.setState({
            adminLevels: filteredAdminLevels,
            adminLevelId: filteredAdminLevels[0] &&
                GeoViz.entityKeySelector(filteredAdminLevels[0]),
        });
    }

    render() {
        const {
            className,
            regions,
            value,
            frequency,
            showLegend,
        } = this.props;

        const {
            regionId,
            adminLevelId,
            adminLevels,
            uniqueKey,
        } = this.state;

        return (
            <div className={_cs(styles.geoViz, className, 'geo-viz')}>
                <SelectInput
                    className={styles.regionSelectInput}
                    options={regions}
                    keySelector={GeoViz.entityKeySelector}
                    labelSelector={GeoViz.entityLabelSelector}
                    value={regionId}
                    onChange={this.handleRegionChange}
                    showHintAndError={false}
                    showLabel={false}
                    hideClearButton
                />
                <Button
                    className={styles.refreshButton}
                    onClick={this.handleRefresh}
                >
                    <span className={iconNames.refresh} />
                </Button>
                {regionId && (
                    <Region
                        key={uniqueKey}
                        className={styles.map}
                        regionId={regionId}
                        adminLevelId={adminLevelId}
                        adminLevels={adminLevels}
                        onAdminLevelsFetched={this.handleAdminLevelsChange}
                        value={value}
                        frequency={frequency}
                        showLegend={showLegend}
                    />
                )}
                {!regionId && (
                    <Message className={styles.map}>
                        {_ts('geoViz', 'noRegionSelectedMessage')}
                    </Message>
                )}
                {/*
                <SegmentInput
                    className={styles.adminLevelSelect}
                    options={adminLevels}
                    keySelector={GeoViz.entityKeySelector}
                    labelSelector={GeoViz.entityLabelSelector}
                    value={adminLevelId}
                    onChange={this.handleAdminLevelChange}
                />
                */}
            </div>
        );
    }
}
