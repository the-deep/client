import React from 'react';

import SearchInput from '#rsci/SearchInput';

import _ts from '#ts';

import styles from './styles.scss';

export default class Users extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            searchInputValue: '',
        };
    }
    renderUserDetails = () => {
        const abc = 'Details';
        return (
            <div className={styles.userDetailsContainer}>
                {abc}
            </div>
        );
    }

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
