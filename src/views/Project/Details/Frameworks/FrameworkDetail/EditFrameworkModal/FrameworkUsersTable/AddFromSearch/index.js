import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    RequestClient,
    methods,
} from '#request';

import NaiveSearchList from '#components/general/NaiveSearchList';
import Message from '#rscv/Message';
import UserAddItem from '#components/general/UserAddItem';

import _ts from '#ts';
import notify from '#notify';

import styles from './styles.scss';

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

const propTypes = {
    className: PropTypes.string,
    frameworkId: PropTypes.number,
    searchText: PropTypes.string,
    onSearchChange: PropTypes.func,
    // onAddUser adds user to usersTable after successful request to add user
    onAddUser: PropTypes.func.isRequired,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setDefaultRequestParams: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    frameworkId: undefined,
    searchText: '',
    onSearchChange: () => {},
};

const USER_SEARCH_LIMIT = 25;

const requestOptions = {
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
        method: methods.GET,
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
        onFailure: () => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'membershipListFetchFailure'),
                duration: notify.duration.SLOW,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'membershipListFetchFatal'),
                duration: notify.duration.SLOW,
            });
        },
        extras: {
            schemaName: 'usersSearchGetResponse',
        },
    },
    userAddRequest: {
        url: '/framework-memberships/',
        method: methods.POST,
        body: ({ params }) => params.membership,
        onSuccess: ({
            response,
            params: { handleUserAdd },
        }) => {
            // handleUserAdd is called to remove added user from search lsit
            handleUserAdd(response);
        },
        onFailure: () => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'membershipAddFailure'),
                duration: notify.duration.SLOW,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'membershipAddFatal'),
                duration: notify.duration.SLOW,
            });
        },
        extras: {
            schemaName: 'frameworkMembership',
        },
    },
};

const listKeySelector = l => l.id;

@RequestClient(requestOptions)
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

    handleUserAdd = (response) => {
        const { onAddUser } = this.props;
        const { users } = this.state;

        const newUsers = users.filter(u => u.id !== response.member);
        this.setState({ users: newUsers });
        onAddUser(response);
    }

    listRendererParams = (_, data) => {
        const {
            requests: {
                userAddRequest: { pending },
            },
        } = this.props;
        const {
            selectedUser,
        } = this.state;
        const {
            id: userId,
        } = data;

        return ({
            ...data,
            userId,
            pending: pending && selectedUser === userId,
            onAddButtonClick: this.handleAddClick,
        });
    }

    handleAddClick = (userId) => {
        const {
            frameworkId,
            requests: {
                userAddRequest,
            },
        } = this.props;

        this.setState({ selectedUser: userId });

        const membership = {
            member: userId,
            framework: frameworkId,
        };

        userAddRequest.do({
            membership,
            handleUserAdd: this.handleUserAdd,
        });
    }

    handleSearchChnage = (searchText) => {
        const { onSearchChange } = this.props;

        if (searchText.length === 0) {
            this.setState({ users: [] });
        }
        onSearchChange(searchText);
    }

    render() {
        const {
            searchText,
            className: classNameFromProps,
            requests: {
                listGetRequest: { pending },
            },
        } = this.props;

        const { users } = this.state;

        return (
            <NaiveSearchList
                className={classNameFromProps}
                searchText={searchText}
                onSearchChange={this.handleSearchChnage}
                data={users}
                listKeySelector={listKeySelector}
                pending={pending}
                listRenderer={UserAddItem}
                listRendererParams={this.listRendererParams}
                emptyComponent={SearchEmptyComponent}
                changeDelay={500}
            />
        );
    }
}
