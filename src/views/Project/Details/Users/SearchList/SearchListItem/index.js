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
        isUnique: true,
        group: 'usersRequest',
    },

    usergroupMembershipRequest: {
        url: '/project-usergroups/',
        method: requestMethods.POST,
        body: ({ params: { membership } }) => membership,
        isUnique: true,
        group: 'usersRequest',
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
            className: classNameFromProps,
        } = this.props;

        const USER = 'user';
        const USERGROUP = 'user_group';

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
                    <div className={styles.actionButtons}>
                        <PrimaryButton
                            onClick={this.handleAddUsergroupButtonClick}
                            iconName={iconNames.add}
                            title={_ts('project.users', 'addUsergroupButtonTooltip')}
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
                    <div className={styles.actionButtons}>
                        <PrimaryButton
                            onClick={this.handleAddUserButtonClick}
                            iconName={iconNames.add}
                            title={_ts('project.users', 'addUserButtonTooltip')}
                        />
                    </div>
                </div>
            );
        }

        return null;
    }
}
