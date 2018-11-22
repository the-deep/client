import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import {
    RequestClient,
    requestMethods,
} from '#request';
import {
    removeProjectUserGroupAction,
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
    removeUsergroupMembershipRequest: RequestPropType.isRequired,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    readOnly: false,
};

const requests = {
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
        isUnique: true,
    },
};

const mapDispatchToProps = dispatch => ({
    removeProjectUsergroup: params => dispatch(removeProjectUserGroupAction(params)),
});

@connect(undefined, mapDispatchToProps)
@RequestClient(requests)
export default class Actions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
            row,
            removeUsergroupMembershipRequest: {
                pending = false,
            } = {},
        } = this.props;

        return (
            <div className={styles.actions} >
                {pending && <LoadingAnimation small />}
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
