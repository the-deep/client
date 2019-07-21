import PropTypes from 'prop-types';
import React from 'react';
import produce from 'immer';
import { _cs } from '@togglecorp/fujs';

import {
    RequestClient,
    requestMethods,
} from '#request';

import NaiveSearchList from '#components/general/NaiveSearchList';
import Message from '#rscv/Message';
import UserAddItem from '#components/general/UserAddItem';

import _ts from '#ts';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    frameworkId: PropTypes.number,
    searchText: PropTypes.string,
    onSearchChange: PropTypes.func,
    listGetRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    userAddRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setDefaultRequestParams: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    frameworkId: undefined,
    searchText: '',
    onSearchChange: () => {},
    listGetRequest: {},
    userAddRequest: {},
};

const emptyList = [];

const SearchEmptyComponent = ({ className }) => (
    <div className={_cs(className, styles.searchEmpty)}>
        <Message>
            {_ts('components.addFromSearch', 'addFromSearchLabel')}
        </Message>
    </div>
);

SearchEmptyComponent.propTypes = {
    className: PropTypes.string,
};

SearchEmptyComponent.defaultProps = {
    className: '',
};

const USER_SEARCH_LIMIT = 25;

const requests = {
    listGetRequest: {
        url: '/users/',
        query: ({
            props: {
                searchText,
                frameworkId,
            },
        }) => ({
            search: searchText,
            members_exclude_framework: frameworkId,
            limit: USER_SEARCH_LIMIT,
        }),
        method: requestMethods.GET,
        onPropsChanged: {
            searchText: ({ props: { searchText } }) => (
                searchText.length > 0
            ),
            frameworkId: ({ props, prevProps }) => (
                props.frameworkId !== prevProps.frameworkId
            ),
        },
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
            className: classNameFromProps,
            listGetRequest: {
                pending,
            },
        } = this.props;

        const { users } = this.state;

        const usersList = searchText.length > 0 ? users : emptyList;

        return (
            <NaiveSearchList
                className={classNameFromProps}
                searchText={searchText}
                onSearchChange={onSearchChange}
                list={usersList}
                listKeySelector={listKeySelector}
                pending={pending}
                listRenderer={UserAddItem}
                listRendererParams={this.listRendererParams}
                emptyComponent={SearchEmptyComponent}
            />
        );
    }
}
