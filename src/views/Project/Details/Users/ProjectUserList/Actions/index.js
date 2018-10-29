import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import SelectInput from '#rsci/SelectInput';

import {
    RequestClient,
    requestMethods,
} from '#request';
import {
    projectRoleListSelector,
    activeUserSelector,
} from '#redux';
import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const requests = {
    changeUserRoleRequest: {
        url: ({ params: { membership } }) => `/project-memberships/${membership.id}/`,
        method: requestMethods.PATCH,
        body: ({ params: { membership } }) => membership,
        isUnique: true,
        group: 'usersRequest',
    },

    removeUserMembershipRequest: {
        url: ({ params: { membershipId } }) => `/project-memberships/${membershipId}/`,
        method: requestMethods.DELETE,
        isUnique: true,
        group: 'usersRequest',
    },
};

const RequestPropType = PropTypes.shape({
    pending: PropTypes.bool.isRequired,
});

const propTypes = {
    changeUserRoleRequest: RequestPropType.isRequired,
    removeUserMembershipRequest: RequestPropType.isRequired,
    row: PropTypes.shape({
        role: PropTypes.string,
    }).isRequired,
    projectRoleList: PropTypes.shape({
        title: PropTypes.string,
    }).isRequired,
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }).isRequired,
};

const mapStateToProps = state => ({
    projectRoleList: projectRoleListSelector(state),
    activeUser: activeUserSelector(state),
});

const projectRoleKeySelector = d => d.id;
const projectRoleLabelSelector = d => d.title;

@connect(mapStateToProps)
@RequestClient(requests)
export default class Actions extends React.PureComponent {
    static propTypes = propTypes;

    handleRoleSelectInputChange = (newRole) => {
        const {
            row: {
                id: membershipId,
            },
            changeUserRoleRequest,
        } = this.props;

        changeUserRoleRequest.do({
            membership: {
                id: membershipId,
                role: newRole,
            },
        });
    }

    handleRemoveMembershipButtonClick = () => {
        const {
            row: {
                id: membershipId,
            },
            removeUserMembershipRequest,
        } = this.props;

        removeUserMembershipRequest.do({ membershipId });
    }

    render() {
        const {
            row,
            projectRoleList,
            activeUser: {
                userId: activeUserId,
            },
        } = this.props;

        const {
            role,
            member: memberId,
            memberName,
            memberEmail,
        } = row;

        return (
            <div className={styles.actions}>
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
                    disabled={activeUserId === memberId}
                />
                <DangerConfirmButton
                    smallVerticalPadding
                    title={_ts('project.users', 'removeMembershipButtonPlaceholder')}
                    confirmationMessage={_ts(
                        'project.users',
                        'removeMembershipConfirmationMessage',
                        {
                            memberName,
                            memberEmail,
                        },
                    )}
                    iconName={iconNames.delete}
                    onClick={this.handleRemoveMembershipButtonClick}
                    transparent
                />
            </div>
        );
    }
}
