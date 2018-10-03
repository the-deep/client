import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import SearchInput from '#rsci/SearchInput';
import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';

import { iconNames } from '#constants';
import _ts from '#ts';

import SearchRequest from './requests/searchRequest';
import SearchListItem from './SearchListItem';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
};

const defaultProps = {
    className: '',
};

const emptyList = [];
const MIN_SEARCH_TEXT_CHARACTERS = 3;


const searchUsers = memoize((searchInputValue, searchRequest, clearSearchResults) => {
    searchRequest.stop();
    clearSearchResults();

    const searchText = searchInputValue.trim();
    if (searchText.length < MIN_SEARCH_TEXT_CHARACTERS) {
        return;
    }

    searchRequest
        .init(searchText)
        .start();
});

const EmptySearch = () => {
    const emptyText = 'No matching user / usergroup found';
    return (
        <div className={styles.emptyText}>
            { emptyText }
        </div>
    );
};

const SearchTip = () => {
    const tipText = 'Search with at least 3 characters';
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

export default class SearchList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            searchInputValue: '',
            userList: emptyList,
            searchPending: false,
        };

        this.searchRequest = new SearchRequest({
            setState: d => this.setState(d),
        });
    }

    handleSearchInputChange = (searchInputValue) => {
        this.setState({ searchInputValue });
    }

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

    clearUserList = () => {
        this.setState({ userList: emptyList });
    }

    renderUserList = () => {
        const {
            userList,
            searchInputValue,
        } = this.state;

        if (userList.length === 0 && searchInputValue.length < MIN_SEARCH_TEXT_CHARACTERS) {
            return <SearchTip />;
        }

        return (
            <ListView
                className={styles.list}
                keyExtractor={data => data.type + data.id}
                rendererParams={this.searchListItemRendererParams}
                data={userList}
                renderer={SearchListItem}
                emptyComponent={EmptySearch}
            />
        );
    }

    render() {
        const searchInputPlaceholder = _ts('project', 'searchUserPlaceholder');
        const searchListTitle = _ts('project', 'userUserGroupLabel');

        const {
            className: classNameFromProps,
        } = this.props;

        const {
            userList,
            searchInputValue,
            searchPending,
        } = this.state;

        const className = `
            ${classNameFromProps}
            ${styles.searchList}
        `;

        searchUsers(searchInputValue, this.searchRequest, this.clearUserList);

        const UserList = this.renderUserList;

        return (
            <div className={className}>
                <header className={styles.header}>
                    <h4>
                        { searchListTitle }
                    </h4>
                    <SearchInput
                        className={styles.searchInput}
                        onChange={this.handleSearchInputChange}
                        placeholder={searchInputPlaceholder}
                        value={searchInputValue}
                        showHintAndError={false}
                        showLabel={false}
                    />
                </header>
                <div className={styles.listContainer}>
                    { searchPending ? (
                        <LoadingAnimation />
                    ) : (
                        <UserList />
                    )}
                </div>
            </div>
        );
    }
}
