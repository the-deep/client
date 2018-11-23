import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import SelectInput from '#rsci/SelectInput';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    RequestClient,
    requestMethods,
} from '#request';
import {
    removeProjectMembershipAction,
    modifyProjectMembershipAction,
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
        onSuccess: ({
            params: { membership },
            props: {
                projectId,
                modifyProjectMembership,
            },
        }) => {
            modifyProjectMembership({
                projectId,
                membershipId: membership.id,
                newRole: membership.role,
            });
        },
    },

    removeUserMembershipRequest: {
        url: ({ params: { membershipId } }) => `/project-memberships/${membershipId}/`,
        method: requestMethods.DELETE,
        onSuccess: ({
            params: { membershipId },
            props: {
                removeProjectMembership,
                projectId,
            },
        }) => {
            removeProjectMembership({
                projectId,
                membershipId,
            });
        },
    },
};

const RequestPropType = PropTypes.shape({
    pending: PropTypes.bool.isRequired,
});

const propTypes = {
    changeUserRoleRequest: RequestPropType.isRequired,
    removeUserMembershipRequest: RequestPropType.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    removeProjectMembership: PropTypes.func.isRequired,
    row: PropTypes.shape({
        role: PropTypes.string,
    }).isRequired,
    projectRoleList: PropTypes.shape({
        title: PropTypes.string,
    }).isRequired,
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }).isRequired,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    readOnly: false,
};

const mapStateToProps = state => ({
    projectRoleList: projectRoleListSelector(state),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    removeProjectMembership: params => dispatch(removeProjectMembershipAction(params)),
    modifyProjectMembership: params => dispatch(modifyProjectMembershipAction(params)),
});

const projectRoleKeySelector = d => d.id;
const projectRoleLabelSelector = d => d.title;

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requests)
export default class Actions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
            row: { id: membershipId },
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
            changeUserRoleRequest,
            removeUserMembershipRequest,
            readOnly,
        } = this.props;

        const {
            role,
            member: memberId,
            memberName,
            memberEmail,
        } = row;
        const pending = changeUserRoleRequest.pending || removeUserMembershipRequest.pending;

        return (
            <div className={styles.actions}>
                {pending && <LoadingAnimation small /> }
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
                    disabled={activeUserId === memberId || pending}
                />
                <DangerConfirmButton
                    smallVerticalPadding
                    title={_ts('project.users', 'removeMembershipButtonPlaceholder')}
                    disabled={readOnly || pending}
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
