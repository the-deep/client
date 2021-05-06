import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    _cs,
    compareString,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import SearchInput from '#rsci/SearchInput';
import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';

import {
    RequestClient,
    methods,
} from '#request';
import {
    projectMembershipListSelector,
    projectUsergroupListSelector,
} from '#redux';
import _ts from '#ts';

import noSearch from '#resources/img/no-filter.png';
import SearchListItem from './SearchListItem';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    memberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    usergroups: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
    searchInputValue: PropTypes.string.isRequired,
    searchItems: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    onSearchInputChange: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onItemRemove: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onItemsPull: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setDefaultRequestParams: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    readOnly: false,
    searchItems: [],
};

const MIN_SEARCH_TEXT_CHARACTERS = 1;

const EmptySearch = () => {
    const emptyText = _ts('project.users', 'searchEmptyText');

    return (
        <Message>
            { emptyText }
        </Message>
    );
};

const SearchTip = () => {
    const tipText = _ts(
        'project.users',
        'searchTipText',
        { numberOfCharacters: MIN_SEARCH_TEXT_CHARACTERS },
    );

    return (
        <Message className={styles.searchTip}>
            <Icon
                name="info"
                className={styles.icon}
            />
            <div className={styles.text}>
                { tipText }
            </div>
        </Message>
    );
};

const SearchValueNotFound = () => {
    const noResultsFound = _ts(
        'project.users',
        'noResultsFound',
    );

    return (
        <Message className={styles.noSearch}>
            <img
                className={styles.image}
                src={noSearch}
                alt=""
            />
            <div className={styles.text}>
                { noResultsFound }
            </div>
        </Message>
    );
};

const requestOptions = {
    userSearchRequest: {
        url: '/combined/',
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
                    // FIXME: this may be a problem
                    requests: {
                        userSearchRequest,
                    },
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
            usergroups: ({
                props: {
                    usergroups: newUsergroups,
                    searchInputValue,
                },
                prevProps: { usergroups: oldUsergroups },
            }) => {
                if (newUsergroups.length < oldUsergroups.length &&
                    searchInputValue.trim().length >= MIN_SEARCH_TEXT_CHARACTERS
                ) {
                    return true;
                }
                return false;
            },
        },
        method: methods.GET,
        query: ({
            props: {
                projectId,
                searchInputValue,
            },
        }) => ({
            search: searchInputValue.trim(),
            members_exclude_project: projectId, // To exclude members from current projects
            apis: 'users,user-groups',
        }),
        onSuccess: ({ props: { onItemsPull }, response = {} }) => {
            const users = response.users.results
                .map(x => ({ ...x, type: 'user' }));

            const userGroups = response['user-groups'].results
                .map(x => ({ ...x, type: 'user_group' }));

            onItemsPull([...users, ...userGroups]);
        },
        onFailure: ({ params, error: { faramErrors } }) => {
            params.setSearchError(faramErrors.$internal.join(' '));
        },
        onFatal: ({ params, error: { errorMessage } }) => {
            params.setSearchError(errorMessage);
        },
        extras: {
            schemaName: 'userUserGroupSearchResponse',
        },
    },
};

const mapStateToProps = state => ({
    memberships: projectMembershipListSelector(state),
    usergroups: projectUsergroupListSelector(state),
});

@connect(mapStateToProps)
@RequestClient(requestOptions)
export default class SearchList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static searchItemKeySelector = d => `${d.type}-${d.id}`;
    static groupKeySelector = d => d.type;

    constructor(props) {
        super(props);
        this.state = {
            searchError: undefined,
        };
        this.props.setDefaultRequestParams({
            setSearchError: val => this.setState({ searchError: val }),
        });
    }

    componentWillReceiveProps(nextProps) {
        const { searchInputValue: newSearchInputValue } = nextProps;
        const { searchInputValue } = this.props;
        // This must be done manually as request is not called when searchInputvalue's
        // length is 0
        if (searchInputValue && searchInputValue !== newSearchInputValue && !newSearchInputValue) {
            this.setState({ searchError: undefined });
            const {
                requests: {
                    userSearchRequest,
                },
            } = this.props;
            userSearchRequest.abort();
        }
    }

    searchListItemRendererParams = (key, {
        title: usergroupTitle,
        username,
        firstName,
        lastName,
        displayPictureUrl,
        type,
        id: memberId,
    }) => ({
        usergroupTitle,
        username,
        firstName,
        lastName,
        displayPictureUrl,
        type,
        memberId,
        projectId: this.props.projectId,
        onItemRemove: this.props.onItemRemove,
    });

    groupComparator = (a, b) => compareString(a, b);

    groupRendererParams = (groupKey) => {
        const userTitle = _ts('project.users', 'searchUserTitle');
        const usergroupTitle = _ts('project.users', 'searchUsergroupTitle');
        return {
            children: groupKey === 'user' ? userTitle : usergroupTitle,
        };
    }

    renderUserList = () => {
        const {
            searchInputValue,
            searchItems,
        } = this.props;

        if (searchInputValue.length < MIN_SEARCH_TEXT_CHARACTERS) {
            return <SearchTip />;
        }
        if (searchItems.length !== 0) {
            return (
                <ListView
                    className={styles.list}
                    keySelector={SearchList.searchItemKeySelector}
                    data={searchItems}
                    emptyComponent={EmptySearch}
                    rendererParams={this.searchListItemRendererParams}
                    rendererClassName={styles.listItem}
                    renderer={SearchListItem}
                    groupKeySelector={SearchList.groupKeySelector}
                    groupRendererParams={this.groupRendererParams}
                    groupRendererClassName={styles.listGroup}
                    groupComparator={this.groupComparator}
                />
            );
        }

        return <SearchValueNotFound />;
    }

    render() {
        const searchInputPlaceholder = _ts('project.users', 'searchInputPlaceholder');

        const {
            className: classNameFromProps,
            requests: {
                userSearchRequest,
            },
            searchInputValue,
            onSearchInputChange,
            readOnly,
        } = this.props;
        const {
            searchError,
        } = this.state;

        const { pending: userSearchPending } = userSearchRequest;
        const UserList = this.renderUserList;

        return (
            <div className={_cs(classNameFromProps, styles.searchList)}>
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
                { searchError ? (
                    <Message>
                        {searchError}
                    </Message>
                ) : (
                    <div className={styles.listContainer}>
                        { userSearchPending ? (
                            <LoadingAnimation />
                        ) : (
                            <UserList />
                        )}
                    </div>
                )}
            </div>
        );
    }
}
