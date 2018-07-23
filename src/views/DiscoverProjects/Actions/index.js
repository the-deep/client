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

    renderUserAccessButtons = () => {
        const { project } = this.props;

        switch (project.role) {
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
                        title={_ts('discoverProjects.table', 'cancelJoinRequest')}
                        transparent
                        onClick={() => this.props.onProjectJoinCancel(project)}
                    />
                );
            case 'rejected':
                return (
                    <span>Rejected</span>
                );
            case 'none':
                return (
                    <PrimaryButton
                        title={_ts('discoverProjects.table', 'joinLabel')}
                        onClick={() => this.props.onProjectJoin(project)}
                    >
                        {_ts('discoverProjects.table', 'joinLabel')}
                    </PrimaryButton>
                );
            default:
                return null;
        }
    }

    render() {
        const UserAccessButtons = this.renderUserAccessButtons;
        const {
            project: {
                memberships,
                title: projectName,
            },
        } = this.props;

        const admins = memberships.filter(m => m.role === 'admin');
        const adminEmails = admins.map(a => a.memberEmail);
        const subject = _ts(
            'discoverProjects.table',
            'contactAdminsSubject',
            { projectName },
        );
        const contantLink = `mailto:${adminEmails.join(',')}?subject=${subject}`;

        return (
            <React.Fragment>
                <a
                    className={styles.emailLink}
                    tabIndex="-1"
                    title={_ts('discoverProjects.table', 'contactAdminsTitle')}
                    href={contantLink}
                    target="_blank"
                >
                    <span className={iconNames.email} />
                </a>
                <UserAccessButtons />
            </React.Fragment>
        );
    }
}
