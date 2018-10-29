import React from 'react';
import PropTypes from 'prop-types';
import DangerButton from '#rsca/Button/DangerButton';

import {
    RequestClient,
    requestMethods,
} from '#request';
import { iconNames } from '#constants';
import _ts from '#ts';

const RequestPropType = PropTypes.shape({
    pending: PropTypes.bool.isRequired,
});

const propTypes = {
    row: PropTypes.shape({
        role: PropTypes.string,
    }).isRequired,
    removeUsergroupMembershipRequest: RequestPropType.isRequired,
};

const requests = {
    removeUsergroupMembershipRequest: {
        url: ({ params: { membershipId } }) => `/project-usergroups/${membershipId}/`,
        method: requestMethods.DELETE,
        isUnique: true,
        group: 'usersRequest',
    },
};

@RequestClient(requests)
export default class Actions extends React.PureComponent {
    static propTypes = propTypes;

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
        const { row } = this.props;

        return (
            <DangerButton
                smallVerticalPadding
                title={_ts('project.users', 'removeMembershipButtonPlaceholder')}
                iconName={iconNames.delete}
                onClick={this.handleRemoveMembershipButtonClick}
                onClickParams={{ row }}
                transparent
            />
        );
    }
}
