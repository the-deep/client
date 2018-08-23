import React, { Fragment } from 'react';

import SearchInput from '#rsci/SearchInput';
import {
    compareString,
    compareDate,
} from '#rsu/common';

import FormattedDate from '#rscv/FormattedDate';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';
import Table from '#rscv/Table';
import ListView from '#rscv/List/ListView';
import _ts from '#ts';
import {
    iconNames,
} from '#constants';


import styles from './styles.scss';

export default class Users extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            searchInputValue: '',
        };

        this.memberHeaders = [
            {
                key: 'dp',
                label: _ts('project', 'tableHeaderDp'),
                order: 1,
            },

            {
                key: 'name',
                label: _ts('project', 'tableHeaderName'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.memberName, b.memberName),
            },
            {
                key: 'email',
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
                modifier: (row) => {
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
                                onClick={() => this.handleDeleteMemberClick(row)}
                                iconName={iconNames.delete}
                                transparent
                            />
                        </Fragment>
                    );
                },
            },
        ];

        // this.memberData = [];
        // this.userGroupData = [];
        this.memberData = [
            {
                id: 1,
                dp: '',
                name: 'Goku',
                email: 'goku@admin.com',
                role: 'Admin',
                joinedAt: '2017-10-26T04:47:12.381611Z',
                actions: [],
            },
        ];

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
            {
                id: 2,
                dp: '',
                name: 'Majin Bu',
                email: 'bu@admin.com',
                role: 'Admin',
                joinedAt: '2017-10-26T04:47:12.381611Z',
                actions: [],
            },
            {
                id: 3,
                dp: '',
                name: 'Cell',
                email: 'cell@admin.com',
                role: 'Admin',
                joinedAt: '2017-10-26T04:47:12.381611Z',
                actions: [],
            },


        ];
    }

    calcUserGroupKey = userGroup => userGroup.id;
    calcOtherUserKey = otherUser => otherUser.id;

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
        return (
            <div className={styles.userDetailsContainer}>
                <div className={styles.otherUsers}>
                    <h3 className={styles.heading}>
                        { usersLabel }
                    </h3>
                    <Table
                        className={styles.content}
                        data={this.memberData}
                        headers={this.memberHeaders}
                        keyExtractor={this.calcOtherUserKey}
                    />
                </div>
                <div className={styles.otherUserGroups}>
                    <ListView
                        className={styles.otherUserGroups}
                        modifier={this.renderUserGroups}
                        data={this.userGroupData}

                    />
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
                        onChange={() => {}}
                        placeholder={searchPlaceholder}
                        value={this.state.searchInputValue}
                        showHintAndError={false}
                        showLabel={false}
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
                <UserDetails>
                    What is
                </UserDetails>
            </div>
        );
    }
}
