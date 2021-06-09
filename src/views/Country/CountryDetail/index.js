import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
import Faram, { requiredCondition } from '@togglecorp/faram';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import ScrollTabs from '#rscv/ScrollTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';
import SuccessButton from '#rsca/Button/SuccessButton';
import WarningButton from '#rsca/Button/WarningButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import {
    countryDetailSelector,
    regionDetailSelector,
    unSetRegionAction,
    activeUserSelector,
    setRegionDetailsAction,
    changeRegionDetailsAction,
    setRegionDetailsErrorsAction,
    routeUrlSelector,
} from '#redux';
import _ts from '#ts';
import RegionDetailView from '#components/other/RegionDetailView';
import RegionMap from '#components/geo/RegionMap';

import RegionDeleteRequest from '../requests/RegionDeleteRequest';
import RegionGetRequest from '../requests/RegionGetRequest';
import RegionDetailPatchRequest from '../requests/RegionDetailPatchRequest';

import CountryGeneral from './CountryGeneral';
import CountryKeyFigures from './CountryKeyFigures';
import CountryMediaSources from './CountryMediaSources';
import CountryPopulationData from './CountryPopulationData';
import CountrySeasonalCalendar from './CountrySeasonalCalendar';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    countryDetail: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string,
    }).isRequired,
    regionDetail: PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        faramValues: PropTypes.object,
        // eslint-disable-next-line react/forbid-prop-types
        faramErrors: PropTypes.object,
        pristine: PropTypes.bool,
    }),
    unSetRegion: PropTypes.func.isRequired,
    countryId: PropTypes.number.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setRegionDetails: PropTypes.func.isRequired,
    changeRegionDetails: PropTypes.func.isRequired,
    setRegionDetailsErrors: PropTypes.func.isRequired,

    routeUrl: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    regionDetail: {
        faramValues: {},
        faramErrors: {},
        pristine: false,
    },
};

const mapStateToProps = (state, props) => ({
    countryDetail: countryDetailSelector(state, props),
    regionDetail: regionDetailSelector(state, props),
    activeUser: activeUserSelector(state),
    routeUrl: routeUrlSelector(state),
});

