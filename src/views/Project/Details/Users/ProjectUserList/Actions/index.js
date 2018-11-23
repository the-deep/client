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
    changeMembershipRequest: {
        url: ({ params: { membership } }) => `/project-memberships/${membership.id}/`,
        method: requestMethods.PUT,
        body: ({ params: { membership } }) => membership,
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
    changeMembershipRequest: RequestPropType.isRequired,
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

const userGroupKeySelector = userGroup => userGroup.id;
const userGroupLabelSelector = userGroup => userGroup.title;

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requests)
export default class Actions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleRoleSelectInputChange = (newRole) => {
        const {
            row,
            changeMembershipRequest,
        } = this.props;

        changeMembershipRequest.do({
            membership: {
                ...row,
                role: newRole,
            },
        });
    }

    handleLinkedGroupChange = (newGroup) => {
        const {
            row,
            changeMembershipRequest,
        } = this.props;

        changeMembershipRequest.do({
            membership: {
                ...row,
                linkedGroup: newGroup || null, // We need to pass null to unset
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
            changeMembershipRequest,
            removeUserMembershipRequest,
            readOnly,
        } = this.props;

        const {
            role,
            member: memberId,
            memberName,
            memberEmail,
            linkedGroup,
        } = row;
        const pending = changeMembershipRequest.pending || removeUserMembershipRequest.pending;

        return (
            <div className={styles.actions}>
                {pending && <LoadingAnimation small /> }
                <SelectInput
                    className={styles.inputElement}
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
                    disabled={!!linkedGroup || activeUserId === memberId || pending}
                />
                <SelectInput
                    className={styles.inputElement}
                    label={_ts('project.users', 'linkedGroupTitle')}
                    placeholder={_ts('project.users', 'linkedGroupPlaceholder')}
                    value={row.linkedGroup}
                    options={row.userGroupOptions}
                    onChange={this.handleLinkedGroupChange}
                    keySelector={userGroupKeySelector}
                    labelSelector={userGroupLabelSelector}
                    showHintAndError={false}
                    disabled={activeUserId === memberId || pending}
                    readOnly={readOnly}
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
