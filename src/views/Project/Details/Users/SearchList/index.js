import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SearchInput from '#rsci/SearchInput';
import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    RequestClient,
    requestMethods,
} from '#request';
import { projectMembershipListSelector } from '#redux';
import { iconNames } from '#constants';
import _ts from '#ts';

import SearchListItem from './SearchListItem';
import styles from './styles.scss';

const RequestPropType = PropTypes.shape({
    pending: PropTypes.bool.isRequired,
});

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    memberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
    searchInputValue: PropTypes.string.isRequired,
    searchItems: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    onSearchInputChange: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onItemRemove: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onItemsPull: PropTypes.func.isRequired,
    userSearchRequest: RequestPropType.isRequired,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    className: '',
    readOnly: false,
    searchItems: [],
};

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
            // FIXME: anti-pattern
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
                prevProps: {
                    searchInputValue: oldSearchInputValue,
                },
            }) => {
                if (oldSearchInputValue === searchInputValue) {
                    return false;
                }
                const searchText = searchInputValue.trim();
                if (searchText.length < MIN_SEARCH_TEXT_CHARACTERS) {
                    userSearchRequest.abort();
                    return false;
                }

                return true;
            },
            memberships: ({
                props: {
                    memberships: newMemberships,
                    searchInputValue,
                },
                prevProps: { memberships: oldMemberships },
            }) => {
                if (newMemberships.length < oldMemberships.length &&
                    searchInputValue.trim().length >= MIN_SEARCH_TEXT_CHARACTERS
                ) {
                    return true;
                }
                return false;
            },
        },
        method: requestMethods.GET,
        query: ({
            props: {
                projectId,
                searchInputValue,
            },
        }) => ({
            search: searchInputValue.trim(),
            project: projectId,
        }),
        onSuccess: ({ props: { onItemsPull }, response = {} }) => {
            onItemsPull(response.results);
        },
    },
};

const mapStateToProps = state => ({
    memberships: projectMembershipListSelector(state),
});

@connect(mapStateToProps)
@RequestClient(requests)
export default class SearchList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static searchItemKeySelector = d => `${d.type}-${d.id}`;

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
        onItemRemove: this.props.onItemRemove,
    });

    renderUserList = () => {
        const {
            searchInputValue,
            searchItems,
        } = this.props;

        if (searchItems.length === 0 || searchInputValue.length < MIN_SEARCH_TEXT_CHARACTERS) {
            return <SearchTip />;
        }

        return (
            <ListView
                className={styles.list}
                keySelector={SearchList.searchItemKeySelector}
                rendererParams={this.searchListItemRendererParams}
                data={searchItems}
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
                    <h4 className={styles.heading}>
                        {_ts('project.users', 'userListHeading')}
                    </h4>
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
