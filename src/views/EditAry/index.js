import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoadingAnimation from '#rscv/LoadingAnimation';
import ResizableH from '#rscv/Resizable/ResizableH';
import { reverseRoute, checkVersion } from '#rsu/common';
import Message from '#rscv/Message';
import SuccessButton from '#rsca/Button/SuccessButton';

import {
    RequestCoordinator,
    RequestClient,
} from '#request';
import {
    setAryTemplateAction,
    setAryForEditAryAction,
    setGeoOptionsAction,

    projectIdFromRoute,
    leadIdFromRouteSelector,
    leadGroupIdFromRouteSelector,
    editAryVersionIdSelector,
} from '#redux';
import { pathNames } from '#constants';
import notify from '#notify';
import _ts from '#ts';
import BackLink from '#components/BackLink';

import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import styles from './styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types

    activeLeadId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    activeLeadGroupId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    editAryVersionId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    setAry: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setAryTemplate: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setGeoOptions: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types

    // FIXME: use RequestClient.propType.isRequired
    assessmentRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadGroupRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    geoOptionsRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/forbid-prop-types
    assessmentTemplateRequest: PropTypes.object.isRequired,
    // FIXME: inject for individual request
    setDefaultRequestParams: PropTypes.func.isRequired,
};

const defaultProps = {
    editAryVersionId: undefined,

    activeLeadId: undefined,
    activeLeadGroupId: undefined,
};

const mapStateToProps = state => ({
    projectId: projectIdFromRoute(state),
    activeLeadId: leadIdFromRouteSelector(state),
    activeLeadGroupId: leadGroupIdFromRouteSelector(state),
    editAryVersionId: editAryVersionIdSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAryTemplate: params => dispatch(setAryTemplateAction(params)),
    setAry: params => dispatch(setAryForEditAryAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
});

const requests = {
    assessmentRequest: {
        schema: 'aryGetRequest',
        url: ({ props: { activeLeadId, activeLeadGroupId } }) => (
            activeLeadId === undefined
                ? `/lead-group-assessments/${activeLeadGroupId}`
                : `/lead-assessments/${activeLeadId}`
        ),
        onMount: ({ props }) => !!props.activeLeadId || !!props.activeLeadGroupId,
        onPropsChanged: ['activeLeadId', 'activeLeadGroupId'],
        onSuccess: ({ props, response }) => {
            const oldVersionId = props.editAryVersionId;

            const {
                shouldSetValue,
                isValueOverriden,
            } = checkVersion(oldVersionId, response.versionId);

            if (shouldSetValue) {
                props.setAry({
                    serverId: response.id,
                    leadId: response.lead,
                    leadGroupId: response.leadGroupId,
                    versionId: response.versionId,
                    metadata: response.metadata,
                    methodology: response.methodology,
                    summary: response.summary,
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
    },
    leadRequest: {
        schema: 'lead',
        url: ({ props: { activeLeadId } }) => `/leads/${activeLeadId}`,
        onMount: ({ props: { activeLeadId } }) => !!activeLeadId,
        onPropsChanged: ['activeLeadId'],
        // TODO: check mismatch between project and lead
    },
    leadGroupRequest: {
        schema: 'leadGroup',
        url: ({ props: { activeLeadGroupId } }) => `/lead-groups/${activeLeadGroupId}`,
        onMount: ({ props: { activeLeadGroupId } }) => !!activeLeadGroupId,
        onPropsChanged: ['activeLeadGroupId'],
        // TODO: check mismatch between project and leadGroup
    },
    assessmentTemplateRequest: {
        schema: 'aryTemplateGetResponse',
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
    geoOptionsRequest: {
        schema: 'geoOptions',
        url: '/geo-options/',
        query: ({ props: { projectId } }) => ({ project: projectId }),
        onMount: ({ props: { projectId } }) => !!projectId,
        onPropsChanged: ['projectId'],
        onSuccess: ({ props, response }) => {
            props.setGeoOptions({
                projectId: props.projectId,
                locations: response,
            });
        },
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requests)
export default class EditAry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            noTemplate: false,
            activeSector: undefined,
        };

        this.props.setDefaultRequestParams({
            setState: params => this.setState(params),
        });
    }

    handleActiveSectorChange = (activeSector) => {
        this.setState({ activeSector });
    }

    render() {
        const {
            assessmentRequest,
            leadRequest,
            leadGroupRequest,
            assessmentTemplateRequest,
            geoOptionsRequest,
            projectId,
            activeLeadId,
        } = this.props;
        const {
            noTemplate,
            activeSector,
        } = this.state;

        if (noTemplate) {
            return (
                <Message>
                    {_ts('editAssessment', 'noAryTemplateForProject')}
                </Message>
            );
        } else if (
            leadRequest.pending
                || leadGroupRequest.pending
                || assessmentRequest.pending
                || assessmentTemplateRequest.pending
                || geoOptionsRequest.pending
        ) {
            return <LoadingAnimation large />;
        }

        const exitPath = reverseRoute(pathNames.leads, {
            projectId,
        });

        const title = activeLeadId
            ? leadRequest.response.title
            : (leadGroupRequest.response.leads || []).map(lead => lead.title).join(',');

        // FIXME: add prompt on leaving page

        return (
            <div className={styles.editAssessment}>
                <header className={styles.header}>
                    <BackLink
                        defaultLink={exitPath}
                    />
                    <h4 className={styles.heading}>
                        {title}
                    </h4>
                    <div className={styles.actionButtons}>
                        <SuccessButton
                            disabled
                        >
                            { _ts('editAssessment', 'saveButtonTitle') }
                        </SuccessButton>
                    </div>
                </header>
                <div className={styles.content}>
                    <ResizableH
                        className={styles.assessments}
                        leftContainerClassName={styles.left}
                        rightContainerClassName={styles.right}
                        leftChild={
                            <LeftPanel
                                lead={leadRequest.response}
                                leadGroup={leadGroupRequest.response}
                                activeSector={activeSector}
                            />
                        }
                        rightChild={
                            <RightPanel
                                onActiveSectorChange={this.handleActiveSectorChange}
                            />
                        }
                    />
                </div>
            </div>
        );
    }
}
