import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import { connect } from 'react-redux';
import { FaramListElement } from '@togglecorp/faram';
import {
    compareString,
    compareDate,
} from '@togglecorp/fujs';

import {
    RequestClient,
    requestMethods,
    notifyOnFailure,
} from '#request';
import _ts from '#ts';

import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';
import NormalTable from '#rscv/Table';

import {
    setProjectMembershipsAction,
    projectUsergroupListSelector,
    projectMembershipListSelector,
    projectRoleListSelector,
    activeUserSelector,
} from '#redux';

import Actions from './Actions';

import styles from './styles.scss';

const Table = FaramListElement(NormalTable);

const propTypes = {
    className: PropTypes.string,
    userListRequest: PropTypes.shape({
        pending: PropTypes.bool.isRequired,
    }).isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setProjectMemberships: PropTypes.func.isRequired,
    memberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    projectRoleList: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    searchEmptyComponent: PropTypes.func.isRequired,
    emptyComponent: PropTypes.func.isRequired,

    // eslint-disable-next-line react/no-unused-prop-types
    usergroups: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types

    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.number.isRequired,
    readOnly: PropTypes.bool,
    searchInputValue: PropTypes.string,
};

const defaultProps = {
    className: '',
    searchInputValue: '',
    readOnly: false,
};

const requests = {
    userListRequest: {
        onMount: true,
        onPropsChanged: ['projectId', 'usergroups'],
        url: '/project-memberships/',
        method: requestMethods.GET,
        query: ({ props: { projectId } }) => ({ project: projectId }),
        onFailure: notifyOnFailure(_ts('project.users', 'usersTitle')),
        onSuccess: ({
            response = {},
            props: {
                projectId,
                setProjectMemberships,
            },
        }) => {
            setProjectMemberships({
                projectId,
                memberships: response.results,
            });
        },
    },
};

const getComparator = (func, key) => (a, b) => func(a[key], b[key]);
const userListKeySelector = d => d.id;

const mapStateToProps = state => ({
    memberships: projectMembershipListSelector(state),
    usergroups: projectUsergroupListSelector(state),
    projectRoleList: projectRoleListSelector(state),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectMemberships: params => dispatch(setProjectMembershipsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requests)
export default class ProjectUserList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'memberName',
                label: _ts('project.users', 'nameTitle'),
                order: 1,
                sortable: true,
                comparator: getComparator(compareString, 'memberName'),
                modifier: ({ member, memberName }) => (
                    member === this.props.activeUser.userId
                        ? _ts('project.users', 'meTitle', { name: memberName })
                        : memberName
                ),
            },
            {
                key: 'memberEmail',
                label: _ts('project.users', 'emailTitle'),
                order: 2,
                sortable: true,
                comparator: getComparator(compareString, 'memberEmail'),
            },
            {
                key: 'memberOrganization',
                label: _ts('project.users', 'organizationTitle'),
                order: 3,
                sortable: true,
                comparator: getComparator(compareString, 'memberOrganization'),
            },
            {
                key: 'joinedAt',
                label: _ts('project.users', 'joinedAtTitle'),
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
                label: _ts('project.users', 'actionsTitle'),
                order: 5,
                modifier: row => (
                    <Actions
                        readOnly={this.props.readOnly}
                        projectId={this.props.projectId}
                        activeUserRole={
                            this.getActiveUserRole(
                                this.props.projectRoleList,
                                this.props.memberships,
                                this.props.activeUser.userId,
                            )}
                        row={row}
                    />
                ),
            },
        ];
    }

    getActiveUserRole = memoize((projectRoleList, memberships, memberId) => (
        projectRoleList.find(
            p => p.id === memberships.find(
                m => m.member === memberId,
            ).role,
        )
    ))

    filterMembers = memoize((allMembers = [], searchValue) => {
        if (searchValue === '') {
            return allMembers;
        }

        const lowerSearchValue = searchValue.toLowerCase();
        // FIXME: use function from utils
        return allMembers.filter(
            ({ memberName = '', memberEmail = '' } = {}) => (
                memberName.toLowerCase().indexOf(lowerSearchValue) >= 0 ||
                memberEmail.toLowerCase().indexOf(lowerSearchValue) >= 0
            ),
        );
    });

    render() {
        const {
            className: classNameFromProps,
            userListRequest,
            searchEmptyComponent,
            memberships = {},
            searchInputValue,
            emptyComponent: emptyComponentFromProps,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.projectUserList}
        `;

        const { pending: pendingUserList } = userListRequest;
        const filteredMembers = this.filterMembers(memberships, searchInputValue);
        const emptyComponent = searchInputValue === '' ? emptyComponentFromProps : searchEmptyComponent;

        return (
            <div className={className}>
                <header className={styles.header}>
                    <h4 className={styles.heading}>
                        { _ts('project.users', 'usersTitle') }
                    </h4>
                </header>
                { pendingUserList ? (
                    <LoadingAnimation />
                ) : (
                    <Table
                        data={filteredMembers}
                        className={styles.table}
                        headers={this.headers}
                        keySelector={userListKeySelector}
                        emptyComponent={emptyComponent}
                    />
                )}
            </div>
        );
    }
}
