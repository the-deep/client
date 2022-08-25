import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { detachedFaram } from '@togglecorp/faram';

import Page from '#rscv/Page';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ResizableH from '#rscv/Resizable/ResizableH';
import {
    checkVersion,
    isDefined,
} from '@togglecorp/fujs';
import Message from '#rscv/Message';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';
import {
    routeUrlSelector,
    setAryTemplateAction,
    setAryForEditAryAction,
    setGeoOptionsAction,
    setErrorAryForEditAryAction,
    setFilesForEditAryAction,
    removeAryForEditAryAction,
    setProjectAction,
    editAryHasErrorsSelector,
    editAryIsPristineSelector,
    assessmentSchemaSelector,

    editAryFaramValuesSelector,
    projectIdFromRoute,
    leadIdFromRouteSelector,
    leadGroupIdFromRouteSelector,
    editAryVersionIdSelector,
    editAryServerIdSelector,
} from '#redux';
import notify from '#notify';
import _ts from '#ts';
import _cs from '#cs';

import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    routeUrl: PropTypes.string.isRequired,
    projectId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types

    editAryFaramValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    editAryHasErrors: PropTypes.bool.isRequired,
    editAryIsPristine: PropTypes.bool.isRequired,
    setErrorAry: PropTypes.func.isRequired,

    activeLeadId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    activeLeadGroupId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    editAryVersionId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    editAryServerId: PropTypes.number,
    setAry: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setAryTemplate: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    removeAry: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setGeoOptions: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types

    // FIXME: inject for individual request
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setDefaultRequestParams: PropTypes.func.isRequired,
    setProject: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
    className: undefined,
    schema: {},
    editAryVersionId: undefined,
    editAryServerId: undefined,

    activeLeadId: undefined,
    activeLeadGroupId: undefined,
    editAryFaramValues: {},
};

