import PropTypes from 'prop-types';
import React from 'react';
import produce from 'immer';
import memoize from 'memoize-one';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';

import Page from '#rscv/Page';
import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiViewContainer from '#rscv/MultiViewContainer';
import SuccessButton from '#rsca/Button/SuccessButton';
import AccentButton from '#rsca/Button/AccentButton';
import SuccessConfirmButton from '#rsca/ConfirmButton/SuccessConfirmButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import ScrollTabs from '#rscv/ScrollTabs';
import Message from '#rscv/Message';
import BackLink from '#components/general/BackLink';
import modalize from '#rscg/Modalize';

import Cloak from '#components/general/Cloak';

import { VIEW } from '#widgets';
import {
    afIdFromRoute,
    setAfViewAnalysisFrameworkAction,

    afViewAnalysisFrameworkSelector,
    afViewPristineSelector,
    activeProjectIdFromStateSelector,

    setAfViewGeoOptionsAction,
    updateAfViewWidgetAction,

    routeUrlSelector,
} from '#redux';
import { pathNames } from '#constants';
import _ts from '#ts';

import FrameworkGetRequest from './requests/FrameworkGet';
import GeoOptionsRequest from './requests/GeoOptionsRequest';
import FrameworkSaveRequest from './requests/FrameworkSave';
import EditVizSettingsModal from './EditVizSettingsModal';
import Overview from './Overview';
import List from './List';
import styles from './styles.scss';

const ModalButton = modalize(AccentButton);

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    updateWidget: PropTypes.func.isRequired,
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
    updateWidget: params => dispatch(updateAfViewWidgetAction(params)),
});

