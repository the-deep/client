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
    disabled: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
    disabled: false,
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

    render() {
        const {
            className: classNameFromProps,
            projectId,
            disabled,
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
                            disabled={disabled}
                        />
                        <div className={styles.details}>
                            <ProjectUserList
                                className={styles.userList}
                                projectId={projectId}
                                disabled={disabled}
                            />
                            <ProjectUsergroupList
                                className={styles.usergroupList}
                                projectId={projectId}
                                disabled={disabled}
                            />
                        </div>
                    </React.Fragment>
                )}
            </div>
        );
    }
}
