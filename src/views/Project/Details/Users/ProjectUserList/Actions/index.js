import React from 'react';
import PropTypes from 'prop-types';
import DangerButton from '#rsca/Button/DangerButton';
import SelectInput from '#rsci/SelectInput';

import {
    RequestClient,
    requestMethods,
} from '#request';
import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const userRoleOptions = [
    {
        key: 1,
        label: 'Admin',
    },
    {
        key: 3,
        label: 'Sorcerer',
    },
    {
        key: 4,
        label: 'Tagger',
    },
    {
        key: 2,
        label: 'Analyst',
    },
];

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
};

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
        const { row } = this.props;
        const { role } = row;

        return (
            <div className={styles.actions}>
                <SelectInput
                    label="Role"
                    placeholder=""
                    hideClearButton
                    value={role}
                    options={userRoleOptions}
                    onChange={this.handleRoleSelectInputChange}
                    showHintAndError={false}
                />
                <DangerButton
                    smallVerticalPadding
                    title={_ts('project.user', 'deleteMemberLinkTitle')}
                    iconName={iconNames.delete}
                    onClick={this.handleRemoveMembershipButtonClick}
                    onClickParams={{ row }}
                    transparent
                />
            </div>
        );
    }
}
