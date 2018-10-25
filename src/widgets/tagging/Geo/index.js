import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import GeoInput from '#components/GeoInput/';
import ExcerptOutput from '#widgetComponents/ExcerptOutput';
import _ts from '#ts';

import {
    projectDetailsSelector,
    geoOptionsForProjectSelector,
} from '#redux';

import styles from './styles.scss';

const propTypes = {
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entryType: PropTypes.string,
    excerpt: PropTypes.string,
    image: PropTypes.string,
    dataSeries: PropTypes.shape({}),
};

const defaultProps = {
    geoOptions: {},
    projectDetails: {},
    entryType: undefined,
    excerpt: undefined,
    image: undefined,
    dataSeries: undefined,
};

const mapStateToProps = state => ({
    geoOptions: geoOptionsForProjectSelector(state),
    projectDetails: projectDetailsSelector(state),
});

const TEXT = 'excerpt';
const IMAGE = 'image';
const DATA_SERIES = 'dataSeries';

const entryTypes = {
    excerpt: 'text',
    image: 'image',
    dataSeries: 'dataSeries',
};

@connect(mapStateToProps)
export default class GeoWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            geoOptions,
            projectDetails,
            entryType,
            excerpt,
            image,
            dataSeries,
        } = this.props;

        let excerptValue;
        switch (entryType) {
            case TEXT:
                excerptValue = excerpt;
                break;
            case IMAGE:
                excerptValue = image;
                break;
            case DATA_SERIES:
                excerptValue = dataSeries;
                break;
            default:
                console.error('Unknown entry type', entryType);
        }
        const excerptHeaderTitle = _ts('widgets.tagging.geo', 'excerptHeaderTitle');

        return (
            <GeoInput
                className={styles.geoInput}
                faramElementName="value"
                geoOptionsByRegion={geoOptions}
                regions={projectDetails.regions}
                showHeader={false}
                modalLeftComponent={
                    <div className={styles.excerptContainer}>
                        <h4 className={styles.title} >
                            {excerptHeaderTitle}
                        </h4>
                        <ExcerptOutput
                            className={styles.excerptBox}
                            type={entryTypes[entryType]}
                            value={excerptValue}
                        />
                    </div>
                }
            />
        );
    }
}
