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
};

const defaultProps = {
    geoOptions: {},
    projectDetails: {},
    entryType: undefined,
    excerpt: undefined,
    image: undefined,
};

const mapStateToProps = (state, props) => ({
    geoOptions: geoOptionsForProjectSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
});

const TEXT = 'excerpt';
const IMAGE = 'image';

const entryTypes = {
    excerpt: 'text',
    image: 'image',
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
        } = this.props;

        let excerptValue;
        switch (entryType) {
            case TEXT:
                excerptValue = excerpt;
                break;
            case IMAGE:
                excerptValue = image;
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
