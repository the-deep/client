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
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    setProjectUserGroupsAction,
    projectUserGroupsSelector,
    projectIdFromRoute,

    setProjectMembershipsAction,
    projectMembershipsSelector,

    removeProjectMembershipAction,
    removeProjectUserGroupAction,
} from '#redux';

import {
    iconNames,
} from '#constants';

import UsersAndUserGroupsGet from './requests/UsersAndUserGroupsRequest';
import {
    ProjectMembershipDeleteRequest,
    ProjectMembershipsGetRequest,
} from './requests/ProjectMembershipRequest';

import {
    ProjectUserGroupsGetRequest,
    ProjectUserGroupDeleteRequest,
} from './requests/ProjectUserGroupRequest';

import SearchList from './SearchList';
import styles from './styles.scss';


const Table = FaramListElement(NormalTable);
const propTypes = {
    memberships: PropTypes.arrayOf(PropTypes.object),
    projectId: PropTypes.number.isRequired,
    userGroups: PropTypes.arrayOf(PropTypes.object),
    setProjectMembers: PropTypes.func.isRequired,
    setUserGroups: PropTypes.func.isRequired,
    removeMembership: PropTypes.func.isRequired,
    removeUserGroup: PropTypes.func.isRequired,
};

const defaultProps = {
    memberships: [],
    userGroups: [],
};

const mapStateToProps = (state, props) => ({
    memberships: projectMembershipsSelector(state, props),
    userGroups: projectUserGroupsSelector(state, props),
    projectId: projectIdFromRoute(state, props),
});

