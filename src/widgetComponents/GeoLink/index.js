import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import GeoInput from '#components/GeoInput';
import { FaramActionElement } from '#rscg/FaramElements';
import { afViewGeoOptionsSelector } from '#redux';

import _ts from '#ts';

const propTypes = {
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onClick: PropTypes.func.isRequired,
};

const defaultProps = {
    geoOptions: {},
};

const getRegions = memoize(geoOptions => (
    Object.keys(geoOptions).reduce((acc, r) => {
        if (geoOptions[r] && geoOptions[r][0]) {
            return (
                [
                    {
                        id: geoOptions[r][0].region,
                        title: geoOptions[r][0].regionTitle,
                    },
                    ...acc,
                ]
            );
        }
        return (acc);
    }, [])
));

const emptyArray = [];

const mapStateToProps = (state, props) => ({
    geoOptions: afViewGeoOptionsSelector(state, props),
});

@FaramActionElement
@connect(mapStateToProps)
export default class GeoLink extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {};
    }

    handleGeoChange = (_, objectValues) => {
        const locations = objectValues.map(item => ({
            ...item,
            label: item.title,
            originalKey: item.key,
            originalWidget: 'geo',
        }));
        if (locations.length > 0) {
            this.props.onClick(locations);
        }
        this.setState({ value: emptyArray });
    }

    render() {
        const { geoOptions } = this.props;
        const { value } = this.state;

        const regions = getRegions(geoOptions);

        const label = _ts('widgets.editor.link', 'addFromGeoLabel');

        return (
            <GeoInput
                geoOptionsByRegion={geoOptions}
                label={label}
                value={value}
                onChange={this.handleGeoChange}
                regions={regions}
                showLabel={false}
                hideList
                hideInput
            />
        );
    }
}
