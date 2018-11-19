import React from 'react';
import PropTypes from 'prop-types';

import SearchInput from '#rsci/SearchInput';
import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    RequestClient,
    requestMethods,
} from '#request';
import { iconNames } from '#constants';
import _ts from '#ts';

import SearchListItem from './SearchListItem';
import styles from './styles.scss';

const RequestPropType = PropTypes.shape({
    pending: PropTypes.bool.isRequired,
});

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
    searchInputValue: PropTypes.string.isRequired,
    onSearchInputChange: PropTypes.func.isRequired,
    userSearchRequest: RequestPropType.isRequired,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    className: '',
    readOnly: false,
};

const emptyList = [];
const emptyObject = {};
const MIN_SEARCH_TEXT_CHARACTERS = 2;

const EmptySearch = () => {
    const emptyText = _ts('project.users', 'searchEmptyText');

    return (
        <div className={styles.emptyText}>
            { emptyText }
        </div>
    );
};

const SearchTip = () => {
    const tipText = _ts(
        'project.users',
        'searchTipText',
        { numberOfCharacters: MIN_SEARCH_TEXT_CHARACTERS },
    );

    const iconClassName = `
        ${iconNames.info}
        ${styles.icon}
    `;
    return (
        <div className={styles.searchTip}>
            <div className={iconClassName} />
            <div className={styles.text}>
                { tipText }
            </div>
        </div>
    );
};

const requests = {
    userSearchRequest: {
        url: '/users-user-groups/',
        onMount: ({ props: { searchInputValue } }) => {
            const searchText = searchInputValue.trim();
            if (searchText.length < MIN_SEARCH_TEXT_CHARACTERS) {
                return false;
            }

            return true;
        },
        onPropsChanged: {
            searchInputValue: ({
                props: {
                    searchInputValue,
                    userSearchRequest,
                },
            }) => {
                const searchText = searchInputValue.trim();
                if (searchText.length < MIN_SEARCH_TEXT_CHARACTERS) {
                    userSearchRequest.abort();
                    return false;
                }

                return true;
            },
        },
        method: requestMethods.GET,
        isUnique: true,
        query: ({
            props: {
                projectId,
                searchInputValue,
            },
        }) => ({
            search: searchInputValue.trim(),
            project: projectId,
        }),
    },
};

@RequestClient(requests)
export default class SearchList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    searchListItemRendererParams = (key, {
        title: usergroupTitle,
        username,
        type,
        id: memberId,
    }) => ({
        usergroupTitle,
        username,
        type,
        memberId,
        projectId: this.props.projectId,
    });

    renderUserList = () => {
        const { searchInputValue } = this.props;

        const {
            userSearchRequest: {
                response: {
                    results: userList = emptyList,
                } = emptyObject,
            } = emptyObject,
        } = this.props;

        if (userList.length === 0 && searchInputValue.length < MIN_SEARCH_TEXT_CHARACTERS) {
            return <SearchTip />;
        }

        return (
            <ListView
                className={styles.list}
                keySelector={data => `${data.type}-${data.id}`}
                rendererParams={this.searchListItemRendererParams}
                data={userList}
                renderer={SearchListItem}
                emptyComponent={EmptySearch}
            />
        );
    }

    render() {
        const searchInputPlaceholder = _ts('project.users', 'searchInputPlaceholder');

        const {
            className: classNameFromProps,
            userSearchRequest,
            searchInputValue,
            onSearchInputChange,
            readOnly,
        } = this.props;

        const { pending: userSearchPending } = userSearchRequest;
        const UserList = this.renderUserList;

        const className = `
            ${classNameFromProps}
            ${styles.searchList}
        `;

        return (
            <div className={className}>
                <header className={styles.header}>
                    <SearchInput
                        onChange={onSearchInputChange}
                        placeholder={searchInputPlaceholder}
                        value={searchInputValue}
                        showHintAndError={false}
                        showLabel={false}
                        disabled={readOnly}
                    />
                </header>
                <div className={styles.listContainer}>
                    { userSearchPending ? (
                        <LoadingAnimation />
                    ) : (
                        <UserList />
                    )}
                </div>
            </div>
        );
    }
}
