import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';
import Table from '#rscv/Table';
import {
    isTruthy,
    compareString,
    compareDate,
} from '@togglecorp/fujs';
import {
    RequestClient,
    requestMethods,
} from '#request';
import { activeUserSelector } from '#redux';
import _ts from '#ts';

import Actions from './Actions';

import styles from './styles.scss';

const propTypes = {
    frameworkId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    onSetUsers: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onAddUser: PropTypes.func.isRequired,
    onPatchUser: PropTypes.func.isRequired,
    onDeleteUser: PropTypes.func.isRequired,
    users: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
    frameworkRolesRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    usersGetRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    frameworkId: undefined,
    users: [],
    activeUser: {},
    frameworkRolesRequest: {},
    usersGetRequest: {},
};

const requests = {
    usersGetRequest: {
        url: ({ props }) => `/analysis-frameworks/${props.frameworkId}/memberships/`,
        method: requestMethods.GET,
        onMount: true,
        onSuccess: ({
            response: { memberships } = {},
            props: { onSetUsers },
        }) => {
            onSetUsers(memberships);
        },
        schemaName: 'frameworkMembersList',
    },
    frameworkRolesRequest: {
        url: '/framework-roles/',
        method: requestMethods.GET,
        onMount: true,
    },
};

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
});

const emptyObject = {};
const getComparator = (func, key, subKey) => (a = emptyObject, b = emptyObject) => func(
    isTruthy(subKey) ? (a[key] || emptyObject)[subKey] : a[key],
    isTruthy(subKey) ? (b[key] || emptyObject)[subKey] : b[key],
);

const keySelector = d => d.id;

@connect(mapStateToProps)
@RequestClient(requests)
export default class FrameworkUsersTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'memberName',
                label: _ts('project.framework.editModal', 'nameTitle'),
                order: 1,
                sortable: true,
                comparator: getComparator(compareString, 'memberDetails', 'displayName'),
                modifier: ({
                    member,
                    memberDetails: {
                        displayName,
                    },
                }) => {
                    const { activeUser } = this.props;
                    return member === activeUser.userId
                        ? _ts('project.framework.editModal', 'meTitle', { name: displayName })
                        : displayName;
                },
            },
            {
                key: 'memberEmail',
                label: _ts('project.framework.editModal', 'emailTitle'),
                order: 2,
                sortable: true,
                comparator: getComparator(compareString, 'memberDetails', 'email'),
                modifier: ({ memberDetails: { email } }) => email,
            },
            {
                key: 'memberOrganization',
                label: _ts('project.framework.editModal', 'organizationTitle'),
                order: 3,
                sortable: true,
                comparator: getComparator(compareString, 'memberDetails', 'organization'),
                modifier: ({ memberDetails: { organization } }) => organization,
            },
            {
                key: 'joinedAt',
                label: _ts('project.framework.editModal', 'joinedAtTitle'),
                order: 4,
                sortable: true,
                comparator: getComparator(compareDate, 'joinedAt'),
                modifier: ({ joinedAt }) => (
                    <FormattedDate
                        date={joinedAt}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
            {
                key: 'actions',
                label: _ts('project.framework.editModal', 'actionsTitle'),
                order: 5,
                modifier: ({
                    id,
                    role,
                    member,
                    memberDetails,
                }) => {
                    const {
                        frameworkRolesRequest: {
                            response: {
                                results: roles,
                            },
                        },
                        onDeleteUser,
                        onPatchUser,
                        activeUser: { userId },
                    } = this.props;

                    return (
                        <Actions
                            member={id}
                            memberDetails={memberDetails}
                            role={role}
                            roles={roles}
                            onDeleteUser={onDeleteUser}
                            onPatchUser={onPatchUser}
                            isActiveUser={userId === member}
                        />
                    );
                },
            },
        ];
    }

    render() {
        const {
            frameworkRolesRequest: {
                pending: frameworkRolesPending,
            },
            usersGetRequest: {
                pending: frameworkUsersPending,
            },
            users,
        } = this.props;

        if (frameworkRolesPending || frameworkUsersPending) {
            return (
                <div className={styles.usersTable} >
                    <LoadingAnimation />
                </div>
            );
        }

        return (
            <div className={styles.usersTable} >
                <header className={styles.header} >
                    <h4>
                        {_ts('project.framework.editModal', 'membersTableHeader')}
                    </h4>
                </header>
                <div className={styles.tableContainer} >
                    <Table
                        headers={this.headers}
                        data={users}
                        keySelector={keySelector}
                    />
                </div>
            </div>
        );
    }
}
