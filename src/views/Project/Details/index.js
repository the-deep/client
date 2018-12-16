import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import notify from '#notify';
import FixedTabs from '#rscv/FixedTabs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiViewContainer from '#rscv/MultiViewContainer';
import Cloak from '#components/Cloak';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import { getNewActiveProjectId } from '#entities/project';
import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';
import {
    projectDetailsSelector,
    unsetProjectDetailsAction,
    currentUserProjectsSelector,
} from '#redux';

import { iconNames } from '#constants';
import _ts from '#ts';

import General from './General';
import Users from './Users';
import Regions from './Regions';
import Frameworks from './Frameworks';
import WordCategories from './WordCategories';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number,
    projectDetail: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    // Requests Props
    // eslint-disable-next-line react/no-unused-prop-types
    unsetProject: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    userProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/forbid-prop-types
    projectDeleteRequest: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const mapStateToProps = state => ({
    projectDetail: projectDetailsSelector(state),
    userProjects: currentUserProjectsSelector(state),
});

const mapDispatchToProps = dispatch => ({
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
export default class ProjectDetails extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldDisableDetails = ({ setupPermissions }) => !setupPermissions.modify;

    static shouldHideProjectDeleteButton = ({ setupPermissions }) => !setupPermissions.delete;

    constructor(props) {
        super(props);

        this.routes = {
            general: _ts('project', 'generalDetailsTitle'),
            users: _ts('project', 'usersTitle'),
            regions: _ts('project', 'regionsTitle'),
            frameworks: _ts('project', 'analysisFrameworkTitle'),
            categoryEditors: _ts('project', 'categoryEditorTitle'),
        };

        this.defaultHash = 'general';

        this.views = {
            general: {
                mount: true,
                wrapContainer: true,
                lazyLoad: true,
                component: () => (
                    <Cloak
                        makeReadOnly={ProjectDetails.shouldDisableDetails}
                        render={
                            <General
                                className={styles.view}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
            users: {
                mount: true,
                lazyLoad: true,
                wrapContainer: true,
                component: () => (
                    <Cloak
                        makeReadOnly={ProjectDetails.shouldDisableDetails}
                        render={
                            <Users
                                className={styles.view}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
            regions: {
                mount: true,
                lazyLoad: true,
                wrapContainer: true,
                component: () => (
                    <Cloak
                        makeReadOnly={ProjectDetails.shouldDisableDetails}
                        render={
                            <Regions
                                className={styles.view}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
            frameworks: {
                mount: true,
                lazyLoad: true,
                wrapContainer: true,
                component: () => (
                    <Cloak
                        makeReadOnly={ProjectDetails.shouldDisableDetails}
                        render={
                            <Frameworks
                                className={styles.view}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
            categoryEditors: {
                mount: true,
                lazyLoad: true,
                wrapContainer: true,
                component: () => (
                    <Cloak
                        makeReadOnly={ProjectDetails.shouldDisableDetails}
                        render={
                            <WordCategories
                                className={styles.view}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
        };
    }

    handleProjectDelete = () => {
        this.props.projectDeleteRequest.do({
            projectId: this.props.projectId,
        });
    }

    render() {
        const { className: classNameFromProps } = this.props;
        const {
            projectDetail,
            projectDeleteRequest,
        } = this.props;
        const className = `
            ${classNameFromProps}
            ${styles.projectDetails}
        `;

        if (projectDeleteRequest.pending) {
            return <LoadingAnimation className={className} />;
        }

        return (
            <div className={className}>
                <FixedTabs
                    className={styles.tabs}
                    defaultHash={this.defaultHash}
                    replaceHistory
                    useHash
                    tabs={this.routes}
                >
                    <Cloak
                        hide={ProjectDetails.shouldHideProjectDeleteButton}
                        render={
                            <DangerConfirmButton
                                iconName={iconNames.delete}
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
                        }
                    />
                </FixedTabs>
                <MultiViewContainer
                    useHash
                    activeClassName={styles.active}
                    containerClassName={styles.content}
                    views={this.views}
                />
            </div>
        );
    }
}
