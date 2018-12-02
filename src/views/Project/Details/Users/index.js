import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { projectIdFromRoute } from '#redux';

import { RequestCoordinator } from '#request';
import update from '#rsu/immutable-update';

import SearchList from './SearchList';
import ProjectUserList from './ProjectUserList';
import ProjectUsergroupList from './ProjectUsergroupList';

import styles from './styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired,
    className: PropTypes.string,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    className: '',
    readOnly: false,
};

const mapStateToProps = (state, props) => ({
    projectId: projectIdFromRoute(state, props),
});

@connect(mapStateToProps)
@RequestCoordinator
export default class Users extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    state = {
        searchInputValue: '',
        searchItems: [],
    };

    handleSearchInputChange = (searchInputValue) => {
        this.setState({ searchInputValue });
    }

    handleSearchItemsPull = (searchItems = []) => {
        this.setState({ searchItems });
    }

    handleSearchItemRemove = (itemId, type) => {
        const settings = { $autoArray: {
            $filter: i => i.id !== itemId && i.type === type,
        } };
        this.setState({
            searchItems: update(this.state.searchItems, settings),
        });
    }

    render() {
        const {
            className: classNameFromProps,
            projectId,
            readOnly,
        } = this.props;

        const {
            searchInputValue,
            searchItems,
        } = this.state;

        const className = `
            ${classNameFromProps}
            ${styles.users}
        `;

        return (
            <div className={className}>
                <SearchList
                    onSearchInputChange={this.handleSearchInputChange}
                    onItemRemove={this.handleSearchItemRemove}
                    onItemsPull={this.handleSearchItemsPull}
                    searchInputValue={searchInputValue}
                    searchItems={searchItems}
                    projectId={projectId}
                    className={styles.searchList}
                    readOnly={readOnly}
                />
                <div className={styles.details}>
                    <ProjectUserList
                        className={styles.userList}
                        projectId={projectId}
                        readOnly={readOnly}
                        searchInputValue={searchInputValue}
                    />
                    <ProjectUsergroupList
                        className={styles.usergroupList}
                        projectId={projectId}
                        readOnly={readOnly}
                        searchInputValue={searchInputValue}
                    />
                </div>
            </div>
        );
    }
}