const shouldHideVisualizationSettings = ({
    accessEntryVisualizationConfiguration,
}) => !accessEntryVisualizationConfiguration;

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

            selectedWidgetKey: undefined,
            temporaryWidgetState: undefined,
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
                rendererParams: () => {
                    const {
                        analysisFramework: {
                            id: analysisFrameworkId,
                            widgets,
                        } = {},
                    } = this.props;
                    const {
                        pendingSaveFramework,
                        selectedWidgetKey,
                        temporaryWidgetState,
                    } = this.state;

                    return {
                        analysisFrameworkId,
                        widgets: this.getPatchedWidgets(
                            widgets,
                            selectedWidgetKey,
                            temporaryWidgetState,
                        ),
                        pending: pendingSaveFramework,
                        onWidgetEditClick: this.handleEditClick,
                        onWidgetSave: this.handleItemSave,
                        onWidgetChange: this.handleItemChange,
                        onWidgetCancel: this.handleItemCancel,
                        widgetsDisabled: !!selectedWidgetKey,
                        selectedWidgetKey,
                        temporaryWidgetState,
                    };
                },
                wrapContainer: true,
                mount: true,
            },
            [VIEW.list]: {
                component: List,
                rendererParams: () => {
                    const {
                        analysisFramework: {
                            id: analysisFrameworkId,
                            widgets,
                        } = {},
                    } = this.props;
                    const {
                        pendingSaveFramework,
                        selectedWidgetKey,
                        temporaryWidgetState,
                    } = this.state;

                    return {
                        analysisFrameworkId,
                        widgets: this.getPatchedWidgets(
                            widgets,
                            selectedWidgetKey,
                            temporaryWidgetState,
                        ),
                        pending: pendingSaveFramework,
                        onWidgetEditClick: this.handleEditClick,
                        onWidgetSave: this.handleItemSave,
                        onWidgetChange: this.handleItemChange,
                        onWidgetCancel: this.handleItemCancel,
                        widgetsDisabled: !!selectedWidgetKey,
                        selectedWidgetKey,
                        temporaryWidgetState,
                    };
                },
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
            this.geoOptionsRequest.stop();

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

    getPatchedWidgets = memoize((widgets, selectedWidgetKey, temporaryWidgetState) => {
        if (!selectedWidgetKey || !temporaryWidgetState) {
            return widgets;
        }
        const newWidgets = produce(widgets, (safeWidgets) => {
            const selectedWidgetIndex = safeWidgets.findIndex(w => w.key === selectedWidgetKey);
            if (selectedWidgetIndex === -1) {
                return;
            }
            // eslint-disable-next-line no-param-reassign
            safeWidgets[selectedWidgetIndex].title = temporaryWidgetState.title;
            // eslint-disable-next-line no-param-reassign
            safeWidgets[selectedWidgetIndex].properties.data = temporaryWidgetState.properties.data;
        });
        return newWidgets;
    });

    handleEditClick = (key, widget) => {
        this.setState({
            selectedWidgetKey: key,
            temporaryWidgetState: widget,
        });
    }

    handleItemChange = (key, data, title) => {
        const {
            temporaryWidgetState,
        } = this.state;

        if (key !== temporaryWidgetState.key) {
            console.error('Trying to edit temporary state of another widget');
            return;
        }

        const newTemporaryWidgetState = produce(temporaryWidgetState, (safeWidgetState) => {
            // eslint-disable-next-line no-param-reassign
            safeWidgetState.title = title;
            // eslint-disable-next-line no-param-reassign
            safeWidgetState.properties.data = data;
        });

        this.setState({
            temporaryWidgetState: newTemporaryWidgetState,
        });
    }

    handleItemSave = (key, data, title) => {
        const {
            analysisFramework: {
                id: analysisFrameworkId,
            } = {},
            updateWidget,
        } = this.props;

        this.setState({
            temporaryWidgetState: undefined,
            selectedWidgetKey: undefined,
        });

        updateWidget({
            analysisFrameworkId,
            widgetKey: key,
            widgetData: data,
            widgetTitle: title,
        });
    }

    handleItemCancel = () => {
        this.setState({
            temporaryWidgetState: undefined,
            selectedWidgetKey: undefined,
        });
    }

    handleSave = () => {
        const {
            analysisFrameworkId,
            analysisFramework,
        } = this.props;

        if (!analysisFramework) {
            return;
        }

        // NOTE: only sending data on save that is necessary
        const value = {
            id: analysisFramework.id,
            properties: analysisFramework.properties,
            widgets: analysisFramework.widgets,
        };
        this.frameworkSaveRequest.init(analysisFrameworkId, value);
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
            analysisFrameworkId,
            projectId,
            pristine,
        } = this.props;
        const { entriesCount } = analysisFramework;

        const {
            pendingFramework,
            pendingSaveFramework,
            pendingGeoOptions,
            selectedWidgetKey,
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
                                disabled={!!selectedWidgetKey}
                            />
                            <div className={styles.actionButtons}>
                                <Cloak
                                    hide={shouldHideVisualizationSettings}
                                    render={
                                        <ModalButton
                                            title={_ts('framework', 'editVizSettingsButtonTitle')}
                                            disabled={pendingSaveFramework || !!selectedWidgetKey}
                                            modal={(
                                                <EditVizSettingsModal
                                                    analysisFrameworkId={analysisFrameworkId}
                                                />
                                            )}
                                        >
                                            {_ts('framework', 'editVizSettingsButtonLabel')}
                                        </ModalButton>
                                    }
                                />
                                <DangerConfirmButton
                                    confirmationMessage={_ts('framework', 'cancelConfirmDetail')}
                                    onClick={this.handleCancel}
                                    disabled={
                                        pristine || pendingSaveFramework || !!selectedWidgetKey
                                    }
                                >
                                    { _ts('framework', 'cancelButtonTitle') }
                                </DangerConfirmButton>
                                { entriesCount > 0 ? (
                                    <SuccessConfirmButton
                                        confirmationMessage={_ts('framework', 'successConfirmDetail', { count: entriesCount })}
                                        onClick={this.handleSave}
                                        disabled={
                                            pristine || pendingSaveFramework || !!selectedWidgetKey
                                        }
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
                            const { selectedWidgetKey: widgetKey } = this.state;
                            if (location.pathname === routeUrl) {
                                return true;
                            } else if (pristine && !widgetKey) {
                                // Don't show prompt if it is pristine and
                                // there is no selected widget key
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
