import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import PrimaryConfirmButton from '#rsca/ConfirmButton/PrimaryConfirmButton';

import { pathNames } from '#constants/';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    row: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    isCurrentUserAdmin: PropTypes.bool.isRequired,

    onRemoveMember: PropTypes.func.isRequired,
    onChangeMemberRole: PropTypes.func.isRequired,
};

const defaultProps = {};

export default class ActionButtons extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getLinks = () => {
        const {
            row,
        } = this.props;

        const userProfile = {
            pathname: reverseRoute(
                pathNames.userProfile,
                {
                    userId: row.member,
                },
            ),
        };

        return { userProfile };
    }

    renderLinkToUserProfile = () => (
        <Link
            className={styles.link}
            title={_ts('userGroup', 'viewMemberLinkTitle')}
            to={this.getLinks().userProfile}
        >
            <Icon name="openLink" />
        </Link>
    )

    render() {
        const {
            row,
            activeUser,
            isCurrentUserAdmin,
            onRemoveMember,
            onChangeMemberRole,
        } = this.props;

        const isAdmin = row.role === 'admin';
        const isCurrentUser = row.member === activeUser.userId;

        if (isCurrentUser || !isCurrentUserAdmin) {
            return this.renderLinkToUserProfile();
        }

        const confirmMsg = _ts('userGroup', 'confirmTextRemoveMember', {
            memberName: (<b>{row.memberName}</b>),
        });


        const permissionConfirmMsg = isAdmin
            ? _ts('userGroup', 'confirmTextRevokeAdmin', {
                memberName: (<b>{row.memberName}</b>),
            })
            : _ts('userGroup', 'confirmTextGrantAdmin', {
                memberName: (<b>{row.memberName}</b>),
            });

        return (
            <Fragment>
                {
                    this.renderLinkToUserProfile()
                }
                <PrimaryConfirmButton
                    title={
                        isAdmin
                            ? _ts('userGroup', 'revokeAdminLinkTitle')
                            : _ts('userGroup', 'grantAdminLinkTitle')
                    }
                    onClick={() => onChangeMemberRole(row)}
                    iconName={isAdmin ? 'locked' : 'person'}
                    smallVerticalPadding
                    transparent
                    confirmationMessage={permissionConfirmMsg}
                />
                <DangerConfirmButton
                    title={_ts('userGroup', 'deleteMemberLinkTitle')}
                    onClick={() => onRemoveMember(row)}
                    iconName="delete"
                    smallVerticalPadding
                    transparent
                    confirmationMessage={confirmMsg}
                />
            </Fragment>
        );
    }
}
