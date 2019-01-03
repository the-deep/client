import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ListView from '#rscv/List/ListView';

import { generalDetailsForRegionSelector } from '#redux';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    regionDetail: PropTypes.shape({
        id: PropTypes.number,
        code: PropTypes.string,
        title: PropTypes.string,
        regionalGroups: PropTypes.shape({}),
    }).isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    regionDetail: generalDetailsForRegionSelector(state, props),
});

@connect(mapStateToProps)
export default class RegionDetailView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.regionDetailMeta = {
            title: _ts('components.regionDetailView', 'countryNameLabel'),
            code: _ts('components.regionDetailView', 'countryCodeLabel'),
            wbRegion: _ts('components.regionDetailView', 'wbRegionLabel'),
            wbIncomeRegion: _ts('components.regionDetailView', 'wbIncomeRegionLabel'),
            ochaRegion: _ts('components.regionDetailView', 'ochaRegionLabel'),
            echoRegion: _ts('components.regionDetailView', 'echoRegionLabel'),
            unGeoRegion: _ts('components.regionDetailView', 'unGeoRegionLabel'),
            unGeoSubRegion: _ts('components.regionDetailView', 'unGeoSubregionLabel'),
        };
    }

    renderRegionDetailItem = (key) => {
        const { regionDetail = {} } = this.props;
        let { regionalGroups } = regionDetail;

        if (!regionalGroups) {
            regionalGroups = {};
        }

        const value = regionDetail[key] || regionalGroups[key];

        if (!value) {
            return null;
        }

        return (
            <div
                className={styles.row}
                key={key}
            >
                <div className={styles.title}>
                    {this.regionDetailMeta[key]}
                </div>
                <div className={styles.value}>
                    { value }
                </div>
            </div>
        );
    }

    render() {
        const { className: classNameFromProps } = this.props;

        const regionDetailsList = Object.keys(this.regionDetailMeta);

        const headingText = _ts('components.regionDetailView', 'regionGeneralInfoLabel');

        const className = _cs(
            classNameFromProps,
            styles.regionDetailView,
        );

        return (
            <div className={className}>
                <h3 className={styles.heading}>
                    { headingText }
                </h3>
                <ListView
                    className={styles.content}
                    data={regionDetailsList}
                    modifier={this.renderRegionDetailItem}
                />
            </div>
        );
    }
}
