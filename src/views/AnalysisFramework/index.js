import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';

import Page from '#rscv/Page';
import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiViewContainer from '#rscv/MultiViewContainer';
import SuccessButton from '#rsca/Button/SuccessButton';
import SuccessConfirmButton from '#rsca/ConfirmButton/SuccessConfirmButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import ScrollTabs from '#rscv/ScrollTabs';
import Message from '#rscv/Message';
import BackLink from '#components/general/BackLink';

import { VIEW } from '#widgets';
import {
    afIdFromRoute,
    setAfViewAnalysisFrameworkAction,

    afViewAnalysisFrameworkSelector,
    afViewPristineSelector,
    activeProjectIdFromStateSelector,

    setAfViewGeoOptionsAction,

    routeUrlSelector,
} from '#redux';
import { pathNames } from '#constants';
import _ts from '#ts';

import FrameworkGetRequest from './requests/FrameworkGet';
import GeoOptionsRequest from './requests/GeoOptionsRequest';
import FrameworkSaveRequest from './requests/FrameworkSave';
import Overview from './Overview';
import List from './List';
import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
    pristine: PropTypes.bool.isRequired,

    routeUrl: PropTypes.string.isRequired,
    setGeoOptions: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = state => ({
    analysisFramework: afViewAnalysisFrameworkSelector(state),
    pristine: afViewPristineSelector(state),
    analysisFrameworkId: afIdFromRoute(state),
    projectId: activeProjectIdFromStateSelector(state),
    routeUrl: routeUrlSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFramework: params => dispatch(setAfViewAnalysisFrameworkAction(params)),
    setGeoOptions: params => dispatch(setAfViewGeoOptionsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class AnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingFramework: true,
            pendingGeoOptions: true,
            pendingSaveFramework: false,
        };

        this.frameworkGetRequest = new FrameworkGetRequest({
            setState: params => this.setState(params),
            setAnalysisFramework: this.props.setAnalysisFramework,
            getAnalysisFramework: () => this.props.analysisFramework,
        });

        this.geoOptionsRequest = new GeoOptionsRequest({
            setState: params => this.setState(params),
            setGeoOptions: this.props.setGeoOptions,
        });

        this.frameworkSaveRequest = new FrameworkSaveRequest({
            setState: params => this.setState(params),
            setAnalysisFramework: this.props.setAnalysisFramework,
        });

        this.views = {
            [VIEW.overview]: {
                component: Overview,
                rendererParams: () => ({
                    analysisFramework: this.props.analysisFramework,
                    pending: this.state.pendingSaveFramework,
                }),
                wrapContainer: true,
                mount: true,
            },
            [VIEW.list]: {
                component: List,
                rendererParams: () => ({
                    analysisFramework: this.props.analysisFramework,
                    pending: this.state.pendingSaveFramework,
                }),
                wrapContainer: true,
                mount: true,
            },
        };

        this.tabs = {
            [VIEW.overview]: _ts('framework', 'overviewTabTitle'),
            [VIEW.list]: _ts('framework', 'listTabTitle'),
        };

        this.defaultHash = VIEW.overview;
    }

    componentWillMount() {
        this.frameworkGetRequest.init(this.props.analysisFrameworkId);
        this.frameworkGetRequest.start();

        this.geoOptionsRequest.init(this.props.analysisFrameworkId);
        this.geoOptionsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { analysisFrameworkId: oldAnalysisFrameworkId } = this.props;
        const { analysisFrameworkId: newAnalysisFrameworkId } = nextProps;

        if (oldAnalysisFrameworkId !== newAnalysisFrameworkId) {
            if (this.analysisFrameworkSaveRequest) {
                this.analysisFrameworkSaveRequest.stop();
            }
            if (this.geoOptionsRequest) {
                this.geoOptionsRequest.stop();
            }

            this.frameworkGetRequest.init(newAnalysisFrameworkId);
            this.frameworkGetRequest.start();

            this.geoOptionsRequest.init(newAnalysisFrameworkId);
            this.geoOptionsRequest.start();
        }
    }

    componentWillUnmount() {
        this.frameworkGetRequest.stop();
        this.frameworkSaveRequest.stop();
        this.geoOptionsRequest.stop();
    }

    handleSave = () => {
        const {
            analysisFrameworkId,
            analysisFramework,
        } = this.props;

        this.frameworkSaveRequest.init(analysisFrameworkId, analysisFramework);
        this.frameworkSaveRequest.start();
    }

    handleCancel = () => {
        // The second signifies cancel operation
        this.frameworkGetRequest.init(this.props.analysisFrameworkId, true);
        this.frameworkGetRequest.start();
    }

    render() {
        const {
            analysisFramework = {},
            projectId,
            pristine,
        } = this.props;
        const { entriesCount } = analysisFramework;

        const {
            pendingFramework,
            pendingSaveFramework,
            pendingGeoOptions,
        } = this.state;

        if (pendingFramework || pendingGeoOptions) {
            return (
                <div className={styles.analysisFrameworkLoading}>
                    <LoadingAnimation />
                </div>
            );
        }

        if (!analysisFramework.id) {
            return (
                <Message className={styles.analysisFramework}>
                    {_ts('framework', 'noAnalysisFramework')}
                </Message>
            );
        }

        const exitPath = reverseRoute(pathNames.projects, { projectId });
        const frameworkTitle = analysisFramework.title || _ts('framework', 'analysisFramework');

        return (
            <React.Fragment>
                <Page
                    className={styles.analysisFramework}
                    headerClassName={styles.header}
                    header={
                        <React.Fragment>
                            <BackLink
                                defaultLink={{
                                    pathname: exitPath,
                                    hash: '#/frameworks',
                                }}
                            />
                            <h4 className={styles.heading}>
                                { frameworkTitle }
                            </h4>
                            <ScrollTabs
                                className={styles.tabs}
                                tabs={this.tabs}
                                useHash
                                replaceHistory
                                defaultHash={this.defaultHash}
                            />
                            <div className={styles.actionButtons}>
                                <DangerConfirmButton
                                    confirmationMessage={_ts('framework', 'cancelConfirmDetail')}
                                    onClick={this.handleCancel}
                                    disabled={pristine || pendingSaveFramework}
                                >
                                    { _ts('framework', 'cancelButtonTitle') }
                                </DangerConfirmButton>
                                { entriesCount > 0 ? (
                                    <SuccessConfirmButton
                                        confirmationMessage={_ts('framework', 'successConfirmDetail', { count: entriesCount })}
                                        onClick={this.handleSave}
                                        disabled={pristine || pendingSaveFramework}
                                    >
                                        { _ts('framework', 'saveButtonTitle') }
                                    </SuccessConfirmButton>
                                ) : (
                                    <SuccessButton
                                        onClick={this.handleSave}
                                        disabled={pristine || pendingSaveFramework}
                                    >
                                        { _ts('framework', 'saveButtonTitle') }
                                    </SuccessButton>
                                ) }
                            </div>
                        </React.Fragment>
                    }
                    mainContentClassName={styles.main}
                    mainContent={
                        <MultiViewContainer
                            views={this.views}
                            useHash
                            containerClassName={styles.content}
                            activeClassName={styles.active}
                        />
                    }
                />
                <Prompt
                    message={
                        (location) => {
                            const { routeUrl } = this.props;
                            if (location.pathname === routeUrl) {
                                return true;
                            } else if (pristine) {
                                return true;
                            }
                            return _ts('common', 'youHaveUnsavedChanges');
                        }
                    }
                />
            </React.Fragment>
        );
    }
}
