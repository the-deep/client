import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    projectDetailsSelector,
    geoOptionsForProjectSelector,
} from '#redux';

import GeoListOutput from '#widgetComponents/GeoListOutput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.object,
    className: PropTypes.string,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    geoOptions: {},
    projectDetails: {},
    data: {},
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
            data: {
                value,
            },
            geoOptions,
            projectDetails: {
                regions,
            },
            className,
        } = this.props;

        return (
            <GeoListOutput
                className={className}
                value={value}
                geoOptionsByRegion={geoOptions}
                regions={regions}
                showHeader={false}
            />
        );
    }
}
