import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import Icon from '#rscg/Icon';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import { pathNames } from '#constants';
import _ts from '#ts';

import JoinProjectModal from './JoinProjectModal';

import styles from './styles.scss';

const propTypes = {
    project: PropTypes.shape({
        id: PropTypes.number,
        memberStatus: PropTypes.string,
    }).isRequired,
    onProjectJoin: PropTypes.func.isRequired,
    onProjectJoinCancel: PropTypes.func.isRequired,
    projectJoinRequestPending: PropTypes.bool.isRequired,
};

const ModalButton = modalize(PrimaryButton);

function Actions(props) {
    const {
        project,
        onProjectJoin,
        onProjectJoinCancel,
        projectJoinRequestPending,
    } = props;

    const handleProjectJoinCancel = useCallback(() => {
        onProjectJoinCancel(project);
    }, [onProjectJoinCancel, project]);

    switch (project.memberStatus) {
        case 'admin': {
            const link = reverseRoute(
                pathNames.projects,
                { projectId: project.id },
            );
            return (
                <Link
                    className={_cs(styles.editLink, 'edit-link')}
                    tabIndex="-1"
                    title={_ts('discoverProjects.table', 'editProjectTooltip')}
                    to={link}
                >
                    <Icon name="edit" />
                </Link>
            );
        }
        case 'pending':
            return (
                <DangerButton
                    iconName="close"
                    title={_ts('discoverProjects.table', 'cancelJoinRequest')}
                    transparent
                    onClick={handleProjectJoinCancel}
                />
            );
        case 'rejected':
            return (
                <span>{_ts('discoverProjects.table', 'rejectedLabel')}</span>
            );
        case 'none':
            return (
                <ModalButton
                    className="join-button"
                    modal={
                        <JoinProjectModal
                            project={project}
                            onProjectJoin={onProjectJoin}
                            projectJoinRequestPending={projectJoinRequestPending}
                        />
                    }
                >
                    {_ts('discoverProjects.table', 'joinLabel')}
                </ModalButton>
            );
        default:
            return null;
    }
}

Actions.propTypes = propTypes;

export default Actions;