const mapDispatchToProps = dispatch => ({
    setProjectMembers: params => dispatch(setProjectMembershipsAction(params)),
    setUserGroups: params => dispatch(setProjectUserGroupsAction(params)),
    removeMembership: params => dispatch(removeProjectMembershipAction(params)),
    removeUserGroup: params => dispatch(removeProjectUserGroupAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Users extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static faramUserDelete = (users, index) => users.filter((x, i) => i !== index);

    constructor(props) {
        super(props);

        this.state = {
            searchInputValue: '',
            searchResults: [],
            pending: false,
        };

        this.membershipsMap = listToMap(
            this.props.memberships,
            elem => elem.member,
        );

        this.userGroupsMap = listToMap(
            this.props.userGroups,
            elem => elem.usergroup,
        );

        this.userGroupHeaders = [
            {
                key: 'dp',
                label: _ts('project', 'tableHeaderDp'),
                order: 1,
            },
            {
                key: 'title',
                label: _ts('project', 'tableHeaderName'),
                order: 1,
            },
            {
                key: 'actions',
                label: _ts('project', 'tableHeaderActions'),
                order: 6,
                modifier: row => (
                    <Fragment>
                        <DangerButton
                            smallVerticalPadding
                            key="delete-member"
                            title={_ts('project', 'removeUserGroupTitle')}
                            iconName={iconNames.delete}
                            transparent
                            onClick={() => this.handleRemoveUserGroupClick(row)}
                        />
                    </Fragment>
                ),
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
                                onClick={() => this.handleChangeRole(row, isAdmin)}
                                iconName={isAdmin ? iconNames.locked : iconNames.person}
                                transparent
                            />
                            <DangerButton
                                smallVerticalPadding
                                key="delete-member"
                                title={_ts('project', 'deleteMemberLinkTitle')}
                                iconName={iconNames.delete}
                                onClick={() => this.handleRemoveMemberClick(row)}
                                transparent
                            />
                        </Fragment>
                    );
                },
            },
        ];

        this.searchResultFilter = result => result.filter(x => (
            x.type === 'user'
                ? isFalsy(this.membershipsMap[x.id])
                : isFalsy(this.userGroupsMap[x.id])
        ));

        this.getUsersAndUserGroupsRequest = new UsersAndUserGroupsGet({
            setSearchResults: searchResults =>
                this.setState({ searchResults: this.searchResultFilter(searchResults) }),
        });

        this.removeMemberRequest = new ProjectMembershipDeleteRequest({
            removeMembership: (projectId, membership) =>
                this.props.removeMembership({ projectId, membership }),
            setParentPending: pending => this.setState({ pending }),
        });

        this.removeUserGroupRequest = new ProjectUserGroupDeleteRequest({
            removeUserGroup: (projectId, userGroup) =>
                this.props.removeUserGroup({ projectId, userGroup }),
            setParentPending: pending => this.setState({ pending }),
            getMemberships: this.getMemberships,
        });

        const { setProjectMembers, setUserGroups } = this.props;
        this.projectMembershipsGetRequest = new ProjectMembershipsGetRequest({
            setState: params => this.setState(params),
            setMemberships: (memberships, projectId) =>
                setProjectMembers({ memberships, projectId }),
        });

        this.projectUserGroupsGetRequest = new ProjectUserGroupsGetRequest({
            setState: params => this.setState(params),
            setUserGroups: (userGroups, projectId) =>
                setUserGroups({ userGroups, projectId }),
        });
    }

    componentDidMount() {
        const {
            projectId,
        } = this.props;

        this.projectMembershipsGetRequest.init(projectId).start();
        this.projectUserGroupsGetRequest.init(projectId).start();
    }

    componentWillReceiveProps(nextProps) {
        const { memberships, userGroups, projectId } = nextProps;

        const {
            memberships: oldMemberships,
            userGroups: oldUserGroups,
            projectId: oldProjectId,
        } = this.props;

        if (memberships !== oldMemberships) {
            this.membershipsMap = listToMap(
                memberships,
                elem => elem.member,
            );
            const { searchResults } = this.state;
            const newResult = this.searchResultFilter(searchResults);
            this.setState({ searchResults: newResult });
        }
        if (userGroups !== oldUserGroups) {
            this.userGroupsMap = listToMap(
                userGroups,
                elem => elem.usergroup,
            );
            const { searchResults } = this.state;
            const newResult = this.searchResultFilter(searchResults);
            this.setState({ searchResults: newResult });
        }

        if (projectId !== oldProjectId) {
            this.projectMembershipsGetRequest.init(projectId).start();
            this.projectUserGroupsGetRequest.init(projectId).start();
        }
    }

    componentWillUnmount() {
        this.projectMembershipsGetRequest.stop();
        this.projectUserGroupsGetRequest.stop();
    }

    getMemberships = () => {
        const {
            projectId,
        } = this.props;
        this.projectMembershipsGetRequest.init(projectId).start();
    }

    getUsersAndUserGroups = () => {
        const { searchInputValue } = this.state;
        const trimmedInput = searchInputValue.trim();
        if (trimmedInput.length < 3) {
            // also, clear search results
            if (this.state.searchResults.length > 0) {
                this.setState({ searchResults: [] });
            }
            return;
        }

        this.getUsersAndUserGroupsRequest.init(trimmedInput);
        this.getUsersAndUserGroupsRequest.start();
    }

    calcUserGroupKey = userGroup => userGroup.id;
    calcOtherUserKey = otherUser => otherUser.id;

    handleChangeRole = (memberRow, isAdmin) => {
        // TODO: implement this after merging permissions branch
    }

    handleSearchChange = (searchInputValue) => {
        this.setState(
            { searchInputValue },
            this.getUsersAndUserGroups,
        );
    }

    handleRemoveMemberClick = (membershipRow) => {
        const { projectId } = this.props;
        this.removeMemberRequest.init(projectId, membershipRow).start();
    }

    handleRemoveUserGroupClick = (userGroupRow) => {
        const { projectId } = this.props;
        this.removeUserGroupRequest.init(projectId, userGroupRow).start();
    }

    // Renderer Params for userAndUserGroups search result
    searchResultRendererParams = (key, data) => ({
        key,
        data: { ...data, projectId: this.props.projectId },
        handleAdd: this.addUserOrUserGroup,
        setParentPending: pending => this.setState({ pending }),
        clearSearchInput: () => this.setState({ searchInputValue: '' }),
        getMemberships: () => this.getMemberships(),
    });

    userGroupsRendererParams = (key, data) => ({ key, data })

    renderUserGroups = () => {
        const userGroupLabel = _ts('project', 'userGroupLabel');
        const { userGroups } = this.props;

        return (
            <Fragment>
                <h3 className={styles.heading}>
                    { userGroupLabel }
                </h3>
                <Table
                    className={styles.content}
                    data={userGroups}
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
                    <Table
                        className={styles.content}
                        data={this.props.userGroups}
                        headers={this.userGroupHeaders}
                        keyExtractor={this.calcUserGroupKey}
                    />
                </div>
            </div>
        );
    };

    render() {
        const UserDetails = this.renderUserDetails;

        const { pending } = this.state;
        const {
            className: classNameFromProps,
            projectId,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.users}
        `;

        return (
            <div className={className}>
                { pending ? (
                    <LoadingAnimation
                        className={styles.loadingAnimation}
                        message={_ts('project', 'updatingProject')}
                        small
                    />
                ) : (
                    <React.Fragment>
                        <SearchList
                            projectId={projectId}
                            className={styles.searchList}
                        />
                        <UserDetails />
                    </React.Fragment>
                )}
            </div>
        );
    }
}
