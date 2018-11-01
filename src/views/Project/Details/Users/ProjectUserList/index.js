import React from 'react';
import PropTypes from 'prop-types';

import {
    RequestClient,
    requestMethods,
} from '#request';
import _ts from '#ts';
import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';
import { FaramListElement } from '#rscg/FaramElements';
import NormalTable from '#rscv/Table';
import {
    compareString,
    compareDate,
} from '#rsu/common';

import Actions from './Actions';

import styles from './styles.scss';

const Table = FaramListElement(NormalTable);

const propTypes = {
    className: PropTypes.string,
    userListRequest: PropTypes.shape({
        pending: PropTypes.bool.isRequired,
    }).isRequired,

    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.number.isRequired,
    disabled: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
    disabled: false,
};

const emptyObject = {};
const emptyList = [];

const requests = {
    userListRequest: {
        onMount: true,
        onPropsChange: ['projectId'],
        url: '/project-memberships/',
        method: requestMethods.GET,
        query: ({ props: { projectId } }) => ({ project: projectId }),
    },
};

const getComparator = (func, key) => (a, b) => func(a[key], b[key]);
const userListKeySelector = d => d.id;

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
                        disabled={this.props.disabled}
                        row={row}
                    />
                ),
            },
        ];
    }

    render() {
        const {
            className: classNameFromProps,
            userListRequest,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.projectUserList}
        `;

        const {
            pending: pendingUserList,
            response: {
                results: userList = emptyList,
            } = emptyObject,
        } = userListRequest;

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
                        data={userList}
                        headers={this.headers}
                        keySelector={userListKeySelector}
                    />
                )}
            </div>
        );
    }
}
