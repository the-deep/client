import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { projectIdFromRoute } from '#redux';

import {
    RequestCoordinator,
    RequestClient,
} from '#request';

import _ts from '#ts';
import LoadingAnimation from '#rscv/LoadingAnimation';

import SearchList from './SearchList';
import ProjectUserList from './ProjectUserList';
import ProjectUsergroupList from './ProjectUsergroupList';

import styles from './styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired,
    className: PropTypes.string,
    usersRequest: PropTypes.shape({
        pending: PropTypes.bool.isRequired,
    }).isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    projectId: projectIdFromRoute(state, props),
});

const requestListToListen = [
    'usersRequest',
];

@connect(mapStateToProps)
@RequestCoordinator
@RequestClient(undefined, requestListToListen)
export default class Users extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    state = { searchInputValue: '' };

    handleSearchInputChange = (searchInputValue) => {
        this.setState({ searchInputValue });
    }

    // Renderer Params for userAndUserGroups search result
    searchResultRendererParams = (key, data) => ({
        key,
        data: { ...data, projectId: this.props.projectId },
        handleAdd: this.addUserOrUserGroup,
        setParentPending: pending => this.setState({ pending }),
        clearSearchInput: () => this.setState({ searchInputValue: '' }),
        getMemberships: () => this.getMemberships(),
    });

    userGroupsRendererParams = (key, data) => ({ key, data })

    render() {
        const {
            className: classNameFromProps,
            projectId,
            usersRequest: { pending },
        } = this.props;

        const { searchInputValue } = this.state;

        const className = `
            ${classNameFromProps}
            ${styles.users}
        `;

        return (
            <div className={className}>
                { pending ? (
                    <LoadingAnimation
                        message={_ts('project', 'updatingProject')}
                        small
                    />
                ) : (
                    <React.Fragment>
                        <SearchList
                            onSearchInputChange={this.handleSearchInputChange}
                            searchInputValue={searchInputValue}
                            projectId={projectId}
                            className={styles.searchList}
                        />
                        <div className={styles.details}>
                            <ProjectUserList projectId={projectId} />
                            <ProjectUsergroupList projectId={projectId} />
                        </div>
                    </React.Fragment>
                )}
            </div>
        );
    }
}
