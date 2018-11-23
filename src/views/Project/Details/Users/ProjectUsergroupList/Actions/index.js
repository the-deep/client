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
    removeProjectUserGroupAction,
    modifyProjectUserGroupAction,
    projectRoleListSelector,
} from '#redux';

import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const RequestPropType = PropTypes.shape({
    pending: PropTypes.bool.isRequired,
});

const propTypes = {
    row: PropTypes.shape({
        role: PropTypes.string,
    }).isRequired,
    projectRoleList: PropTypes.shape({
        title: PropTypes.string,
    }).isRequired,
    removeUsergroupMembershipRequest: RequestPropType.isRequired,
    changeUserGroupRoleRequest: RequestPropType.isRequired,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    readOnly: false,
};

const requests = {
    changeUserGroupRoleRequest: {
        url: ({ params: { usergroupMembership } }) => `/project-usergroups/${usergroupMembership.id}/`,
        method: requestMethods.PATCH,
        body: ({ params: { usergroupMembership } }) => usergroupMembership,
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
        method: requestMethods.DELETE,
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
@RequestClient(requests)
export default class Actions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleRoleSelectInputChange = (newRole) => {
        const {
            row: {
                id,
            },
            changeUserGroupRoleRequest,
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
            removeUsergroupMembershipRequest,
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
            removeUsergroupMembershipRequest: {
                pending = false,
            } = {},
        } = this.props;

        const {
            role,
        } = row;

        return (
            <div className={styles.actions} >
                {pending && <LoadingAnimation small />}
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
                    iconName={iconNames.delete}
                    onClick={this.handleRemoveMembershipButtonClick}
                    confirmationMessage={_ts(
                        'project.usergroups',
                        'removeUsergroupConfirmationMessage',
                        {
                            title: row.title,
                        },
                    )}
                    transparent
                    disabled={readOnly || pending}
                />
            </div>
        );
    }
}
