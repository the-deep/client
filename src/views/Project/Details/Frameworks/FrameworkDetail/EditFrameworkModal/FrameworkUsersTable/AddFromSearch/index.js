import PropTypes from 'prop-types';
import React from 'react';
import produce from 'immer';

import {
    RequestClient,
    requestMethods,
} from '#request';

import NaiveSearchList from '#components/general/NaiveSearchList';
import UserAddItem from '#components/general/UserAddItem';

const propTypes = {
    frameworkId: PropTypes.number,
    searchText: PropTypes.string,
    onSearchChange: PropTypes.func,
    listGetRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    userAddRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setDefaultRequestParams: PropTypes.func.isRequired,
};

const defaultProps = {
    frameworkId: undefined,
    searchText: '',
    onSearchChange: () => {},
    listGetRequest: {},
    userAddRequest: {},
};

const requests = {
    listGetRequest: {
        url: ({ props }) => `/users/?search=${props.searchText}&members_exclude_framework=${props.frameworkId}`,
        method: requestMethods.GET,
        onPropsChanged: ['searchText', 'frameworkId'],
        onSuccess: ({ response, params }) => {
            params.handleUsersPull(response.results);
        },
        schemaName: 'usersSearchGetResponse',
    },
    userAddRequest: {
        url: '/framework-memberships/',
        method: requestMethods.POST,
        body: ({ params }) => params.membership,
        onSuccess: ({
            response,
            params: {
                handleUserAdd,
            },
            props: {
                onAddUser,
            },
        }) => {
            onAddUser(response);
            handleUserAdd(response.member);
        },
        schemaName: 'frameworkMembership',
    },
};

const listKeySelector = l => l.id;

@RequestClient(requests)
export default class AddFrameworkUserFromSearch extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            users: [],
        };

        this.props.setDefaultRequestParams({
            handleUsersPull: this.handleUsersPull,
        });
    }

    handleUsersPull = (users) => {
        this.setState({ users });
    }

    handleUserAdd = (memberId) => {
        const { users } = this.state;
        const newUsers = produce(users, (safeUsers) => {
            const index = users.findIndex(u => u.id === memberId);
            safeUsers.splice(index, 1);
        });
        this.setState({ users: newUsers });
    }

    listRendererParams = (_, data) => {
        const {
            userAddRequest: {
                pending,
            } = {},
        } = this.props;
        const {
            selectedUser,
        } = this.state;
        const {
            id: userId,
        } = data;

        return ({
            ...data,
            pending: pending && selectedUser === userId,
            onAddButtonClick: () => this.handleAddClick(userId),
        });
    }

    handleAddClick = (userId) => {
        const {
            frameworkId,
            userAddRequest,
        } = this.props;

        const membership = {
            member: userId,
            framework: frameworkId,
        };

        this.setState({ selectedUser: userId });

        userAddRequest.do({
            membership,
            handleUserAdd: this.handleUserAdd,
        });
    }

    render() {
        const {
            searchText,
            onSearchChange,
            listGetRequest: {
                pending,
            },
        } = this.props;

        const {
            users,
        } = this.state;

        return (
            <NaiveSearchList
                searchText={searchText}
                onSearchChange={onSearchChange}
                list={users}
                listKeySelector={listKeySelector}
                pending={pending}
                listRenderer={UserAddItem}
                listRendererParams={this.listRendererParams}
            />
        );
    }
}
