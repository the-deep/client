import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    generalDetailsForRegionSelector,
    countriesStringsSelector,
} from '../../redux';

import ListView from '../../vendor/react-store/components/View/List/ListView';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    regionDetail: PropTypes.shape({
        id: PropTypes.number,
        code: PropTypes.string,
        title: PropTypes.string,
        regionalGroups: PropTypes.shape({}),
    }).isRequired,
    countriesStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    regionDetail: generalDetailsForRegionSelector(state, props),
    countriesStrings: countriesStringsSelector(state),
});

@connect(mapStateToProps, null)
export default class RegionDetailView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        // FIXME: use strings
        this.regionDetailMeta = {
            title: 'Name',
            code: 'Code',
            wbRegion: 'WB Region',
            wbIncomeRegion: 'WB Income Region',
            ochaRegion: 'OCHA Region',
            echoRegion: 'ECHO Region',
            unGeoRegion: 'UN Geographical Region',
            unGeoSubRegion: 'UN Geographical Sub Region',
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
        const {
            className,
            countriesStrings,
        } = this.props;

        const regionDetailsList = Object.keys(this.regionDetailMeta);

        const classNames = [
            className,
            styles.regionDetailView,
        ];

        const headingText = countriesStrings('regionGeneralInfoLabel');

        return (
            <div className={classNames.join(' ')}>
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
