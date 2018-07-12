import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import GeoListInput from '#components/GeoListInput/';

import {
    projectDetailsSelector,
    geoOptionsForProjectSelector,
} from '#redux';

const propTypes = {
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    geoOptions: {},
    projectDetails: {},
};

const mapStateToProps = (state, props) => ({
    geoOptions: geoOptionsForProjectSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
});

@connect(mapStateToProps)
export default class GeoWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            geoOptions,
            projectDetails,
        } = this.props;

        return (
            <GeoListInput
                faramElementName="values"
                geoOptionsByRegion={geoOptions}
                regions={projectDetails.regions}
                showHeader={false}
            />
        );
    }
}
