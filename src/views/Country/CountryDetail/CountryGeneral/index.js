import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import _cs from '#cs';
import { countryDetailSelector } from '#redux';

import RegionDetail from '#components/other/RegionDetail';
import RegionAdminLevel from '#components/other/RegionAdminLevel';
import RegionMap from '#components/geo/RegionMap';

import styles from './styles.scss';

const propTypes = {
    countryDetail: PropTypes.shape({
        code: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
    }).isRequired,
    dataLoading: PropTypes.bool.isRequired,
    className: PropTypes.string,
};
const defaultProps = {
    className: undefined,
};

const mapStateToProps = (state, props) => ({
    countryDetail: countryDetailSelector(state, props),
});

@connect(mapStateToProps)
export default class CountryGeneral extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            countryDetail,
            dataLoading,
        } = this.props;

        return (
            <div className={_cs(styles.countryGeneral, className)}>
                <div className={styles.topContainer}>
                    <RegionMap
                        regionId={countryDetail.id}
                        className={styles.regionMap}
                    />
                    <RegionDetail
                        className={styles.regionDetailForm}
                        countryId={countryDetail.id}
                        dataLoading={dataLoading}
                    />
                </div>
                <RegionAdminLevel
                    className={styles.adminLevelTable}
                    countryId={countryDetail.id}
                />
            </div>
        );
    }
}
