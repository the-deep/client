import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { iconNames } from '#constants';

import PrimaryButton from '#rsca/Button/PrimaryButton';

import {
    addProjectMembershipAction,
    addProjectUserGroupAction,
} from '#redux';

import UserMembershipRequest from './requests/UserMembershipRequest';
import UsergroupMembershipRequest from './requests/UsergroupMembershipRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    type: PropTypes.string.isRequired,
    memberId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    username: PropTypes.string,
    usergroupTitle: PropTypes.string,
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
export default class SearchListItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;


    constructor(props) {
        super(props);

        const setState = d => d.setState(d);
        this.userMembershipRequest = new UserMembershipRequest({
            setState,
        });

        this.usergroupMembershipRequest = new UsergroupMembershipRequest({
            setState,
        });
    }

    componentWillUnmount() {
        this.userMembershipRequest.stop();
        this.usergroupMembershipRequest.stop();
    }

    addUser = () => {
        const {
            projectId,
            memberId,
        } = this.props;

        const memberlist = [
            {
                project: projectId,
                member: memberId,
            },
        ];

        this.createProjectMembershipRequest.init(projectId, memberlist);
        this.createProjectMembershipRequest.start();
    }

    addUserGroup = () => {
        const {
            projectId,
            memberId,
        } = this.props;

        const projectUserGroup = {
            project: projectId,
            usergroup: memberId,
        };

        this.createProjectUserGroupRequest.init(projectId, projectUserGroup);
        this.createProjectUserGroupRequest.start();
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
                            title="Add usergroup to the project"
                        />
                    </div>
                </div>
            );
        }

        if (type === USER) {
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
                            onClick={this.handleAdduserButtonClick}
                            iconName={iconNames.add}
                            title="Add user to the project"
                        />
                    </div>
                </div>
            );
        }

        return null;
    }
}
