import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Button from '#rs/components/Action/Button';
import Confirm from '#rs/components/View/Modal/Confirm';
import WarningButton from '#rs/components/Action/Button/WarningButton';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import { iconNames } from '#constants/';
import _ts from '#ts';

import {
    deleteDiscoverProjectsProjectAction,
} from '#redux';

import ProjectDeleteRequest from '../requests/ProjectDeleteRequest';
import styles from './styles.scss';

const propTypes = {
    // className: PropTypes.string,
    project: PropTypes.shape({
        id: PropTypes.number,
        role: PropTypes.string,
    }).isRequired,

    deleteProject: PropTypes.func.isRequired,
};

const defaultProps = {
    // className: '',
};

const mapDispatchToProps = dispatch => ({
    deleteProject: params => dispatch(deleteDiscoverProjectsProjectAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class Actions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingProjectDelete: false,
            showProjectDeleteConfirm: false,
        };

        this.projectDeleteRequest = new ProjectDeleteRequest({
            setState: d => this.setState(d),
            deleteProject: props.deleteProject,
        });
    }

    handleDeleteProjectButtonClick = () => {
        this.setState({ showProjectDeleteConfirm: true });
    }

    handleProjectDeleteConfirmClose = (result) => {
        const { project } = this.props;

        if (result) {
            this.projectDeleteRequest.create(project.id);
            this.projectDeleteRequest.start();
        }

        this.setState({ showProjectDeleteConfirm: false });
    }

    renderButtons = () => {
        const { project } = this.props;

        switch (project.role) {
            case 'null':
                return (
                    <Button
                        iconName={iconNames.add}
                        title={_ts('discoverProjects.table', 'joinProjectTooltip')}
                        transparent
                    />
                );

            case 'admin':
                return (
                    <React.Fragment>
                        <WarningButton
                            iconName={iconNames.edit}
                            title={_ts('discoverProjects.table', 'editProjectTooltip')}
                            transparent
                        />
                        <DangerButton
                            onClick={this.handleDeleteProjectButtonClick}
                            iconName={iconNames.delete}
                            title={_ts('discoverProjects.table', 'deleteProjectTooltip')}
                            transparent
                        />
                    </React.Fragment>
                );
            case 'pending':
                return (
                    <span>Pending</span>
                );
            default:
                return null;
        }
    }

    render() {
        const {
            showProjectDeleteConfirm,
        } = this.state;

        const { project } = this.props;

        const Buttons = this.renderButtons;

        return (
            <React.Fragment>
                <Buttons />
                <Confirm
                    show={showProjectDeleteConfirm}
                    onClose={this.handleProjectDeleteConfirmClose}
                >
                    <p>
                        Are you sure to delete {project.title}?
                    </p>
                </Confirm>
            </React.Fragment>
        );
    }
}
