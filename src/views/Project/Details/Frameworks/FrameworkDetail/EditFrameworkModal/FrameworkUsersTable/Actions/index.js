import React from 'react';
import PropTypes from 'prop-types';

import SelectInput from '#rsci/SelectInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';

import {
    RequestClient,
    methods,
} from '#request';

import notify from '#notify';
import _ts from '#ts';

import styles from './styles.scss';

const requestOptions = {
    changeMembershipRequest: {
        url: ({ props: { member } }) => `/framework-memberships/${member}/`,
        method: methods.PATCH,
        body: ({ params: { membership } }) => membership,
        onFailure: () => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'membershipRoleChangeFailure'),
                duration: notify.duration.SLOW,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'membershipRoleChangeFatal'),
                duration: notify.duration.SLOW,
            });
        },
        onSuccess: ({
            response,
            props: {
                member,
                onPatchUser,
            },
        }) => {
            onPatchUser(member, response);
        },
        extras: {
            schemaName: 'frameworkMembership',
        },
    },
    removeUserMembershipRequest: {
        url: ({ props: { member } }) => `/framework-memberships/${member}/`,
        method: methods.DELETE,
        onFailure: () => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'membershipRemoveFailure'),
                duration: notify.duration.SLOW,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'membershipRemoveFatal'),
                duration: notify.duration.SLOW,
            });
        },
        onSuccess: ({ props: {
            onDeleteUser,
            member,
        } }) => {
            onDeleteUser(member);
        },
    },
};

const propTypes = {
    member: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    role: PropTypes.number.isRequired,
    roles: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    memberDetails: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
        displayName: PropTypes.string,
    }),
    isActiveUser: PropTypes.bool.isRequired,
    canEditMemberships: PropTypes.bool.isRequired,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    memberDetails: {},
};

const rolesKeySelector = d => d.id;
const rolesLabelSelector = d => d.title;

@RequestClient(requestOptions)
export default class EditFrameworkUsersActions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleRoleChange = (role) => {
        const {
            requests: {
                changeMembershipRequest,
            },
        } = this.props;
        changeMembershipRequest.do({ membership: { role } });
    }

    handleUserRemove = () => {
        const {
            requests: {
                removeUserMembershipRequest,
            },
        } = this.props;
        removeUserMembershipRequest.do();
    }

    render() {
        const {
            requests: {
                changeMembershipRequest: { pending: changePending },
                removeUserMembershipRequest: { pending: removePending },
            },
            role,
            roles,
            memberDetails: {
                displayName: name,
                email,
            },
            isActiveUser,
            canEditMemberships,
        } = this.props;

        const pending = changePending || removePending;

        return (
            <div className={styles.actions} >
                {pending && <LoadingAnimation />}
                <SelectInput
                    value={role}
                    options={roles}
                    onChange={this.handleRoleChange}
                    keySelector={rolesKeySelector}
                    labelSelector={rolesLabelSelector}
                    disabled={pending || isActiveUser || !canEditMemberships}
                    label={_ts('project.framework.editModal', 'userRoleSelectTitle')}
                    placeholder=""
                    hideClearButton
                    showHintAndError={false}
                />
                <DangerConfirmButton
                    transparent
                    iconName="delete"
                    onClick={this.handleUserRemove}
                    disabled={pending || isActiveUser || !canEditMemberships}
                    title={_ts('project.framework.editModal', 'userRemoveButtonTitle')}
                    confirmationMessage={_ts(
                        'project.framework.editModal',
                        'removeMembershipConfirmationMessage',
                        {
                            name,
                            email,
                        },
                    )}
                />
            </div>
        );
    }
}

