import React from 'react';
import PropTypes from 'prop-types'; import { connect } from 'react-redux';

import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import ResizableH from '../../vendor/react-store/components/View/Resizable/ResizableH';
import { isFalsy } from '../../vendor/react-store/utils/common';

import {
    setAryTemplateAction,
    setAryForEditAryAction,
    setGeoOptionsAction,

    projectDetailsSelector,
    leadIdFromRouteSelector,
    leadGroupIdFromRouteSelector,
    editAryVersionIdSelector,
} from '../../redux';
import _ts from '../../ts';

import LeadRequest from './requests/LeadRequest';
import LeadGroupRequest from './requests/LeadGroupRequest';
import AryTemplateRequest from './requests/AryTemplateRequest';
import AryGetRequest from './requests/AryGetRequest';
import GeoOptionsRequest from './requests/GeoOptionsRequest';

import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number,
    activeLeadGroupId: PropTypes.number,
    activeProject: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    setAryTemplate: PropTypes.func.isRequired,
    setAry: PropTypes.func.isRequired,
    setGeoOptions: PropTypes.func.isRequired,

    editAryVersionId: PropTypes.number,
};

const defaultProps = {
    activeProject: {},
    editAryVersionId: undefined,

    activeLeadId: undefined,
    activeLeadGroupId: undefined,
};

const mapStateToProps = state => ({
    activeLeadId: leadIdFromRouteSelector(state),
    activeLeadGroupId: leadGroupIdFromRouteSelector(state),
    activeProject: projectDetailsSelector(state),
    editAryVersionId: editAryVersionIdSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAryTemplate: params => dispatch(setAryTemplateAction(params)),
    setAry: params => dispatch(setAryForEditAryAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class EditAry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingAryTemplate: true,
            pendingLead: true,
            pendingAry: true,
            pendingGeo: true,

            noTemplate: false,

            activeSector: undefined,
        };

        this.leadGroup = new LeadGroupRequest({
            setState: d => this.setState(d),
        });
    }

    componentWillMount() {
        const {
            activeProject: { id: projectId },
            activeLeadId: leadId,
            activeLeadGroupId: leadGroupId,
        } = this.props;

        console.warn(leadId, leadGroupId);

        if (leadId) {
            this.startAryGetRequest(leadId);
            this.startLeadRequest(leadId);
            console.warn('Requesting lead for assessment');
        } else {
            this.startAryGetRequest(leadGroupId, true);
            this.leadGroup.createRequest(leadGroupId);
            this.leadGroup.request.start();
            console.warn('Requesting lead group for assessment');
        }

        this.startAryTemplateRequest(projectId);
        this.startGeoOptionsRequest(projectId);
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeProject: { id: oldProjectId },
            activeLeadId: oldLeadId,
            activeLeadGroupId: oldLeadGroupId,
        } = this.props;

        const {
            activeProject: { id: projectId },
            activeLeadId: leadId,
            activeLeadGroupId: newLeadGroupId,
        } = nextProps;

        if (oldProjectId !== projectId) {
            this.startAryTemplateRequest(projectId);
            this.startGeoOptionsRequest(projectId);
        }

        if (oldLeadId !== leadId) {
            this.startAryGetRequest(leadId);
            this.startLeadRequest(leadId);
        }

        if (oldLeadGroupId !== newLeadGroupId) {
            this.startAryGetRequest(newLeadGroupId, true);

            this.leadGroup.request.stop();
            this.leadGroup.createRequest(newLeadGroupId);
            this.leadGroup.request.start();
        }
    }

    componentWillUnmount() {
        if (this.aryTemplateRequest) {
            this.aryTemplateRequest.stop();
        }
        if (this.aryGetRequest) {
            this.aryGetRequest.stop();
        }
        if (this.leadRequest) {
            this.leadRequest.stop();
        }
        if (this.geoOptionsRequest) {
            this.geoOptionsRequest.stop();
        }
    }

    handleActiveSectorChange = (activeSector) => {
        this.setState({ activeSector });
    }

    startLeadRequest = (leadId) => {
        if (isFalsy(leadId)) {
            return;
        }

        if (this.leadRequest) {
            this.leadRequest.stop();
        }

        const leadRequest = new LeadRequest({
            setState: params => this.setState(params),
        });
        this.leadRequest = leadRequest.create(leadId);
        this.leadRequest.start();
    }

    startAryGetRequest = (leadId, isLeadGroup) => {
        if (isFalsy(leadId)) {
            return;
        }

        const { setAry } = this.props;
        if (this.aryGetRequest) {
            this.aryGetRequest.stop();
        }

        const aryGetRequest = new AryGetRequest({
            setAry,
            setState: params => this.setState(params),
            getAryVersionId: () => this.props.editAryVersionId,
        });
        this.aryGetRequest = aryGetRequest.create(leadId, isLeadGroup);
        this.aryGetRequest.start();
    }

    startAryTemplateRequest = (projectId) => {
        if (isFalsy(projectId)) {
            return;
        }
        if (this.aryTemplateRequest) {
            this.aryTemplateRequest.stop();
        }

        const aryTemplateRequest = new AryTemplateRequest({
            setAryTemplate: this.props.setAryTemplate,
            setState: params => this.setState(params),
        });
        this.aryTemplateRequest = aryTemplateRequest.create(projectId);
        this.aryTemplateRequest.start();
    }

    startGeoOptionsRequest = (projectId) => {
        if (isFalsy(projectId)) {
            return;
        }
        if (this.geoOptionsRequest) {
            this.geoOptionsRequest.stop();
        }

        const geoOptionsRequest = new GeoOptionsRequest({
            setGeoOptions: this.props.setGeoOptions,
            setState: params => this.setState(params),
        });
        this.geoOptionsRequest = geoOptionsRequest.create(projectId);
        this.geoOptionsRequest.start();
    }

    render() {
        const {
            pendingLead,
            pendingAryTemplate,
            pendingGeo,
            pendingAry,
            noTemplate,
            lead,
            leadGroup,
            activeSector,
        } = this.state;

        if (noTemplate) {
            return (
                <div className={styles.noTemplate}>
                    <p>
                        {_ts('editAssessment', 'noAryTemplateForProject')}
                    </p>
                </div>
            );
        }

        if (pendingLead || pendingAryTemplate || pendingAry || pendingGeo) {
            return <LoadingAnimation large />;
        }

        return (
            <ResizableH
                className={styles.assessments}
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
                leftChild={
                    <LeftPanel
                        lead={lead}
                        leadGroup={leadGroup}
                        activeSector={activeSector}
                    />
                }
                rightChild={
                    <RightPanel
                        onActiveSectorChange={this.handleActiveSectorChange}
                    />
                }
            />
        );
    }
}
