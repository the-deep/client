import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import { reverseRoute } from '#rs/utils/common';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import WarningButton from '#rs/components/Action/Button/WarningButton';

import {
    iconNames,
    pathNames,
} from '#constants/';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    // className: PropTypes.string,
    project: PropTypes.shape({
        id: PropTypes.number,
        role: PropTypes.string,
    }).isRequired,
    onProjectJoin: PropTypes.func.isRequired,
    onProjectJoinCancel: PropTypes.func.isRequired,
};

const defaultProps = {
    // className: '',
};

export default class Actions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderButtons = () => {
        const { project } = this.props;

        switch (project.role) {
            case 'none':
                return (
                    <PrimaryButton
                        iconName={iconNames.add}
                        title={_ts('discoverProjects.table', 'joinProjectTooltip')}
                        transparent
                        onClick={() => this.props.onProjectJoin(project.id)}
                    />
                );
            case 'admin': {
                const link = reverseRoute(
                    pathNames.projects,
                    { projectId: project.id },
                );
                return (
                    <Link
                        className={styles.editLink}
                        tabIndex="-1"
                        title={_ts('discoverProjects.table', 'editProjectTooltip')}
                        to={link}
                    >
                        <i className={iconNames.edit} />
                    </Link>
                );
            } case 'pending':
                return (
                    <WarningButton
                        iconName={iconNames.undo}
                        title={_ts('discoverProjects.table', 'joinCancelProjectTooltip')}
                        transparent
                        onClick={() => this.props.onProjectJoinCancel(project.id)}
                    />
                );
            case 'rejected':
                return (
                    <span>Rejected</span>
                );
            default:
                return null;
        }
    }

    render() {
        const Buttons = this.renderButtons;

        return (
            <React.Fragment>
                <Buttons />
            </React.Fragment>
        );
    }
}