const mapStateToProps = state => ({
    projectId: projectIdFromRoute(state),
    activeLeadId: leadIdFromRouteSelector(state),
    activeLeadGroupId: leadGroupIdFromRouteSelector(state),
    editAryVersionId: editAryVersionIdSelector(state),
    editAryServerId: editAryServerIdSelector(state),
    editAryHasErrors: editAryHasErrorsSelector(state),
    editAryIsPristine: editAryIsPristineSelector(state),
    editAryFaramValues: editAryFaramValuesSelector(state),
    schema: assessmentSchemaSelector(state),
    routeUrl: routeUrlSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
    setErrorAry: params => dispatch(setErrorAryForEditAryAction(params)),
    removeAry: params => dispatch(removeAryForEditAryAction(params)),
    setAryTemplate: params => dispatch(setAryTemplateAction(params)),
    setAry: params => dispatch(setAryForEditAryAction(params)),
    setFiles: params => dispatch(setFilesForEditAryAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
});

const requestOptions = {
    assessmentRequest: {
        extras: {
            schemaName: 'aryGetResponse',
        },
        url: ({ props: { activeLeadId, activeLeadGroupId } }) => (
            activeLeadId === undefined
                ? `/lead-group-assessments/${activeLeadGroupId}/`
                : `/lead-assessments/${activeLeadId}/`
        ),
        onMount: ({ props }) => !!props.activeLeadId || !!props.activeLeadGroupId,
        onPropsChanged: ['activeLeadId', 'activeLeadGroupId'],
        onSuccess: ({ props, response, params }) => {
            const oldVersionId = props.editAryVersionId;

            // NOTE: we always update files (because the cached link may change)
            props.setFiles({
                leadId: response.lead,
                leadGroupId: response.leadGroup,
                files: response.galleryFilesDetails,
            });

            let shouldSetValue = true;
            let isValueOverriden = false;

            if (!params.override) {
                ({
                    shouldSetValue,
                    isValueOverriden,
                } = checkVersion(oldVersionId, response.versionId));
            }

            if (shouldSetValue) {
                props.setAry({
                    serverId: response.id,
                    leadId: response.lead,
                    leadGroupId: response.leadGroup,
                    versionId: response.versionId,
                    metadata: response.metadata,
                    methodology: response.methodology,
                    summary: response.summary,
                    questionnaire: response.questionnaire,
                    score: response.score,
                });
            }
            if (isValueOverriden) {
                // FIXME: use strings
                notify.send({
                    type: notify.type.WARNING,
                    title: 'Assessment',
                    message: 'Your copy was overridden by server\'s copy.',
                    duration: notify.duration.SLOW,
                });
            }
        },
        onFailure: ({
            error,
            props: {
                activeLeadId,
                activeLeadGroupId,
                editAryServerId,
                removeAry,
            },
        }) => {
            // If error code is 404, and server id is present, it means that the
            // assesment is deleted in server, so we need to remove local data from redux
            if (error.response.errorCode === 404 && isDefined(editAryServerId)) {
                removeAry({
                    leadId: activeLeadId,
                    leadGroupId: activeLeadGroupId,
                });
            }
        },
    },
    leadRequest: {
        extras: {
            schemaName: 'lead',
        },
        url: ({ props: { activeLeadId } }) => `/v2/leads/${activeLeadId}/`,
        onMount: ({ props: { activeLeadId } }) => !!activeLeadId,
        onPropsChanged: ['activeLeadId'],
        // TODO: check mismatch between project and lead
    },
    leadGroupRequest: {
        extras: {
            schemaName: 'leadGroup',
        },
        url: ({ props: { activeLeadGroupId } }) => `/lead-groups/${activeLeadGroupId}/`,
        onMount: ({ props: { activeLeadGroupId } }) => !!activeLeadGroupId,
        onPropsChanged: ['activeLeadGroupId'],
        // TODO: check mismatch between project and leadGroup
    },
    assessmentTemplateRequest: {
        extras: {
            schemaName: 'aryTemplateGetResponse',
        },
        url: ({ props: { projectId } }) => `/projects/${projectId}/assessment-template/`,
        onMount: ({ props: { projectId } }) => !!projectId,
        onPropsChanged: ['projectId'],
        onPreLoad: ({ params }) => {
            params.setState({ noTemplate: false });
        },
        onSuccess: ({ props, response }) => {
            props.setAryTemplate({
                template: response,
                projectId: props.projectId,
            });
        },
        onFailure: ({ params }) => {
            params.setState({ noTemplate: true });
        },
    },
    projectGetRequest: {
        onMount: ({ props: { projectId } }) => !!projectId,
        onPropsChanged: ['projectId'],
        extras: {
            schemaName: 'projectGetResponse',
        },
        url: ({ props: { projectId } }) => `/projects/${projectId}/`,
        onSuccess: ({ props, response }) => {
            const {
                setProject,
            } = props;

            setProject({ project: response });
        },
    },
    geoOptionsDataRequest: {
        extras: {
            credentials: 'omit',
        },
        url: ({ params }) => params.url,
        onSuccess: ({ props, response }) => {
            props.setGeoOptions({
                projectId: props.projectId,
                locations: response,
            });
        },
    },
    geoOptionsRequest: {
        url: '/geo-options/',
        query: ({ props: { projectId } }) => ({ project: projectId }),
        onMount: ({ props: { projectId } }) => !!projectId,
        onPropsChanged: ['projectId'],
        onSuccess: ({ props, response }) => {
            props.requests.geoOptionsDataRequest.do({ url: response.geoOptionsCachedFile });
        },
    },
    arySaveRequest: {
        extras: {
            schemaName: 'aryPutResponse',
        },
        url: ({ params: { value } }) => (value.id ? `/assessments/${value.id}/` : '/assessments/'),
        method: ({ params: { value } }) => (value.id ? methods.PUT : methods.POST),
        body: ({ params }) => params.value,
        onSuccess: ({ props, response }) => {
            props.setFiles({
                leadId: response.lead,
                leadGroupId: response.leadGroup,
                files: response.galleryFilesDetails,
            });
            props.setAry({
                leadId: response.lead,
                leadGroupId: response.leadGroup,
                serverId: response.id,
                versionId: response.versionId,
                metadata: response.metadata,
                methodology: response.methodology,
                summary: response.summary,
                score: response.score,
                questionnaire: response.questionnaire,
                files: response.galleryFilesDetails,
            });

            // FIXME: use strings
            notify.send({
                type: notify.type.SUCCESS,
                title: _ts('assessments', 'assessmentTitle'),
                message: _ts('assessments', 'assessmentSaveSuccessMessage'),
                duration: notify.duration.MEDIUM,
            });
        },
    },
    assessmentOptionsRequest: {
        url: '/assessment-options/',
        onMount: true,
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requestOptions)
export default class EditAry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            noTemplate: false,
            activeSector: undefined,
            pendingUploads: {},
        };

        this.props.setDefaultRequestParams({
            setState: params => this.setState(params),
        });
    }

    getLeadTitle = memoize((activeLeadId, response = {}) => (
        activeLeadId
            ? response.title
            : (response.leads || []).map(lead => lead.title).join(',')
    ))

    handleUploadPending = (key, value) => {
        this.setState(state => ({
            ...state,
            pendingUploads: {
                ...state.pendingUploads,
                [key]: value,
            },
        }));
    }

    handleActiveSectorChange = (activeSector) => {
        this.setState({ activeSector });
    }

    handleCancelButtonClick = () => {
        const {
            setAry,
            editAryServerId,
            activeLeadId,
            activeLeadGroupId,
            requests: {
                assessmentRequest,
            },
        } = this.props;

        if (editAryServerId) {
            assessmentRequest.do({
                override: true,
            });
        } else {
            // NOTE: no need to clear out the ary files here

            setAry({
                leadId: activeLeadId,
                leadGroupId: activeLeadGroupId,
            });
        }
    }

    handleFaramValidationSuccess = (value) => {
        const {
            requests: {
                arySaveRequest,
            },
            editAryServerId,
            activeLeadId,
            activeLeadGroupId,
            projectId,
        } = this.props;

        arySaveRequest.do({
            value: {
                ...value,
                project: projectId,
                id: editAryServerId,
                lead: activeLeadId,
                leadGroup: activeLeadGroupId,
            },
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        if (this.props.activeLeadId) {
            this.props.setErrorAry({
                leadId: this.props.activeLeadId,
                faramErrors,
            });
        } else {
            this.props.setErrorAry({
                leadGroupId: this.props.activeLeadGroupId,
                faramErrors,
            });
        }
    };

    handleSaveButtonClick = () => {
        detachedFaram({
            value: this.props.editAryFaramValues,
            schema: this.props.schema,
            onValidationFailure: this.handleFaramValidationFailure,
            onValidationSuccess: this.handleFaramValidationSuccess,
        });
    }

    render() {
        const {
            requests: {
                assessmentRequest,
                leadGroupRequest,
                assessmentTemplateRequest,
                geoOptionsRequest,
                geoOptionsDataRequest,
                arySaveRequest,
                leadRequest,
                projectGetRequest,
                assessmentOptionsRequest,
            },

            activeLeadId,
            editAryIsPristine,
            editAryHasErrors,
            className: classNameFromProps,
        } = this.props;

        const {
            noTemplate,
            activeSector,
            pendingUploads,
        } = this.state;

        const className = _cs(
            classNameFromProps,
            styles.editAssessment,
        );

        if (noTemplate) {
            return (
                <Page
                    className={className}
                    mainContent={
                        <Message>
                            {_ts('editAssessment', 'noAryTemplateForProject')}
                        </Message>
                    }
                />
            );
        } else if (
            leadRequest.pending
                || leadGroupRequest.pending
                || assessmentTemplateRequest.pending
                || geoOptionsRequest.pending
                || projectGetRequest.pending
                || geoOptionsDataRequest.pending
        ) {
            return (
                <Page
                    className={className}
                    mainContent={<LoadingAnimation />}
                />
            );
        }

        const title = this.getLeadTitle(activeLeadId, leadRequest.response);
        const shouldHidePrompt = editAryIsPristine;
        const uploadPending = Object.keys(pendingUploads).some(key => pendingUploads[key]);

        return (
            <React.Fragment>
                <Page
                    className={className}
                    headerClassName={styles.header}
                    header={
                        <React.Fragment>
                            <h3 className={styles.heading}>
                                {title}
                            </h3>
                            <div className={styles.actionButtons}>
                                <DangerButton
                                    disabled={
                                        editAryIsPristine
                                            || assessmentRequest.pending
                                            || uploadPending
                                    }
                                    onClick={this.handleCancelButtonClick}
                                >
                                    { _ts('editAssessment', 'cancelButtonTitle') }
                                </DangerButton>
                                <SuccessButton
                                    pending={arySaveRequest.pending}
                                    onClick={this.handleSaveButtonClick}
                                    disabled={
                                        editAryIsPristine
                                            || editAryHasErrors
                                            || assessmentRequest.pending
                                            || uploadPending
                                    }
                                >
                                    { _ts('editAssessment', 'saveButtonTitle') }
                                </SuccessButton>
                            </div>
                        </React.Fragment>
                    }
                    mainContentClassName={styles.main}
                    mainContent={
                        <ResizableH
                            className={styles.assessments}
                            leftContainerClassName={styles.left}
                            rightContainerClassName={styles.right}
                            leftChild={
                                <LeftPanel
                                    className={styles.leftPanel}
                                    lead={leadRequest.response}
                                    leadGroup={leadGroupRequest.response}
                                    activeSector={activeSector}
                                />
                            }
                            rightChild={
                                <RightPanel
                                    onActiveSectorChange={this.handleActiveSectorChange}
                                    onUploadPending={this.handleUploadPending}
                                    protectionInfoItems={(
                                        assessmentOptionsRequest
                                            ?.response?.methodologyProtectionInfo
                                    )}
                                    pending={
                                        arySaveRequest.pending || assessmentRequest.pending
                                    }
                                />
                            }
                        />
                    }
                />
                <Prompt
                    message={
                        (location) => {
                            const { routeUrl } = this.props;
                            if (location.pathname === routeUrl) {
                                return true;
                            } else if (shouldHidePrompt) {
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
