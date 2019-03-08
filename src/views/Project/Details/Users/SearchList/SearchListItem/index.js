import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { capitalize } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import DisplayPicture from '#components/viewer/DisplayPicture';

import {
    RequestClient,
    requestMethods,
    notifyOnFailure,
} from '#request';
import {
    addProjectMembershipAction,
    addProjectUsergroupAction,
} from '#redux';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const RequestPropType = PropTypes.shape({
    pending: PropTypes.bool.isRequired,
});

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
        url: '/project-usergroups/',
        method: requestMethods.POST,
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
            lastName,
            firstName,
            displayPicture,
            usergroupTitle,
            usergroupMembershipRequest,
            userMembershipRequest,
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
            const className = `
                ${classNameFromProps}
                ${styles.user}
            `;

            return (
                <div className={className}>
                    <div className={styles.top}>
                        <DisplayPicture
                            className={styles.picture}
                            galleryId={displayPicture}
                        />
                        <div className={styles.name}>
                            <div className={styles.text}>
                                {`${firstName} ${lastName}`}
                            </div>
                            <div>
                                { username }
                            </div>
                        </div>
                    </div>
                    <div className={actionButtonsClassName}>
                        <PrimaryButton
                            onClick={this.handleAddUserButtonClick}
                            iconName="add"
                            title={capitalize(_ts('project.users', 'addUserButtonTooltip'))}
                            pending={userMembershipRequest.pending}
                        />
                    </div>
                </div>
            );
        }

        return null;
    }
}
