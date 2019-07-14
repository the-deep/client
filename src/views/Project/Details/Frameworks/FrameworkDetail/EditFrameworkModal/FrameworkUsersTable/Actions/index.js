import React from 'react';
import PropTypes from 'prop-types';

import SelectInput from '#rsci/SelectInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';

import {
    RequestClient,
    requestMethods,
    notifyOnFailure,
} from '#request';

import _ts from '#ts';

import styles from './styles.scss';

const requests = {
    changeMembershipRequest: {
        url: ({ props: { member } }) => `/framework-memberships/${member}/`,
        method: requestMethods.PATCH,
        body: ({ params: { membership } }) => membership,
        onFailure: notifyOnFailure(_ts('project.users', 'usersTitle')),
        onSuccess: ({
            response,
            props: {
                member,
                onPatchUser,
            },
        }) => {
            onPatchUser(member, response);
        },
        schemaName: 'frameworkMembership',
    },

    removeUserMembershipRequest: {
        url: ({ props: { member } }) => `/framework-memberships/${member}/`,
        method: requestMethods.DELETE,
        onFailure: notifyOnFailure(_ts('project.users', 'usersTitle')),
        onSuccess: ({ props: {
            onDeleteUser,
            member,
        } }) => {
            onDeleteUser(member);
        },
    },
};

const propTypes = {
    changeMembershipRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    removeUserMembershipRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    member: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    role: PropTypes.number.isRequired,
    roles: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    memberDetails: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
    }),
    isActiveUser: PropTypes.bool.isRequired,
};

const defaultProps = {
    changeMembershipRequest: {},
    removeUserMembershipRequest: {},
    memberDetails: {},
};

const rolesKeySelector = d => d.id;
const rolesLabelSelector = d => d.title;

@RequestClient(requests)
export default class EditFrameworkUsersActions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleRoleChange = (role) => {
        const { changeMembershipRequest } = this.props;
        changeMembershipRequest.do({ membership: { role } });
    }

    handleUserRemove = () => {
        const { removeUserMembershipRequest } = this.props;
        removeUserMembershipRequest.do();
    }

    render() {
        const {
            changeMembershipRequest: {
                pending: changePending,
            },
            removeUserMembershipRequest: {
                pending: removePending,
            },
            role,
            roles,
            memberDetails: {
                displayName: name,
                email,
            },
            isActiveUser,
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
                    disabled={pending || isActiveUser}
                    label={_ts('project.framework.editModal', 'userRoleSelectTitle')}
                    placeholder=""
                    hideClearButton
                    showHintAndError={false}
                />
                <DangerConfirmButton
                    transparent
                    iconName="delete"
                    onClick={this.handleUserRemove}
                    disabled={pending || isActiveUser}
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