const mapDispatchToProps = dispatch => ({
    unSetRegion: params => dispatch(unSetRegionAction(params)),
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
    changeRegionDetails: params => dispatch(changeRegionDetailsAction(params)),
    setRegionDetailsErrors: params => dispatch(setRegionDetailsErrorsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class CountryDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = d => d;

    constructor(props) {
        super(props);

        this.state = {
            // Delete Modal state
            deletePending: false,
            dataLoading: true,
        };

        this.routes = {
            general: 'General',
            keyFigures: 'Key figures',
            mediaSources: 'Media sources',
            populationData: 'Population data',
            seasonalCalendar: 'Seasonal calendar',
        };

        this.defaultHash = 'general';

        const rendererParams = () => ({
            dataLoading: this.state.dataLoading,
            countryId: this.props.countryId,
            className: styles.view,
        });

        this.views = {
            general: {
                component: CountryGeneral,
                rendererParams,
            },
            keyFigures: {
                component: CountryKeyFigures,
                rendererParams,
            },
            mediaSources: {
                component: CountryMediaSources,
                rendererParams,
            },
            populationData: {
                component: CountryPopulationData,
                rendererParams,
            },
            seasonalCalendar: {
                component: CountrySeasonalCalendar,
                rendererParams,
            },
        };

        this.titles = {
            general: _ts('countries', 'generalTabLabel'),
            keyFigures: _ts('countries', 'keyFiguesTabLabel'),
            mediaSources: _ts('countries', 'mediaTabLabel'),
            populationData: _ts('countries', 'populationTabLabel'),
            seasonalCalendar: _ts('countries', 'seasonalTabLabel'),
        };

        this.schema = {
            fields: {
                code: [requiredCondition],
                title: [requiredCondition],
                regionalGroups: {
                    fields: {
                        wbRegion: [],
                        wbIncomeRegion: [],
                        ochaRegion: [],
                        echoRegion: [],
                        unGeoRegion: [],
                        unGeoSubregion: [],
                    },
                },
                keyFigures: {
                    fields: {
                        index: [],
                        geoRank: [],
                        geoScore: [],
                        geoScoreU5m: [],
                        rank: [],
                        u5m: [],
                        numberOfRefugees: [],
                        percentageUprootedPeople: [],
                        geoScoreUprooted: [],
                        numberIdp: [],
                        numberReturnedRefugees: [],
                        riskClass: [],
                        hazardAndExposure: [],
                        vulnerability: [],
                        informRiskIndex: [],
                        lackOfCopingCapacity: [],
                    },
                },
            },
        };
    }

    componentWillMount() {
        this.startRegionRequest(this.props.countryId, false);
    }

    componentWillUnmount() {
        if (this.regionDeleteRequest) {
            this.regionDeleteRequest.stop();
        }
        if (this.requestForRegion) {
            this.requestForRegion.stop();
        }
        if (this.regionDetailPatchRequest) {
            this.regionDetailPatchRequest.stop();
        }
    }

    handleDiscardButtonClick = () => {
        this.startRegionRequest(this.props.countryId, true);
    }

    startRegionRequest = (regionId, discard) => {
        if (this.requestForRegion) {
            this.requestForRegion.stop();
        }
        const requestForRegion = new RegionGetRequest({
            setRegionDetails: this.props.setRegionDetails,
            setState: v => this.setState(v),
            regionDetail: this.props.regionDetail || {},
            discard,
        });
        this.requestForRegion = requestForRegion.create(regionId);
        this.requestForRegion.start();
    }

    startRequestForRegionDelete = (regionId) => {
        if (this.regionDeleteRequest) {
            this.regionDeleteRequest.stop();
        }
        const regionDeleteRequest = new RegionDeleteRequest({
            unSetRegion: this.props.unSetRegion,
            setState: v => this.setState(v),
        });
        this.regionDeleteRequest = regionDeleteRequest.create(regionId);
        this.regionDeleteRequest.start();
    }

    startRequestForRegionDetailPatch = (regionId, data) => {
        if (this.regionDetailPatchRequest) {
            this.regionDetailPatchRequest.stop();
        }
        const regionDetailPatchRequest = new RegionDetailPatchRequest({
            setRegionDetails: this.props.setRegionDetails,
            setRegionDetailsErrors: this.props.setRegionDetailsErrors,
            regionId: this.props.countryId,
            setState: v => this.setState(v),
        });
        this.regionDetailPatchRequest = regionDetailPatchRequest.create(regionId, data);
        this.regionDetailPatchRequest.start();
    }

    handleValidationFailure = (faramErrors) => {
        this.props.setRegionDetailsErrors({
            faramErrors,
            regionId: this.props.countryId,
        });
    };

    handleValidationSuccess = (values) => {
        this.startRequestForRegionDetailPatch(this.props.countryId, values);
    };

    handleFaramChange = (faramValues, faramErrors) => {
        this.props.changeRegionDetails({
            faramValues,
            faramErrors,
            regionId: this.props.countryId,
        });
    };

    handleDeleteButtonClick = () => {
        const { countryDetail } = this.props;
        this.startRequestForRegionDelete(countryDetail.id);
    }

    renderHeader = () => {
        const {
            countryDetail,
            activeUser,
        } = this.props;

        const {
            faramValues = {},
            pristine = false,
        } = this.props.regionDetail;

        const confirmMsg = _ts('countries', 'deleteCountryConfirm', {
            country: (<b>{countryDetail.title}</b>),
        });

        return (
            <header className={styles.header} >
                <div className={styles.topContainer} >
                    <h3 className={styles.heading} >
                        {faramValues.title}
                    </h3>
                    <div className={styles.rightContainer} >
                        {
                            activeUser.isSuperuser &&
                            <Fragment>
                                <DangerConfirmButton
                                    onClick={this.handleDeleteButtonClick}
                                    confirmationMessage={confirmMsg}
                                >
                                    {_ts('countries', 'deleteCountryButtonLabel')}
                                </DangerConfirmButton>
                                <WarningButton
                                    disabled={!pristine}
                                    onClick={this.handleDiscardButtonClick}
                                >
                                    {_ts('countries', 'discardButtonLabel')}
                                </WarningButton>
                                <SuccessButton
                                    type="submit"
                                    disabled={!pristine}
                                >
                                    {_ts('countries', 'saveButtonLabel')}
                                </SuccessButton>
                            </Fragment>
                        }
                    </div>
                </div>
                <ScrollTabs
                    useHash
                    className={styles.bottomContainer}
                    replaceHistory
                    tabs={this.routes}
                    defaultHash={this.defaultHash}
                />
            </header>
        );
    }

    render() {
        const {
            deletePending,
            dataLoading,
            patchPending,
        } = this.state;

        const {
            className,
            countryId,
            activeUser,
        } = this.props;

        const {
            faramErrors = {},
            faramValues = {},
            pristine = false,
        } = this.props.regionDetail;

        const HeaderWithTabs = this.renderHeader;
        const loading = patchPending || deletePending || dataLoading;

        return (
            <Fragment>
                <Prompt
                    message={
                        (location) => {
                            const { pathname } = location;
                            const { routeUrl } = this.props;

                            if (!pristine || pathname === routeUrl) {
                                return true;
                            }
                            return _ts('common', 'youHaveUnsavedChanges');
                        }
                    }
                />
                <Faram
                    className={`${className} ${styles.countryDetail}`}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleValidationFailure}
                    onValidationSuccess={this.handleValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={loading}
                >
                    { loading &&
                        <LoadingAnimation className={styles.loadingAnimation} />
                    }
                    { !activeUser.isSuperuser ? (
                        <div className={styles.detailsNoEdit}>
                            <RegionDetailView
                                className={styles.regionDetails}
                                countryId={countryId}
                            />
                            <RegionMap
                                className={styles.regionMap}
                                regionId={countryId}
                            />
                        </div>
                    ) : (
                        <Fragment>
                            <HeaderWithTabs />
                            <MultiViewContainer
                                useHash
                                views={this.views}
                            />
                        </Fragment>
                    )}
                </Faram>
            </Fragment>
        );
    }
}
