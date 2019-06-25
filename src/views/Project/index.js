import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Page from '#rscv/Page';
import Message from '#rscv/Message';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';

import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';
import { getNewActiveProjectId } from '#entities/project';
import {
    currentUserAdminProjectsSelector,
    projectIdFromRouteSelector,
    projectDetailsSelector,
    setActiveProjectAction,
    unsetProjectDetailsAction,
} from '#redux';
import notify from '#notify';
import _ts from '#ts';

import Cloak from '#components/general/Cloak';
import Badge from '#components/viewer/Badge';

import ProjectList from './ProjectList';
import Details from './Details';
import styles from './styles.scss';

const propTypes = {
    setActiveProject: PropTypes.func.isRequired,

    projectId: PropTypes.number,
    projectDetail: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            title: PropTypes.string,
        }),
    ),

    // Requests Props
    // eslint-disable-next-line react/no-unused-prop-types
    unsetProject: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    projectDeleteRequest: PropTypes.object.isRequired,
};

const defaultProps = {
    userProjects: {},
    projectId: undefined,
};

const mapStateToProps = state => ({
    projectDetail: projectDetailsSelector(state),
    userProjects: currentUserAdminProjectsSelector(state),
    projectId: projectIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
    unsetProject: params => dispatch(unsetProjectDetailsAction(params)),
});

const requests = {
    projectDeleteRequest: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/`,
        method: requestMethods.DELETE,
        onSuccess: ({ props }) => {
            const {
                projectId,
                unsetProject,
                userProjects,
            } = props;
            unsetProject({
                projectId,
                newActiveProjectId: getNewActiveProjectId(userProjects, projectId),
            });
            notify.send({
                title: _ts('project', 'projectDelete'),
                type: notify.type.SUCCESS,
                message: _ts('project', 'projectDeleteSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        onFailure: () => {
            notify.send({
                title: _ts('project', 'projectDelete'),
                type: notify.type.ERROR,
                message: _ts('project', 'projectDeleteFailure'),
                duration: notify.duration.SLOW,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('project', 'projectDelete'),
                type: notify.type.ERROR,
                message: _ts('project', 'projectDeleteFailure'),
                duration: notify.duration.SLOW,
            });
        },
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requests)
export default class ProjectPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHideProjectDeleteButton = ({ setupPermissions }) => !setupPermissions.delete;
    static shouldHideDetails = ({ setupPermissions }) => !setupPermissions.view;

    handleProjectDelete = () => {
        this.props.projectDeleteRequest.do({
            projectId: this.props.projectId,
        });
    }

    renderHeader = () => {
        const { projectDetail } = this.props;

        if (!projectDetail) {
            return null;
        }

        return (
            <div className={styles.header}>
                <div className={styles.leftContainer}>
                    <h2
                        className={styles.heading}
                        title={projectDetail.title}
                    >
                        {projectDetail.title}
                    </h2>
                    { projectDetail.isPrivate &&
                        <Badge
                            icon="locked"
                            title={_ts('project', 'privateProjectBadgeTitle')}
                            tooltip={_ts('project', 'priivateProjectBadgeTooltip')}
                        />
                    }
                </div>
                <Cloak
                    hide={ProjectPanel.shouldHideProjectDeleteButton}
                    render={
                        <div className={styles.actionButtons}>
                            <DangerConfirmButton
                                iconName="delete"
                                onClick={this.handleProjectDelete}
                                confirmationTitle="Warning!"
                                confirmationMessage={_ts('project', 'deleteConfirmMessage', {
                                    title: <strong>{projectDetail.title}</strong>,
                                })}
                                challengeLabel={_ts('project', 'deleteConfirmLabel')}
                                challengePlaceholder={_ts('project', 'deleteConfirmPlaceholder')}
                                challengeValue={projectDetail.title}
                                className={styles.deleteButton}
                            >
                                {_ts('project', 'deleteButtonTitle')}
                            </DangerConfirmButton>
                        </div>
                    }
                />
            </div>
        );
    }

    renderContent = () => {
        const {
            projectId,
            projectDeleteRequest,
        } = this.props;

        if (!projectId) {
            return (
                <Message large>
                    {_ts('project', 'noProjectText')}
                </Message>
            );
        }
        return (
            <Cloak
                hide={ProjectPanel.shouldHideDetails}
                render={
                    <Details
                        key={projectId}
                        projectId={projectId}
                        className={styles.projectDetails}
                        pending={projectDeleteRequest.pending}
                    />
                }
                renderOnHide={
                    <Message large>
                        {_ts('project', 'noProjectPermissionText')}
                    </Message>
                }
            />
        );
    }

    render() {
        const { setActiveProject } = this.props;

        const {
            userProjects,
            projectId,
        } = this.props;

        return (
            <Page
                className={styles.projectPanel}
                sidebar={
                    <ProjectList
                        className={styles.sidebar}
                        userProjects={userProjects}
                        projectId={projectId}
                        setActiveProject={setActiveProject}
                    />
                }
                header={this.renderHeader()}
                mainContentClassName={styles.main}
                mainContent={this.renderContent()}
            />
        );
    }
}
