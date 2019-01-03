import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Message from '#rscv/Message';

import {
    currentUserAdminProjectsSelector,
    setActiveProjectAction,
    projectIdFromRouteSelector,
} from '#redux';
import _ts from '#ts';

import Cloak from '#components/general/Cloak';

import ProjectList from './ProjectList';
import Details from './Details';
import styles from './styles.scss';

const propTypes = {
    history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setActiveProject: PropTypes.func.isRequired,
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            title: PropTypes.string,
        }),
    ),
    projectId: PropTypes.number,
};

const defaultProps = {
    userProjects: {},
    projectId: undefined,
};

const mapStateToProps = state => ({
    userProjects: currentUserAdminProjectsSelector(state),
    projectId: projectIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHideDetails = ({ setupPermissions }) => !setupPermissions.view;

    render() {
        const { setActiveProject } = this.props;

        const {
            projectId,
            history,
            userProjects,
        } = this.props;

        return (
            <div className={styles.projectPanel}>
                <ProjectList
                    className={styles.sidebar}
                    userProjects={userProjects}
                    projectId={projectId}
                    setActiveProject={setActiveProject}
                />
                {
                    projectId ? (
                        <Cloak
                            hide={ProjectPanel.shouldHideDetails}
                            render={
                                <Details
                                    key={projectId}
                                    className={styles.projectDetails}
                                    projectId={projectId}
                                    mainHistory={history}
                                />
                            }
                            renderOnHide={
                                <Message large>
                                    {_ts('project', 'noProjectPermissionText')}
                                </Message>
                            }
                        />
                    ) : (
                        <Message large>
                            {_ts('project', 'noProjectText')}
                        </Message>
                    )
                }
            </div>
        );
    }
}
