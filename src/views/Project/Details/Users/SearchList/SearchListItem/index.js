import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { iconNames } from '#constants';

import {
    RequestClient,
    requestMethods,
} from '#request';

import PrimaryButton from '#rsca/Button/PrimaryButton';

import {
    addProjectMembershipAction,
    addProjectUserGroupAction,
} from '#redux';
import _ts from '#ts';

import styles from './styles.scss';

const RequestPropType = PropTypes.shape({
    pending: PropTypes.bool.isRequired,
});

const propTypes = {
    className: PropTypes.string,
    type: PropTypes.string.isRequired,
    memberId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    username: PropTypes.string,
    // eslint-disable-next-line react/no-unused-prop-types
    onItemRemove: PropTypes.func.isRequired,
    usergroupTitle: PropTypes.string,
    userMembershipRequest: RequestPropType.isRequired,
    usergroupMembershipRequest: RequestPropType.isRequired,
};

const requests = {
    userMembershipRequest: {
        url: '/project-memberships/',
        method: requestMethods.POST,
        body: ({
            params: { membership },
        }) => membership,
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
            onItemRemove(member);
        },
    },

    usergroupMembershipRequest: {
        url: '/project-usergroups/',
        method: requestMethods.POST,
        body: ({ params: { membership } }) => membership,
    },
};

const defaultProps = {
    className: '',
    username: undefined,
    usergroupTitle: undefined,
};

const mapDispatchToProps = dispatch => ({
    addProjectMember: params => dispatch(addProjectMembershipAction(params)),
    addProjectUserGroup: params => dispatch(addProjectUserGroupAction(params)),
});

@connect(undefined, mapDispatchToProps)
@RequestClient(requests)
export default class SearchListItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleAddUserButtonClick = () => {
        const {
            projectId,
            memberId,
            userMembershipRequest,
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
            usergroupMembershipRequest,
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
            usergroupTitle,
            usergroupMembershipRequest,
            userMembershipRequest,
            className: classNameFromProps,
        } = this.props;

        const USER = 'user';
        const USERGROUP = 'user_group';
        const actionButtonsClassNames = [styles.actionButtons];
        if (usergroupMembershipRequest.pending || userMembershipRequest.pending) {
            actionButtonsClassNames.push(styles.pending);
        }

        if (type === USERGROUP) {
            const className = `
                ${classNameFromProps}
                ${styles.usergroup}
            `;

            const iconClassName = `
                ${iconNames.userGroup}
                ${styles.icon}
            `;

            return (
                <div className={className}>
                    <div className={iconClassName} />
                    <div className={styles.title}>
                        { usergroupTitle }
                    </div>
                    <div className={actionButtonsClassNames.join(' ')}>
                        <PrimaryButton
                            onClick={this.handleAddUsergroupButtonClick}
                            iconName={iconNames.add}
                            title={_ts('project.users', 'addUsergroupButtonTooltip')}
                            pending={usergroupMembershipRequest.pending}
                        />
                    </div>
                </div>
            );
        } else if (type === USER) {
            const className = `
                ${classNameFromProps}
                ${styles.user}
            `;

            const iconClassName = `
                ${iconNames.user}
                ${styles.icon}
            `;

            return (
                <div className={className}>
                    <div className={iconClassName} />
                    <div className={styles.title}>
                        { username }
                    </div>
                    <div className={actionButtonsClassNames.join(' ')}>
                        <PrimaryButton
                            onClick={this.handleAddUserButtonClick}
                            iconName={iconNames.add}
                            title={_ts('project.users', 'addUserButtonTooltip')}
                            pending={userMembershipRequest.pending}
                        />
                    </div>
                </div>
            );
        }

        return null;
    }
}
