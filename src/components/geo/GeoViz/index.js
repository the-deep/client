import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import Button from '#rsca/Button';
import SelectInput from '#rsci/SelectInput';
import Message from '#rscv/Message';
import { isTruthy, randomString, listToMap } from '@togglecorp/fujs';

import _cs from '#cs';
import _ts from '#ts';

import Region from './Region';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
    })),
    adminLevel: PropTypes.number,
    showLegend: PropTypes.bool,
    valueSelector: PropTypes.func.isRequired,
    frequencySelector: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    adminLevel: undefined,
    data: [],
    regions: [],
    showLegend: true,
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
            uniqueKey: randomString(16),
        };
    }

    getGeoValue = memoize(data => (
        data
            .map(this.props.valueSelector)
            .filter(isTruthy)
            .map(val => String(val))
    ))

    getGeoFrequency = memoize(data => listToMap(
        data,
        this.props.valueSelector,
        this.props.frequencySelector,
    ))

    handleRefresh = () => {
        this.setState({
            uniqueKey: randomString(16),
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
        let filteredAdminLevels = [];
        if (adminLevel !== undefined) {
            filteredAdminLevels = adminLevels
                .filter(a => (String(GeoViz.entityLevelSelector(a)) === String(adminLevel)));
        }

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
            data,
            /*
            value,
            frequency,
            */
            showLegend,
        } = this.props;

        const {
            regionId,
            adminLevelId,
            adminLevels,
            uniqueKey,
        } = this.state;

        const value = this.getGeoValue(data);
        const frequency = this.getGeoFrequency(data);

        return (
            <div className={_cs(className, 'geo-viz')}>
                <SelectInput
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
                    onClick={this.handleRefresh}
                    iconName="refresh"
                />
                {regionId && (
                    <Region
                        key={uniqueKey}
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
                    <Message>
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
