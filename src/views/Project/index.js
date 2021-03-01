import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Page from '#rscv/Page';
import Message from '#rscv/Message';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';

import {
    RequestCoordinator,
    RequestClient,
    methods,
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

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    userProjects: [],
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

const requestOptions = {
    projectDeleteRequest: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/`,
        method: methods.DELETE,
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
@RequestClient(requestOptions)
export default class ProjectPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHideProjectDeleteButton = ({ setupPermissions }) => !setupPermissions.delete;
    static shouldHideDetails = ({ setupPermissions }) => !setupPermissions.view;

    handleProjectDelete = () => {
        const {
            requests: {
                projectDeleteRequest,
            },
        } = this.props;
        projectDeleteRequest.do({
            projectId: this.props.projectId,
        });
    }

    renderHeader = () => {
        if (!this.props.projectDetail) {
            return null;
        }

        const {
            projectDetail: {
                title,
                isPrivate,
            },
        } = this.props;

        return (
            <div className={styles.header}>
                <div className={styles.leftContainer}>
                    <h2
                        className={styles.heading}
                        title={title}
                    >
                        {title}
                    </h2>
                    { isPrivate &&
                        <Badge
                            icon="locked"
                            title={_ts('project', 'privateProjectBadgeTitle')}
                            tooltip={_ts('project', 'privateProjectBadgeTooltip')}
                        />
                    }
                </div>
                <div className={styles.actionButtons}>
                    <Cloak
                        hide={ProjectPanel.shouldHideProjectDeleteButton}
                        render={
                            <DangerConfirmButton
                                iconName="delete"
                                onClick={this.handleProjectDelete}
                                confirmationTitle="Warning!"
                                confirmationMessage={_ts('project', 'deleteConfirmMessage', {
                                    title: <strong>{title}</strong>,
                                })}
                                challengeLabel={_ts('project', 'deleteConfirmLabel')}
                                challengePlaceholder={_ts('project', 'deleteConfirmPlaceholder')}
                                challengeValue={title}
                                className={styles.button}
                            >
                                {_ts('project', 'deleteButtonTitle')}
                            </DangerConfirmButton>
                        }
                    />
                </div>
            </div>
        );
    }

    renderContent = () => {
        const {
            projectId,
            requests: {
                projectDeleteRequest,
            },
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
