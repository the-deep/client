import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import SearchInput from '#rsci/SearchInput';
import { connect } from 'react-redux';
import {
    compareString,
    compareDate,
    listToMap,
    isFalsy,
} from '#rsu/common';

import FormattedDate from '#rscv/FormattedDate';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';
import NormalTable from '#rscv/Table';
import ListView from '#rscv/List/ListView';
import _ts from '#ts';
import { FaramListElement } from '#rscg/FaramElements';
import FaramList from '#rscg/FaramList';

import {
    projectMembershipDataSelector,
    projectIdFromRoute,
} from '#redux';

import {
    iconNames,
} from '#constants';

import UsersAndUserGroupsGet from '../../requests/UsersAndUserGroupsRequest';
import SearchResult from './SearchResult';

import styles from './styles.scss';


const Table = FaramListElement(NormalTable);
const propTypes = {
    memberships: PropTypes.arrayOf(PropTypes.object),
    projectId: PropTypes.number.isRequired,
};

const defaultProps = {
    memberships: [],
};

const mapStateToProps = (state, props) => ({
    memberships: projectMembershipDataSelector(state, props),
    projectId: projectIdFromRoute(state, props),
});

@connect(mapStateToProps)
export default class Users extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static faramUserDelete = (users, index) => {
        const newUsers = [...users];
        newUsers.splice(index, 1);
        return newUsers;
    }

    constructor(props) {
        super(props);

        this.state = {
            searchInputValue: '',
            searchResults: [],
        };

        this.membershipsMap = listToMap(
            this.props.memberships,
            elem => elem.member,
        );

        this.userGroupHeaders = [
            {
                key: 'title',
                label: _ts('project', 'tableHeaderName'),
                order: 1,
            },
            {
                key: 'role',
                label: _ts('project', 'tableHeaderRights'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareString(a.role, b.role),
            },
            {
                key: 'joinedAt',
                label: _ts('project', 'tableHeaderJoinedAt'),
                order: 5,
                sortable: true,
                comparator: (a, b) => compareDate(a.joinedAt, b.joinedAt),
                modifier: row => (
                    <FormattedDate date={row.joinedAt} mode="dd-MM-yyyy hh:mm" />
                ),
            },
            {
                key: 'actions',
                label: _ts('project', 'tableHeaderActions'),
                order: 6,
                modifier: (row, index) => {
                    const isAdmin = row.role === 'admin';
                    return (
                        <Fragment>
                            <PrimaryButton
                                smallVerticalPadding
                                key="role-change"
                                title={
                                    isAdmin
                                        ? _ts('project', 'revokeAdminRightsTitle')
                                        : _ts('project', 'grantAdminRightsTitle')
                                }
                                onClick={() => this.handleToggleMemberRoleClick(row)}
                                iconName={isAdmin ? iconNames.locked : iconNames.person}
                                transparent
                            />
                            <DangerButton
                                smallVerticalPadding
                                key="delete-member"
                                title={_ts('project', 'deleteMemberLinkTitle')}
                                iconName={iconNames.delete}
                                transparent
                            />
                        </Fragment>
                    );
                },
            },
        ];

        this.memberHeaders = [
            {
                key: 'dp',
                label: _ts('project', 'tableHeaderDp'),
                order: 1,
            },
            {
                key: 'memberName',
                label: _ts('project', 'tableHeaderName'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.memberName, b.memberName),
            },
            {
                key: 'memberEmail',
                label: _ts('project', 'tableHeaderEmail'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareString(a.memberEmail, b.memberEmail),
            },
            {
                key: 'role',
                label: _ts('project', 'tableHeaderRights'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareString(a.role, b.role),
            },
            {
                key: 'joinedAt',
                label: _ts('project', 'tableHeaderJoinedAt'),
                order: 5,
                sortable: true,
                comparator: (a, b) => compareDate(a.joinedAt, b.joinedAt),
                modifier: row => (
                    <FormattedDate date={row.joinedAt} mode="dd-MM-yyyy hh:mm" />
                ),
            },
            {
                key: 'actions',
                label: _ts('project', 'tableHeaderActions'),
                order: 6,
                modifier: (row, index) => {
                    const isAdmin = row.role === 'admin';
                    return (
                        <Fragment>
                            <PrimaryButton
                                smallVerticalPadding
                                key="role-change"
                                title={
                                    isAdmin
                                        ? _ts('project', 'revokeAdminRightsTitle')
                                        : _ts('project', 'grantAdminRightsTitle')
                                }
                                onClick={() => this.handleToggleMemberRoleClick(row)}
                                iconName={isAdmin ? iconNames.locked : iconNames.person}
                                transparent
                            />
                            <DangerButton
                                smallVerticalPadding
                                key="delete-member"
                                title={_ts('project', 'deleteMemberLinkTitle')}
                                iconName={iconNames.delete}
                                transparent
                            />
                        </Fragment>
                    );
                },
            },
        ];

        const searchResultFilter = result => result.filter(x => isFalsy(this.membershipsMap[x.id]));

        this.getUsersAndUserGroupsRequest = new UsersAndUserGroupsGet({
            setState: (params) => {
                this.setState({ searchResults: searchResultFilter(params) });
            },
        });

        this.userGroupData = [
            {
                id: 1,
                dp: '',
                name: 'Freeza',
                email: 'freeza@admin.com',
                role: 'Admin',
                joinedAt: '2017-10-26T04:47:12.381611Z',
                actions: [],
            },
        ];
    }

    componentWillReceiveProps = (nextProps) => {
        const { memberships } = nextProps;
        const { memberships: oldMemberships } = this.props;
        if (memberships !== oldMemberships) {
            this.membershipsMap = listToMap(
                nextProps.memberships,
                elem => elem.member,
            );
        }
    }

    getUsersAndUserGroups = () => {
        const { searchInputValue } = this.state;
        const trimmedInput = searchInputValue.trim();
        if (trimmedInput.length < 3) {
            return;
        }
        this.getUsersAndUserGroupsRequest.init(trimmedInput);
        this.getUsersAndUserGroupsRequest.start();
    }

    calcUserGroupKey = userGroup => userGroup.id;
    calcOtherUserKey = otherUser => otherUser.id;

    handleSearchChange = (searchInputValue) => {
        this.setState(
            { searchInputValue },
            this.getUsersAndUserGroups,
        );
    }

    // Renderer Params for userAndUserGroups search result
    searchResultRendererParams = (key, data) => ({
        key,
        data: { ...data, projectId: this.props.projectId },
        handleAdd: this.addUserOrUserGroup,
    });

    userGroupsRendererParams = (key, data) => ({ key, data })

    renderUserGroups = () => {
        const userGroupLabel = _ts('project', 'userGroupLabel');

        return (
            <Fragment>
                <h3 className={styles.heading}>
                    { userGroupLabel }
                </h3>
                <Table
                    className={styles.content}
                    data={this.userGroupData}
                    headers={this.memberHeaders}
                    keyExtractor={this.calcUserGroupKey}
                />
            </Fragment>
        );
    }

    renderUserDetails = () => {
        const usersLabel = _ts('project', 'usersLabel');
        const userGroupsLabel = _ts('project', 'userGroupsLabel');
        return (
            <div className={styles.userDetailsContainer}>
                <div className={styles.otherUsers}>
                    <h3 className={styles.heading}>
                        { usersLabel }
                    </h3>
                    <Table
                        className={styles.content}
                        data={this.props.memberships}
                        headers={this.memberHeaders}
                        keyExtractor={this.calcOtherUserKey}
                    />
                </div>
                <div className={styles.otherUserGroups}>
                    <h3 className={styles.heading}>
                        { userGroupsLabel }
                    </h3>
                    <FaramList
                        keyExtractor={data => data.id}
                        faramElementName="usergroups"
                    >
                        <Table
                            faramElement
                            className={styles.content}
                            headers={this.userGroupHeaders}
                        />
                    </FaramList>
                </div>
            </div>
        );
    };

    renderUserSearch = () => {
        const searchPlaceholder = _ts('project', 'searchUserPlaceholder');
        const userUserGroupLabel = _ts('project', 'userUserGroupLabel');

        return (
            <div className={styles.userSearch}>
                <header className={styles.header}>
                    <h4 className={styles.heading}>
                        { userUserGroupLabel }
                    </h4>
                    <SearchInput
                        className={styles.userSearchInput}
                        onChange={this.handleSearchChange}
                        placeholder={searchPlaceholder}
                        value={this.state.searchInputValue}
                        showHintAndError={false}
                        showLabel={false}
                    />
                    <ListView
                        keyExtractor={data => data.type + data.id}
                        rendererParams={this.searchResultRendererParams}
                        data={this.state.searchResults}
                        renderer={SearchResult}
                    />

                </header>
            </div>
        );
    }

    render() {
        const UserDetails = this.renderUserDetails;
        const UserSearch = this.renderUserSearch;

        return (
            <div className={styles.users}>
                <UserSearch />
                <UserDetails />
            </div>
        );
    }
}
