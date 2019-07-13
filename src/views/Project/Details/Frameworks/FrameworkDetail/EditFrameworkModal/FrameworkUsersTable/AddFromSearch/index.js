import PropTypes from 'prop-types';
import React from 'react';

import {
    RequestClient,
    requestMethods,
} from '#request';

import NaiveSearchList from '#components/general/NaiveSearchList';
import UserAddItem from '#components/general/UserAddItem';

import styles from './styles.scss';

const propTypes = {
    searchText: PropTypes.string,
    onSearchChange: PropTypes.func,
    listGetRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    searchText: '',
    onSearchChange: () => {},
    listGetRequest: {},
};

const requests = {
    listGetRequest: {
        url: ({ props }) => `/users/?search=${props.searchText}&members_exclude_framework=${props.frameworkId}`,
        method: requestMethods.GET,
        onPropsChanged: ['searchText', 'frameworkId'],
        onSuccess: ({ response }) => { console.warn(response); },
        schemaName: 'usersSearchGetResponse',
    },
};

const listKeySelector = l => l.id;

@RequestClient(requests)
export default class AddFrameworkUserFromSearch extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    listRendererParams = (_, data) => data;

    render() {
        const {
            searchText,
            onSearchChange,
            listGetRequest: {
                pending,
                response: {
                    results: list,
                } = {},
            },
        } = this.props;

        return (
            <NaiveSearchList
                searchText={searchText}
                onSearchChange={onSearchChange}
                list={list}
                listKeySelector={listKeySelector}
                pending={pending}
                listRenderer={UserAddItem}
                listRendererParams={this.listRendererParams}
            />
        );
    }
}
