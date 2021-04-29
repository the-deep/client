import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { compareNumber } from '@togglecorp/fujs';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import SelectInput from '#rsci/SelectInput';
import MultiSelectInput from '#rsci/MultiSelectInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import {
    notifyOnFailure,
} from '#utils/requestNotify';
import {
    RequestClient,
    methods,
} from '#request';
import {
    removeProjectUserGroupAction,
    modifyProjectUserGroupAction,
    projectRoleListSelector,
} from '#redux';

import _ts from '#ts';

import styles from './styles.scss';

const badgeOptions = [
    { id: 0, label: _ts('project.users', 'qualityController') },
];

const projectBadgeKeySelector = badge => badge.id;
const projectBadgeLabelSelector = badge => badge.label;

const propTypes = {
    row: PropTypes.shape({
        role: PropTypes.number,
        title: PropTypes.string,
        id: PropTypes.number,
        badges: PropTypes.arrayOf(PropTypes.number),
    }).isRequired,

    activeUserRole: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectRoleList: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string,
        }),
    ).isRequired,

    readOnly: PropTypes.bool,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    readOnly: false,
};

const requestOptions = {
    changeUserGroupRoleRequest: {
        url: ({ props, params: { usergroupMembership } }) => `/projects/${props.projectId}/project-usergroups/${usergroupMembership.id}/`,
        method: methods.PATCH,
        onFailure: notifyOnFailure(_ts('project.users', 'usergroupsTitle')),
        onSuccess: ({
            params: { usergroupMembership },
            props: {
                modifyProjectUserGroup,
                projectId,
            },
        }) => {
            modifyProjectUserGroup({
                projectId,
                usergroupId: usergroupMembership.id,
                newRole: usergroupMembership.role,
            });
        },
    },
    removeUsergroupMembershipRequest: {
        url: ({ props, params: { membershipId } }) => `/projects/${props.projectId}/project-usergroups/${membershipId.id}/`,
        method: methods.DELETE,
        onFailure: notifyOnFailure(_ts('project.users', 'usergroupsTitle')),
        onSuccess: ({
            params: { membershipId },
            props: {
                removeProjectUsergroup,
                projectId,
            },
        }) => {
            removeProjectUsergroup({
                projectId,
                usergroupId: membershipId,
            });
        },
    },
};

const mapStateToProps = state => ({
    projectRoleList: projectRoleListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    removeProjectUsergroup: params => dispatch(removeProjectUserGroupAction(params)),
    modifyProjectUserGroup: params => dispatch(modifyProjectUserGroupAction(params)),
});

const projectRoleKeySelector = d => d.id;
const projectRoleLabelSelector = d => d.title;

const emptyObject = {};

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requestOptions)
export default class Actions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getUserRoleLevel = memoize((projectRoleList, role) => {
        const userProjectRole = projectRoleList.find(
            projectRole => projectRole.id === role,
        );
        return userProjectRole ? userProjectRole.level : undefined;
    })

    filterProjectRole = memoize((projectRoleList, level) => (
        projectRoleList.filter(
            projectRole => projectRole.level >= level,
        ).sort((a, b) => compareNumber(a.level, b.level))
    ))

    handleRoleSelectInputChange = (newRole) => {
        const {
            row: {
                id,
            },
            requests: {
                changeUserGroupRoleRequest,
            },
        } = this.props;

        changeUserGroupRoleRequest.do({
            usergroupMembership: {
                id,
                role: newRole,
            },
        });
    }

    handleRemoveMembershipButtonClick = () => {
        const {
            row: {
                id: membershipId,
            },
            requests: {
                removeUsergroupMembershipRequest,
            },
        } = this.props;

        removeUsergroupMembershipRequest.do({
            membershipId,
        });
    }

    handleBadgeSelection = () => {}; // TODO: implement this when api is ready

    render() {
        const {
            readOnly,
            projectRoleList,
            row,
            activeUserRole = emptyObject,
            requests: {
                removeUsergroupMembershipRequest: { pending = false },
            },
        } = this.props;

        const {
            role,
            badges,
        } = row;

        const removeUG = _ts(
            'project.usergroups',
            'removeUsergroupConfirmationMessage',
            {
                title: row.title,
            },
        );

        // NOTE: If user's role is superior than that of row's user, than we
        // need to filter the options so that they can change it to lower roles only
        // if not all the options are shown but it is disabled
        // isSuperior means whether or not the row's user role is superior to active user role
        const isSuperior = this.getUserRoleLevel(projectRoleList, role) < activeUserRole.level;
        const filteredProjectRoleList = isSuperior ?
            projectRoleList : this.filterProjectRole(projectRoleList, activeUserRole.level);

        return (
            <div className={styles.actions} >
                {pending && <LoadingAnimation />}
                <SelectInput
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
                    disabled={isSuperior || pending}
                />
                <MultiSelectInput
                    label={_ts('project.users', 'badges')}
                    placeholder=""
                    hideClearButton
                    value={badges}
                    options={badgeOptions}
                    onChange={this.handleTagSelection}
                    keySelector={projectBadgeKeySelector}
                    labelSelector={projectBadgeLabelSelector}
                    showHintAndError={false}
                    readOnly={readOnly}
                    disabled={isSuperior || pending}
                />
                <DangerConfirmButton
                    smallVerticalPadding
                    title={_ts('project.users', 'removeMembershipButtonPlaceholder')}
                    iconName="delete"
                    onClick={this.handleRemoveMembershipButtonClick}
                    confirmationMessage={removeUG}
                    transparent
                    disabled={isSuperior || readOnly || pending}
                />
            </div>
        );
    }
}
