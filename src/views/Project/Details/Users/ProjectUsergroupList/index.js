import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import { connect } from 'react-redux';

import {
    RequestClient,
    requestMethods,
    notifyOnFailure,
} from '#request';
import _ts from '#ts';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { FaramListElement } from '#rscg/FaramElements';
import NormalTable from '#rscv/Table';
import { compareString } from '#rsu/common';

import {
    setProjectUsergroupsAction,
    projectUsergroupListSelector,
} from '#redux';

import Actions from './Actions';

import styles from './styles.scss';

// FIXME: User group name is not consistent anywhere
// It should be userGroup but 'usergroup' is also used
// Should be fixed in server as well

const Table = FaramListElement(NormalTable);

const propTypes = {
    className: PropTypes.string,

    usergroupListRequest: PropTypes.shape({
        pending: PropTypes.bool.isRequired,
    }).isRequired,
    searchEmptyComponent: PropTypes.func.isRequired,
    emptyComponent: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setProjectUsergroups: PropTypes.func.isRequired,
    usergroups: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types

    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.number.isRequired,
    readOnly: PropTypes.bool,
    searchInputValue: PropTypes.string,
};

const defaultProps = {
    className: '',
    searchInputValue: '',
    readOnly: false,
};

const usergroupListKeySelector = d => d.id;

const requests = {
    usergroupListRequest: {
        onMount: true,
        onPropsChanged: ['projectId'],
        url: '/project-usergroups/',
        method: requestMethods.GET,
        query: ({ props: { projectId } }) => ({ project: projectId }),
        onFailure: notifyOnFailure(_ts('project.users', 'usergroupsTitle')),
        onSuccess: ({
            response = {},
            props: {
                projectId,
                setProjectUsergroups,
            },
        }) => {
            setProjectUsergroups({
                projectId,
                usergroups: response.results,
            });
        },
    },
};

const getComparator = (func, key) => (a, b) => func(a[key], b[key]);

const mapStateToProps = state => ({
    usergroups: projectUsergroupListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectUsergroups: params => dispatch(setProjectUsergroupsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requests)
export default class ProjectUsergroupList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'title',
                label: _ts('project.users', 'nameTitle'),
                order: 1,
                sortable: true,
                comparator: getComparator(compareString, 'title'),
            },
            {
                key: 'actions',
                label: _ts('project.users', 'actionsTitle'),
                order: 4,
                modifier: row => (
                    <Actions
                        projectId={this.props.projectId}
                        readOnly={this.props.readOnly}
                        row={row}
                    />
                ),
            },
        ];
    }

    filterGroups = memoize((allMembers = [], searchValue) => {
        const lowerSearchValue = searchValue.toLowerCase();
        if (searchValue === '') {
            return allMembers;
        }

        return allMembers.filter(
            ({ title = '' } = {}) =>
                title.toLowerCase().indexOf(lowerSearchValue) >= 0,
        );
    });

    render() {
        const {
            className: classNameFromProps,
            usergroupListRequest: {
                pending: pendingUsergroupList,
            },
            usergroups,
            searchInputValue,
            searchEmptyComponent,
            emptyComponent: emptyComponentFromProps,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.projectUsergroupList}
        `;
        const filteredGroups = this.filterGroups(usergroups, searchInputValue);
        const emptyComponent = searchInputValue === '' ? emptyComponentFromProps : searchEmptyComponent;

        return (
            <div className={className}>
                <header className={styles.header}>
                    <h4 className={styles.heading}>
                        { _ts('project.users', 'usergroupsTitle') }
                    </h4>
                </header>
                { pendingUsergroupList ? (
                    <LoadingAnimation />
                ) : (
                    <Table
                        data={filteredGroups}
                        className={styles.table}
                        headers={this.headers}
                        keySelector={usergroupListKeySelector}
                        emptyComponent={emptyComponent}
                    />
                )}
            </div>
        );
    }
}
