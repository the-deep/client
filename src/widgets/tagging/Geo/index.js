import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import GeoInput from '#components/input/GeoInput';
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
    imageRaw: PropTypes.string,
    imageDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    tabularFieldData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    geoOptions: {},
    projectDetails: {},
    entryType: undefined,
    excerpt: undefined,
    imageRaw: undefined,
    imageDetails: undefined,
    tabularFieldData: undefined,
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
            tabularFieldData,
            imageRaw,
            imageDetails,
        } = this.props;

        let excerptValue;
        switch (entryType) {
            case TEXT:
                excerptValue = excerpt;
                break;
            case IMAGE:
                excerptValue = imageDetails?.file ?? imageRaw;
                break;
            case DATA_SERIES:
                excerptValue = tabularFieldData;
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
                showLabel={false}
                emptyComponent={null}
                polygonsEnabled
                modalLeftComponent={
                    <div className={styles.excerptContainer}>
                        <h3 className={styles.title} >
                            {excerptHeaderTitle}
                        </h3>
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
