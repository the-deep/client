import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';
import Table from '#rscv/Table';
import {
    isDefined,
    compareString,
    compareDate,
} from '@togglecorp/fujs';
import {
    RequestClient,
    methods,
} from '#request';
import { activeUserSelector } from '#redux';

import _ts from '#ts';
import notify from '#notify';

import AddFromSearch from './AddFromSearch';
import Actions from './Actions';

import styles from './styles.scss';

const propTypes = {
    frameworkId: PropTypes.number,
    canEditMemberships: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onSetUsers: PropTypes.func.isRequired,
    onAddUser: PropTypes.func.isRequired,
    onPatchUser: PropTypes.func.isRequired,
    onDeleteUser: PropTypes.func.isRequired,
    users: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
    // Close modal is used here to unmount modal if there is failure to get
    // memberships or roles
    // eslint-disable-next-line react/no-unused-prop-types
    closeModal: PropTypes.func.isRequired,
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    frameworkId: undefined,
    users: [],
    activeUser: {},
};

const requestOptions = {
    usersGetRequest: {
        url: ({ props }) => `/analysis-frameworks/${props.frameworkId}/memberships/`,
        method: methods.GET,
        onMount: true,
        onSuccess: ({
            response: { results } = {},
            props: { onSetUsers },
        }) => {
            onSetUsers(results);
        },
        onFailure: ({ props: { closeModal } }) => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'membersGetFailure'),
                duration: notify.duration.SLOW,
            });
            closeModal();
        },
        onFatal: ({ props: { closeModal } }) => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'membersGetFatal'),
                duration: notify.duration.SLOW,
            });
            closeModal();
        },
        extras: {
            schemaName: 'frameworkMembersList',
        },
    },
    frameworkRolesRequest: {
        url: ({ props: { isPrivate } }) =>
            (isPrivate
                ? '/private-framework-roles/'
                : '/public-framework-roles/?is_default_role=false'),
        // FIXME: Query is not used as current behavior of react rest request
        // remove the query field as its value is false
        method: methods.GET,
        onMount: true,
        extras: {
            schemaName: 'frameworkRolesList',
        },
        onFailure: ({ props: { closeModal } }) => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'rolesGetFailure'),
                duration: notify.duration.SLOW,
            });
            closeModal();
        },
        onFatal: ({ props: { closeModal } }) => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'rolesGetFatal'),
                duration: notify.duration.SLOW,
            });
            closeModal();
        },
    },
};

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
});

const emptyObject = {};
const getComparator = (func, key, subKey) => (a = emptyObject, b = emptyObject) => func(
    isDefined(subKey) && isDefined(a[key]) ? a[key][subKey] : a[key],
    isDefined(subKey) && isDefined(b[key]) ? b[key][subKey] : b[key],
);

const keySelector = d => d.id;

@connect(mapStateToProps)
@RequestClient(requestOptions)
export default class FrameworkUsersTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            searchText: '',
        };

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
                        value={joinedAt}
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
                        requests: {
                            frameworkRolesRequest: {
                                response: {
                                    results: roles,
                                },
                            },
                        },
                        onDeleteUser,
                        onPatchUser,
                        canEditMemberships,
                        activeUser: { userId },
                    } = this.props;

                    return (
                        <Actions
                            member={id}
                            memberDetails={memberDetails}
                            role={role}
                            roles={roles}
                            onDeleteUser={onDeleteUser}
                            canEditMemberships={canEditMemberships}
                            onPatchUser={onPatchUser}
                            isActiveUser={userId === member}
                        />
                    );
                },
            },
        ];
    }

    handleSearchChange = (searchText) => {
        this.setState({ searchText });
    }

    render() {
        const {
            frameworkId,
            onAddUser,
            requests: {
                frameworkRolesRequest: { pending: frameworkRolesPending },
                usersGetRequest: { pending: frameworkUsersPending },
            },
            users,
            canEditMemberships,
        } = this.props;

        const {
            searchText,
        } = this.state;

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
                    <h4 className={styles.heading} >
                        {_ts('project.framework.editModal', 'membersTableHeader')}
                    </h4>
                    {canEditMemberships && (
                        <AddFromSearch
                            className={styles.addInput}
                            onAddUser={onAddUser}
                            frameworkId={frameworkId}
                            searchText={searchText}
                            onSearchChange={this.handleSearchChange}
                        />
                    )}
                </header>
                <Table
                    className={styles.table}
                    headers={this.headers}
                    data={users}
                    keySelector={keySelector}
                />
            </div>
        );
    }
}
