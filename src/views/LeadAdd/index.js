import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';

import Page from '#rscv/Page';
import {
    isTruthy,
    randomString,
    reverseRoute,
} from '#rsu/common';
import { CoordinatorBuilder } from '#rsu/coordinate';
import List from '#rscv/List';
import Message from '#rscv/Message';

import Cloak from '#components/general/Cloak';
import BackLink from '#components/general/BackLink';

import { pathNames } from '#constants/';
import {
    routeStateSelector,
    leadFilterOptionsSelector,

    addLeadViewActiveLeadIdSelector,
    addLeadViewHasActiveLeadSelector,
    addLeadViewLeadsSelector,
    addLeadViewLeadStatesSelector,

    addLeadViewAddLeadsAction,
    addLeadViewLeadChangeAction,
    addLeadViewLeadSaveAction,
    addLeadViewRemoveSavedLeadsAction,
    addLeadViewSetLeadRestsAction,
    addLeadViewButtonStatesSelector,

    addLeadViewResetUiStateAction,
    routeUrlSelector,
    projectIdFromRouteSelector,
} from '#redux';
import { leadAccessor } from '#entities/lead';
import _ts from '#ts';
import notify from '#notify';

import FormSaveRequest from './requests/FormSaveRequest';

import LeadActions from './LeadActions';
import LeadFilter from './LeadFilter';
import LeadButtons from './LeadButtons';
import LeadList from './LeadList';
import LeadFormItem from './LeadFormItem';

import styles from './styles.scss';

const mapStateToProps = state => ({
    projectId: projectIdFromRouteSelector(state),
    routeState: routeStateSelector(state),
    leadFilterOptions: leadFilterOptionsSelector(state),
    activeLeadId: addLeadViewActiveLeadIdSelector(state),
    hasActiveLead: addLeadViewHasActiveLeadSelector(state),
    addLeadViewLeads: addLeadViewLeadsSelector(state),
    leadStates: addLeadViewLeadStatesSelector(state),
    buttonStates: addLeadViewButtonStatesSelector(state),
    routeUrl: routeUrlSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
    addLeadViewLeadSave: params => dispatch(addLeadViewLeadSaveAction(params)),
    addLeadViewRemoveSavedLeads: params => dispatch(addLeadViewRemoveSavedLeadsAction(params)),
    addLeads: leads => dispatch(addLeadViewAddLeadsAction(leads)),
    setLeadRests: params => dispatch(addLeadViewSetLeadRestsAction(params)),
    resetUiState: () => dispatch(addLeadViewResetUiStateAction()),
});

const propTypes = {
    projectId: PropTypes.number,
    activeLeadId: PropTypes.string,
    hasActiveLead: PropTypes.bool.isRequired,
    addLeadViewLeads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    addLeadViewLeadSave: PropTypes.func.isRequired,
    addLeadViewLeadChange: PropTypes.func.isRequired,

    routeState: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    addLeads: PropTypes.func.isRequired,
    addLeadViewRemoveSavedLeads: PropTypes.func.isRequired,

    history: PropTypes.shape({
        replace: PropTypes.func,
    }).isRequired,
    location: PropTypes.shape({
        path: PropTypes.string,
    }).isRequired,

    setLeadRests: PropTypes.func.isRequired,
    leadStates: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    buttonStates: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    resetUiState: PropTypes.func.isRequired,
    routeUrl: PropTypes.string.isRequired,
};

const defaultProps = {
    activeLeadId: undefined,
    projectId: undefined,
};


