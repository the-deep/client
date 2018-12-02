import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import { connect } from 'react-redux';

import {
    RequestClient,
    requestMethods,
} from '#request';
import _ts from '#ts';

import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';
import { FaramListElement } from '#rscg/FaramElements';
import NormalTable from '#rscv/Table';
import noSearch from '#resources/img/no-filter.png';

import {
    compareString,
    compareDate,
} from '#rsu/common';

import { getTrigramSimilarity } from '#rsu/similarity';

import {
    setProjectMembershipsAction,
    projectUsergroupListSelector,
    projectMembershipListSelector,
    projectRoleListSelector,
    activeUserSelector,
} from '#redux';

import Actions from './Actions';

import styles from './styles.scss';

const Table = FaramListElement(NormalTable);
const emptyObject = {};

const propTypes = {
    className: PropTypes.string,
    userListRequest: PropTypes.shape({
        pending: PropTypes.bool.isRequired,
    }).isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setProjectMemberships: PropTypes.func.isRequired,
    memberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    projectRoleList: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    // eslint-disable-next-line react/no-unused-prop-types
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

const requests = {
    userListRequest: {
        onMount: true,
        onPropsChanged: ['projectId', 'usergroups'],
        url: '/project-memberships/',
        method: requestMethods.GET,
        query: ({ props: { projectId } }) => ({ project: projectId }),
        onSuccess: ({
            response = {},
            props: {
                projectId,
                setProjectMemberships,
            },
        }) => {
            setProjectMemberships({
                projectId,
                memberships: response.results,
            });
        },
    },
};

const getComparator = (func, key) => (a, b) => func(a[key], b[key]);
const userListKeySelector = d => d.id;

const mapStateToProps = state => ({
    memberships: projectMembershipListSelector(state),
    usergroups: projectUsergroupListSelector(state),
    projectRoleList: projectRoleListSelector(state),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectMemberships: params => dispatch(setProjectMembershipsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requests)
export default class ProjectUserList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'memberName',
                label: _ts('project.users', 'nameTitle'),
                order: 1,
                sortable: true,
                comparator: getComparator(compareString, 'memberName'),
                modifier: ({ member, memberName }) => (
                    member === this.props.activeUser.userId
                        ? _ts('project.users', 'meTitle', { name: memberName })
                        : memberName
                ),
            },
            {
                key: 'memberEmail',
                label: _ts('project.users', 'emailTitle'),
                order: 2,
                sortable: true,
                comparator: getComparator(compareString, 'memberEmail'),
            },
            {
                key: 'joinedAt',
                label: _ts('project.users', 'joinedAtTitle'),
                order: 3,
                sortable: true,
                comparator: getComparator(compareDate, 'joinedAt'),
                modifier: ({ joinedAt }) => (
                    <FormattedDate
                        date={joinedAt}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
            {
                key: 'actions',
                label: _ts('project.users', 'actionsTitle'),
                order: 4,
                modifier: row => (
                    <Actions
                        readOnly={this.props.readOnly}
                        projectId={this.props.projectId}
                        activeUserRole={
                            this.getActiveUserRole(
                                this.props.projectRoleList,
                                this.props.memberships,
                                this.props.activeUser.userId,
                            )}
                        row={row}
                    />
                ),
            },
        ];
    }

    getActiveUserRole = memoize((projectRoleList, memberships, memberId) => (
        projectRoleList.find(
            p => p.id === memberships.find(
                m => m.member === memberId,
            ).role,
        )
    ))

    filterMembers = memoize((allMembers = [], searchValue) => {
        if (searchValue === '') {
            return allMembers;
        }

        return allMembers.filter(
            m => getTrigramSimilarity((m || emptyObject).memberName, searchValue) > 0.01,
        );
    });

    searchValueNotFound = () => (
        <div className={styles.noSearch}>
            <img
                className={styles.image}
                src={noSearch}
                alt=""
            />
        </div>
    );

    render() {
        const {
            className: classNameFromProps,
            userListRequest,
            memberships = {},
            searchInputValue,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.projectUserList}
        `;

        const { pending: pendingUserList } = userListRequest;
        const filteredMembers = this.filterMembers(memberships, searchInputValue);

        return (
            <div className={className}>
                <header className={styles.header}>
                    <h4 className={styles.heading}>
                        { _ts('project.users', 'usersTitle') }
                    </h4>
                </header>
                { pendingUserList ? (
                    <LoadingAnimation />
                ) : (
                    <Table
                        data={filteredMembers}
                        className={styles.table}
                        headers={this.headers}
                        keySelector={userListKeySelector}
                        emptyComponent={this.searchValueNotFound}
                    />
                )}
            </div>
        );
    }
}
