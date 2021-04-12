import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { capitalize } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import UserAddItem from '#components/general/UserAddItem';

import {
    notifyOnFailure,
} from '#utils/requestNotify';
import {
    RequestClient,
    methods,
} from '#request';
import {
    addProjectMembershipAction,
    addProjectUsergroupAction,
} from '#redux';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    type: PropTypes.string.isRequired,
    memberId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    username: PropTypes.string,
    displayPicture: PropTypes.number,
    // eslint-disable-next-line react/no-unused-prop-types
    onItemRemove: PropTypes.func.isRequired,
    usergroupTitle: PropTypes.string,
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const requestOptions = {
    userMembershipRequest: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/project-memberships/`,
        method: methods.POST,
        body: ({ params: { membership } }) => membership,
        onFailure: notifyOnFailure(_ts('project.users', 'usersTitle')),
        onSuccess: ({
            response,
            params: {
                membership: {
                    member,
                } = {},
            } = {},
            props: {
                projectId,
                addProjectMember,
                onItemRemove,
            },
        }) => {
            addProjectMember({
                projectId,
                membership: response,
            });
            onItemRemove(member, 'user');
        },
    },

    usergroupMembershipRequest: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/project-usergroups/`,
        method: methods.POST,
        body: ({ params: { membership } }) => membership,
        onFailure: notifyOnFailure(_ts('project.users', 'usergroupsTitle')),
        onSuccess: ({
            response,
            params: {
                membership: {
                    usergroup,
                } = {},
            } = {},
            props: {
                projectId,
                addProjectUsergroup,
                onItemRemove,
            },
        }) => {
            addProjectUsergroup({
                projectId,
                usergroup: response,
            });
            onItemRemove(usergroup, 'user_group');
        },
    },
};

const defaultProps = {
    className: '',
    username: undefined,
    firstName: undefined,
    lastName: undefined,
    displayPicture: undefined,
    usergroupTitle: undefined,
};

const mapDispatchToProps = dispatch => ({
    addProjectMember: params => dispatch(addProjectMembershipAction(params)),
    addProjectUsergroup: params => dispatch(addProjectUsergroupAction(params)),
});

@connect(undefined, mapDispatchToProps)
@RequestClient(requestOptions)
export default class SearchListItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleAddUserButtonClick = () => {
        const {
            projectId,
            memberId,
            requests: {
                userMembershipRequest,
            },
        } = this.props;

        const membership = {
            project: projectId,
            member: memberId,
        };

        userMembershipRequest.do({ membership });
    }

    handleAddUsergroupButtonClick = () => {
        const {
            projectId,
            memberId,
            requests: {
                usergroupMembershipRequest,
            },
        } = this.props;

        const membership = {
            project: projectId,
            usergroup: memberId,
        };

        usergroupMembershipRequest
            .do({ membership });
    }

    render() {
        const {
            type,
            username,
            lastName,
            firstName,
            displayPicture,
            usergroupTitle,
            requests: {
                usergroupMembershipRequest,
                userMembershipRequest,
            },
            className: classNameFromProps,
        } = this.props;

        const USER = 'user';
        const USERGROUP = 'user_group';

        const actionButtonsClassName = _cs(
            styles.actionButtons,
            (usergroupMembershipRequest.pending || userMembershipRequest.pending) && styles.pending,
        );

        if (type === USERGROUP) {
            const className = `
                ${classNameFromProps}
                ${styles.usergroup}
            `;

            return (
                <div className={className}>
                    <div className={styles.top}>
                        <Icon
                            className={styles.icon}
                            name="userGroup"
                        />
                        <div className={styles.name}>
                            <div className={styles.text}>
                                { usergroupTitle }
                            </div>
                        </div>
                    </div>
                    <div className={actionButtonsClassName}>
                        <PrimaryButton
                            onClick={this.handleAddUsergroupButtonClick}
                            iconName="add"
                            title={capitalize(_ts('project.users', 'addUsergroupButtonTooltip'))}
                            pending={usergroupMembershipRequest.pending}
                        />
                    </div>
                </div>
            );
        } else if (type === USER) {
            return (
                <UserAddItem
                    className={classNameFromProps}
                    displayPicture={displayPicture}
                    pending={userMembershipRequest.pending}
                    firstName={firstName}
                    lastName={lastName}
                    username={username}
                    onAddButtonClick={this.handleAddUserButtonClick}
                    actionButtonTitle={capitalize(_ts('project.users', 'addUserButtonTooltip'))}
                />
            );
        }

        return null;
    }
}
