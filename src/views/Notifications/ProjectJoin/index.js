import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import FormattedDate from '#rscv/FormattedDate';
import LoadingAnimation from '#rscv/LoadingAnimation';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';
import { reverseRoute } from '#rsu/common';

import DisplayPicture from '#components/DisplayPicture';
import {
    setProjectJoinStatusAction,
} from '#redux';

import {
    pathNames,
    iconNames,
} from '#constants';
import _ts from '#ts';

import ProjectJoinResponseRequest from '../requests/ProjectJoinResponseRequest';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.object.isRequired,
    setProjectJoinStatus: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapDispatchToProps = dispatch => ({
    setProjectJoinStatus: params => dispatch(setProjectJoinStatusAction(params)),
});

@connect(null, mapDispatchToProps)
export default class ProjectJoinItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { approvalLoading: false };
    }

    componentWillUnmount() {
        if (this.requestForProjectJoinResponse) {
            this.requestForProjectJoinResponse.stop();
        }
    }

    startProjectJoinResponseRequest = (projectId, requestId, approval, role) => {
        const response = approval ? 'accept' : 'reject';

        if (this.requestForProjectJoinResponse) {
            this.requestForProjectJoinResponse.stop();
        }

        const requestForProjectJoinResponse = new ProjectJoinResponseRequest({
            setState: v => this.setState(v),
            setProjectJoinStatus: this.props.setProjectJoinStatus,
        });

        this.requestForProjectJoinResponse = requestForProjectJoinResponse.create(
            projectId,
            requestId,
            response,
            role,
        );
        this.requestForProjectJoinResponse.start();
    }

    handleRequestApproval = ({ event: e }) => {
        e.preventDefault();
        e.stopPropagation();

        const { data } = this.props;
        const {
            id,
            project = {},
        } = data.details;

        this.startProjectJoinResponseRequest(project.id, id, true, 'normal');
    }

    handleRequestAdminApproval = ({ event: e }) => {
        e.preventDefault();
        e.stopPropagation();

        const { data } = this.props;
        const {
            id,
            project = {},
        } = data.details;

        this.startProjectJoinResponseRequest(project.id, id, true, 'admin');
    }

    handleRequestRejection = ({ event: e }) => {
        e.preventDefault();
        e.stopPropagation();
        const { data } = this.props;
        const {
            id,
            project = {},
        } = data.details;

        this.startProjectJoinResponseRequest(project.id, id, false);
    }

    renderPendingDescription = () => {
        const { data } = this.props;
        const {
            project = {},
            requestedBy,
        } = data.details;

        return (
            <Fragment>
                <div className={styles.description} >
                    {_ts('notifications.projectJoin', 'requestedToJoin', {
                        requestedBy: (
                            <Link
                                className={styles.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                to={reverseRoute(pathNames.userProfile, { userId: requestedBy.id })}
                            >
                                {requestedBy.displayName}
                            </Link>
                        ),
                        project: (
                            <Link
                                className={styles.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                to={reverseRoute(pathNames.projects, { projectId: project.id })}
                            >
                                {project.title}
                            </Link>
                        ),
                    })}
                </div>
                <div className={styles.date} >
                    <span className={styles.label} >
                        {_ts('notifications.projectJoin', 'date')}
                    </span>
                    <FormattedDate
                        date={data.date}
                        mode="dd-MM-yyyy"
                    />
                </div>
                <div className={styles.actionButtons} >
                    <DangerButton
                        className={styles.button}
                        iconName={iconNames.close}
                        onClick={this.handleRequestRejection}
                    >
                        {_ts('notifications.projectJoin', 'rejectButton')}
                    </DangerButton>
                    <SuccessButton
                        className={styles.button}
                        iconName={iconNames.check}
                        onClick={this.handleRequestApproval}
                    >
                        {_ts('notifications.projectJoin', 'acceptButton')}
                    </SuccessButton>
                    <SuccessButton
                        className={styles.button}
                        iconName={iconNames.check}
                        onClick={this.handleRequestAdminApproval}
                    >
                        {_ts('notifications.projectJoin', 'acceptAsAdminButton')}
                    </SuccessButton>
                </div>
            </Fragment>
        );
    }

    renderRespondedDescription = () => {
        const { data } = this.props;
        const {
            project,
            requestedBy,
            respondedBy,
            status,
            role,
        } = data.details;

        let approvalText = 'rejectedText';
        if (status === 'accepted') {
            approvalText = role === 'admin' ? 'acceptedAsAdminText' : 'acceptedText';
        }

        // _ts('notifications.projectJoin', 'rejectedText') is used
        // _ts('notifications.projectJoin', 'acceptedText') is used
        // _ts('notifications.projectJoin', 'acceptedAsAdminText') is used

        return (
            <Fragment>
                <div className={styles.description} >
                    {_ts('notifications.projectJoin', approvalText, {
                        requestedBy: (
                            <Link
                                className={styles.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                to={reverseRoute(pathNames.userProfile, { userId: requestedBy.id })}
                            >
                                {requestedBy.displayName}
                            </Link>
                        ),
                        project: (
                            <Link
                                className={styles.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                to={reverseRoute(pathNames.projects, { projectId: project.id })}
                            >
                                {project.title}
                            </Link>
                        ),
                        respondedBy: (
                            <Link
                                className={styles.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                to={reverseRoute(pathNames.userProfile, { userId: respondedBy.id })}
                            >
                                {respondedBy.displayName}
                            </Link>
                        ),
                    })}
                </div>
                <div className={styles.date} >
                    <span className={styles.label} >
                        {_ts('notifications.projectJoin', 'date')}
                    </span>
                    <FormattedDate
                        date={data.date}
                        mode="dd-MM-yyyy"
                    />
                </div>
            </Fragment>
        );
    }

    renderDescription = () => {
        const { data } = this.props;
        const { status } = data.details;

        const PendingDescription = this.renderPendingDescription;
        const RespondedDescription = this.renderRespondedDescription;

        return status === 'pending' ? <PendingDescription /> : <RespondedDescription />;
    }

    render() {
        const { data } = this.props;
        const { requestedBy } = data.details;
        const { approvalLoading } = this.state;

        const Description = this.renderDescription;

        return (
            <div className={styles.projectJoinItem} >
                { approvalLoading && <LoadingAnimation />}
                <DisplayPicture
                    className={styles.displayPicture}
                    galleryId={requestedBy.displayPicture}
                />
                <div className={styles.details}>
                    <Description />
                </div>
            </div>
        );
    }
}

