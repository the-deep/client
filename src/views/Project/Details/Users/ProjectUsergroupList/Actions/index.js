import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import SelectInput from '#rsci/SelectInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import {
    RequestClient,
    methods,
    notifyOnFailure,
} from '#request';
import {
    removeProjectUserGroupAction,
    modifyProjectUserGroupAction,
    projectRoleListSelector,
} from '#redux';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    row: PropTypes.shape({
        role: PropTypes.string,
    }).isRequired,
    projectRoleList: PropTypes.shape({
        title: PropTypes.string,
    }).isRequired,
    readOnly: PropTypes.bool,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    readOnly: false,
};

const requestOptions = {
    changeUserGroupRoleRequest: {
        url: ({ params: { usergroupMembership } }) => `/project-usergroups/${usergroupMembership.id}/`,
        method: methods.PATCH,
        body: ({ params: { usergroupMembership } }) => usergroupMembership,
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
        url: ({ params: { membershipId } }) => `/project-usergroups/${membershipId}/`,
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

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requestOptions)
export default class Actions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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

    render() {
        const {
            readOnly,
            projectRoleList,
            row,
            requests: {
                removeUsergroupMembershipRequest: { pending = false },
            },
        } = this.props;

        const {
            role,
        } = row;

        const removeUG = _ts(
            'project.usergroups',
            'removeUsergroupConfirmationMessage',
            {
                title: row.title,
            },
        );

        return (
            <div className={styles.actions} >
                {pending && <LoadingAnimation />}
                <SelectInput
                    label={_ts('project.users', 'roleSelectInputTitle')}
                    placeholder=""
                    hideClearButton
                    value={role}
                    options={projectRoleList}
                    onChange={this.handleRoleSelectInputChange}
                    keySelector={projectRoleKeySelector}
                    labelSelector={projectRoleLabelSelector}
                    showHintAndError={false}
                    readOnly={readOnly}
                    disabled={pending}
                />
                <DangerConfirmButton
                    smallVerticalPadding
                    title={_ts('project.users', 'removeMembershipButtonPlaceholder')}
                    iconName="delete"
                    onClick={this.handleRemoveMembershipButtonClick}
                    confirmationMessage={removeUG}
                    transparent
                    disabled={readOnly || pending}
                />
            </div>
        );
    }
}
