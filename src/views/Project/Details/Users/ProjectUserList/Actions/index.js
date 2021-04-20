import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compareNumber } from '@togglecorp/fujs';
import memoize from 'memoize-one';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import SelectInput from '#rsci/SelectInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { getNewActiveProjectId } from '#entities/project';

import {
    notifyOnFailure,
} from '#utils/requestNotify';
import {
    RequestClient,
    methods,
} from '#request';
import {
    removeProjectMembershipAction,
    modifyProjectMembershipAction,
    projectRoleListSelector,
    activeUserSelector,
    currentUserProjectsSelector,
} from '#redux';
import _ts from '#ts';

import styles from './styles.scss';

const requestOptions = {
    changeMembershipRequest: {
        url: ({ props: { projectId }, params: { membership } }) => `/projects/${projectId}/project-memberships/${membership.id}/`,
        method: methods.PATCH,
        body: ({ params }) => params && params.membership,
        onFailure: notifyOnFailure(_ts('project.users', 'usersTitle')),
        onSuccess: ({
            response: membership,
            props: {
                projectId,
                modifyProjectMembership,
            },
        }) => {
            modifyProjectMembership({
                projectId,
                membership,
            });
        },
    },

    removeUserMembershipRequest: {
        url: ({ props: { projectId }, params: { membership: { id } } }) => `/projects/${projectId}/project-memberships/${id}/`,
        method: methods.DELETE,
        body: ({ params }) => params && params.membership,
        onFailure: notifyOnFailure(_ts('project.users', 'usersTitle')),
        onSuccess: ({
            params: { membership },
            props: {
                removeProjectMembership,
                projectId,
                userProjects,
                activeUser: {
                    userId: activeUserId,
                },
            },
        }) => {
            const {
                id: membershipId,
                member: memberId,
            } = membership;
            const shouldRemoveProject = activeUserId === memberId;
            removeProjectMembership({
                projectId,
                membershipId,
                shouldRemoveProject,
                newActiveProjectId: shouldRemoveProject
                    ? getNewActiveProjectId(userProjects, projectId)
                    : undefined,
            });
        },
    },
};

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types, react/forbid-prop-types
    userProjects: PropTypes.array.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    removeProjectMembership: PropTypes.func.isRequired,
    activeUserRole: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    row: PropTypes.shape({
        id: PropTypes.number,
        role: PropTypes.number,
        member: PropTypes.number,
        memberName: PropTypes.string,
        memberEmail: PropTypes.string,
        linkedGroup: PropTypes.number,
        userGroupOptions: PropTypes.array,
    }).isRequired,
    projectRoleList: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string,
        }),
    ).isRequired,
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }).isRequired,
    readOnly: PropTypes.bool,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    readOnly: false,
};

const mapStateToProps = state => ({
    projectRoleList: projectRoleListSelector(state),
    userProjects: currentUserProjectsSelector(state),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    removeProjectMembership: params => dispatch(removeProjectMembershipAction(params)),
    modifyProjectMembership: params => dispatch(modifyProjectMembershipAction(params)),
});

const projectRoleKeySelector = d => d.id;
const projectRoleLabelSelector = d => d.title;

const userGroupKeySelector = userGroup => userGroup.id;
const userGroupLabelSelector = userGroup => userGroup.title;

const emptyObject = {};

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requestOptions)
export default class Actions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getUserRoleLevel = memoize((projectRoleList, role) => (
        (
            projectRoleList.find(
                projectRole => projectRole.id === role,
            ) || emptyObject
        ).level
    ))

    filterProjectRole = memoize((projectRoleList, level) => (
        projectRoleList.filter(
            projectRole => projectRole.level >= level,
        ).sort((a, b) => compareNumber(a.level, b.level))
    ))

    handleRoleSelectInputChange = (newRole) => {
        const {
            row,
            requests: {
                changeMembershipRequest,
            },
        } = this.props;

        changeMembershipRequest.do({
            membership: {
                id: row.id,
                role: newRole,
            },
        });
    }

    handleLinkedGroupChange = (newGroup) => {
        const {
            row,
            requests: {
                changeMembershipRequest,
            },
        } = this.props;

        changeMembershipRequest.do({
            membership: {
                id: row.id,
                linkedGroup: newGroup || null, // We need to pass null to unset
            },
        });
    }

    handleRemoveMembershipButtonClick = () => {
        const {
            row: membership,
            requests: {
                removeUserMembershipRequest,
            },
        } = this.props;

        removeUserMembershipRequest.do({ membership });
    }

    render() {
        const {
            row,
            projectRoleList,
            activeUser: {
                userId: activeUserId,
            },
            activeUserRole = emptyObject,
            requests: {
                changeMembershipRequest,
                removeUserMembershipRequest,
            },
            readOnly,
        } = this.props;

        const {
            role,
            member: memberId,
            memberName,
            memberEmail,
            linkedGroup,
            userGroupOptions,
        } = row;

        const pending = changeMembershipRequest.pending || removeUserMembershipRequest.pending;

        // NOTE: If user's role is superior than that of row's user, than we
        // need to filter the options so that they can change it to lower roles only
        // if not all the options are shown but it is disabled
        // isSuperior means whether or not the row's user role is superior to active user role
        const isSuperior = this.getUserRoleLevel(projectRoleList, role) < activeUserRole.level;
        const filteredProjectRoleList = isSuperior ?
            projectRoleList : this.filterProjectRole(projectRoleList, activeUserRole.level);

        return (
            <div className={styles.actions}>
                {pending && <LoadingAnimation /> }
                <SelectInput
                    className={styles.inputElement}
                    label={_ts('project.users', 'roleSelectInputTitle')}
                    placeholder=""
                    hideClearButton
                    value={role}
                    options={filteredProjectRoleList}
                    onChange={this.handleRoleSelectInputChange}
                    keySelector={projectRoleKeySelector}
                    labelSelector={projectRoleLabelSelector}
                    showHintAndError={false}
                    readOnly={readOnly}
                    disabled={isSuperior || !!linkedGroup || activeUserId === memberId || pending}
                />
                <SelectInput
                    className={styles.inputElement}
                    label={_ts('project.users', 'linkedGroupTitle')}
                    placeholder={_ts('project.users', 'linkedGroupPlaceholder')}
                    value={linkedGroup}
                    options={userGroupOptions}
                    onChange={this.handleLinkedGroupChange}
                    keySelector={userGroupKeySelector}
                    labelSelector={userGroupLabelSelector}
                    showHintAndError={false}
                    disabled={userGroupOptions.length === 0 || activeUserId === memberId || pending}
                    readOnly={readOnly}
                />
                <DangerConfirmButton
                    smallVerticalPadding
                    title={_ts('project.users', 'removeMembershipButtonPlaceholder')}
                    disabled={isSuperior || readOnly || pending || activeUserId === memberId}
                    confirmationMessage={_ts(
                        'project.users',
                        'removeMembershipConfirmationMessage',
                        {
                            memberName,
                            memberEmail,
                        },
                    )}
                    iconName="delete"
                    onClick={this.handleRemoveMembershipButtonClick}
                    transparent
                />
            </div>
        );
    }
}
