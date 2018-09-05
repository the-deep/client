import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    projectDetailsSelector,
    geoOptionsForProjectSelector,
} from '#redux';

import GeoListOutput from '#widgetComponents/GeoListOutput';

const propTypes = {
    className: PropTypes.string,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    geoOptions: {},
    projectDetails: {},
};

const mapStateToProps = (state, props) => ({
    geoOptions: geoOptionsForProjectSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
});

@connect(mapStateToProps)
export default class GeoListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            geoOptions,
            projectDetails: {
                regions,
            },
            className,
        } = this.props;

        return (
            <GeoListOutput
                faramElementName="value"
                className={className}
                geoOptionsByRegion={geoOptions}
                regions={regions}
                showHeader={false}
            />
        );
    }
}
