import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    reverseRoute,
    caseInsensitiveSubmatch,
} from '#rsu/common';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import UserProjectAdd from '#components/UserProjectAdd';
import BoundError from '#rscg/BoundError';
import AppError from '#components/AppError';
import {
    currentUserAdminProjectsSelector,
    setActiveProjectAction,
    projectIdFromRouteSelector,
} from '#redux';
import { iconNames } from '#constants';
import _ts from '#ts';

import Sidebar from './Sidebar';
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

const mapStateToProps = (state, props) => ({
    userProjects: currentUserAdminProjectsSelector(state, props),
    projectId: projectIdFromRouteSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
});

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { showAddProjectModal: false };
    }

    handleProjectAdd = (projectId) => {
        this.props.setActiveProject({ activeProject: projectId });
    }

    handleAddProjectClick = () => {
        this.setState({ showAddProjectModal: true });
    }

    handleAddProjectModalClose = () => {
        this.setState({ showAddProjectModal: false });
    }

    render() {
        const { showAddProjectModal } = this.state;

        const {
            projectId,
            history,
            userProjects,
        } = this.props;

        return (
            <div className={styles.projectPanel}>
                <Sidebar
                    className={styles.sidebar}
                    userProjects={userProjects}
                    projectId={projectId}
                />
                {
                    projectId ? (
                        <Details
                            className={styles.projectDetails}
                            projectId={projectId}
                            mainHistory={history}
                        />
                    ) : (
                        <div className={styles.noProjectText}>
                            {_ts('project', 'noProjectText')}
                        </div>
                    )
                }
                {
                    showAddProjectModal && (
                        <Modal
                            closeOnEscape
                            onClose={this.handleAddProjectModalClose}
                        >
                            <ModalHeader
                                title={_ts('project', 'addProjectModalTitle')}
                                rightComponent={
                                    <PrimaryButton
                                        onClick={this.handleAddProjectModalClose}
                                        transparent
                                    >
                                        <span className={iconNames.close} />
                                    </PrimaryButton>
                                }
                            />
                            <ModalBody>
                                <UserProjectAdd
                                    onProjectAdd={this.handleProjectAdd}
                                    handleModalClose={this.handleAddProjectModalClose}
                                />
                            </ModalBody>
                        </Modal>
                    )
                }
            </div>
        );
    }
}