@connect(mapStateToProps, mapDispatchToProps)
export default class LeadAdd extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHideButtons = ({ leadPermissions }) => !leadPermissions.create;

    constructor(props) {
        super(props);

        this.state = {
            pendingSubmitAll: false,
        };

        // Store references to lead forms
        this.leadFormSubmitters = { };

        this.formCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .preSession(() => {
                this.setState({ pendingSubmitAll: true });
            })
            .postSession((totalErrors) => {
                if (totalErrors > 0) {
                    notify.send({
                        title: _ts('addLeads', 'leadSave'),
                        type: notify.type.ERROR,
                        message: _ts('addLeads', 'leadSaveFailure', { errorCount: totalErrors }),
                        duration: notify.duration.SLOW,
                    });
                } else {
                    notify.send({
                        title: _ts('addLeads', 'leadSave'),
                        type: notify.type.SUCCESS,
                        message: _ts('addLeads', 'leadSaveSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                }
                this.setState({ pendingSubmitAll: false });
            })
            .build();
        this.uploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .build();
        this.driveUploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(2)
            .build();
        this.dropboxUploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(2)
            .build();
    }

    componentWillMount() {
        this.props.resetUiState();
    }

    componentDidMount() {
        this.props.addLeadViewRemoveSavedLeads();

        const { routeState } = this.props;
        const { serverId, faramValues } = routeState;
        if (isTruthy(serverId)) {
            const uid = randomString();
            const newLeadId = `lead-${uid}`;
            const newLead = {
                id: newLeadId,
                serverId,
                faramValues,
                pristine: true,
            };
            this.props.addLeads([newLead]);

            // NOTE:
            // location.state is not cleared on replace so you lose your
            // progress for the lead that was added as edit
            // So clear location.state
            const { path } = this.props.location;
            this.props.history.replace(path, {});
        }
    }

    componentWillUnmount() {
        this.formCoordinator.stop();
        this.uploadCoordinator.stop();
        this.driveUploadCoordinator.stop();
        this.dropboxUploadCoordinator.stop();
    }

    // HANDLE FORM

    handleFormSubmitSuccess = (lead, newValues) => {
        const formSaveRequest = new FormSaveRequest({
            formCoordinator: this.formCoordinator,
            addLeadViewLeadSave: this.props.addLeadViewLeadSave,
            addLeadViewLeadChange: this.props.addLeadViewLeadChange,
            setLeadRests: this.props.setLeadRests,
        });
        const request = formSaveRequest.create(lead, newValues);
        return request;
    }

    handleFormSubmitFailure = (id) => {
        this.formCoordinator.notifyComplete(id, true);
    }

    // RENDER

    renderLeadDetail = (key, lead) => {
        const {
            activeLeadId,
            leadFilterOptions,
            leadStates,
        } = this.props;

        const {
            isSaveDisabled,
            isFormDisabled,
            isFormLoading,
        } = leadStates[key] || {};

        const { pendingSubmitAll } = this.state;

        const { project } = leadAccessor.getFaramValues(lead);
        const leadOptions = leadFilterOptions[project];

        const setSubmitter = (submitter) => {
            this.leadFormSubmitters[key] = submitter;
        };

        return (
            <LeadFormItem
                setSubmitter={setSubmitter}
                key={key}
                leadKey={key}
                active={key === activeLeadId}
                lead={lead}
                isFormDisabled={isFormDisabled}
                isFormLoading={isFormLoading}
                isSaveDisabled={isSaveDisabled}
                isBulkActionDisabled={pendingSubmitAll}
                leadOptions={leadOptions}
                onFormSubmitFailure={this.handleFormSubmitFailure}
                onFormSubmitSuccess={this.handleFormSubmitSuccess}
            />
        );
    }

    render() {
        const {
            hasActiveLead,
            addLeadViewLeads,
            buttonStates,
            projectId,
        } = this.props;
        const { isSaveEnabledForAll } = buttonStates;
        const { pendingSubmitAll } = this.state;

        return (
            <React.Fragment>
                <Prompt
                    message={
                        (location) => {
                            const { routeUrl } = this.props;
                            if (location.pathname === routeUrl) {
                                return true;
                            } else if (!isSaveEnabledForAll) {
                                return true;
                            }
                            return _ts('common', 'youHaveUnsavedChanges');
                        }
                    }
                />
                <Page
                    className={styles.addLead}
                    headerClassName={styles.header}
                    header={
                        <React.Fragment>
                            <div className={styles.leftContainer}>
                                <BackLink
                                    defaultLink={reverseRoute(pathNames.leads, { projectId })}
                                />
                                <LeadFilter />
                            </div>
                            { hasActiveLead && (
                                <LeadActions
                                    leadFormSubmitters={this.leadFormSubmitters}
                                    formCoordinator={this.formCoordinator}
                                    uploadCoordinator={this.uploadCoordinator}
                                    pendingSubmitAll={pendingSubmitAll}
                                />
                            ) }
                        </React.Fragment>
                    }
                    mainContentClassName={styles.mainContent}
                    mainContent={
                        <React.Fragment>
                            <div className={styles.left}>
                                <LeadList />
                                <Cloak
                                    hide={LeadActions.shouldHideButtons}
                                    render={
                                        <LeadButtons
                                            uploadCoordinator={this.uploadCoordinator}
                                            driveUploadCoordinator={this.driveUploadCoordinator}
                                            dropboxUploadCoordinator={this.dropboxUploadCoordinator}
                                        />
                                    }
                                />
                            </div>
                            {
                                addLeadViewLeads.length === 0 ? (
                                    <Message>
                                        { _ts('addLeads', 'noLeadsText') }
                                    </Message>
                                ) : (
                                    <List
                                        data={addLeadViewLeads}
                                        modifier={this.renderLeadDetail}
                                        keySelector={leadAccessor.getKey}
                                    />
                                )
                            }
                        </React.Fragment>
                    }
                />
            </React.Fragment>
        );
    }
}
