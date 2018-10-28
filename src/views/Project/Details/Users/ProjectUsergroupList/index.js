import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import {
    RequestClient,
    requestMethods,
} from '#request';
import _ts from '#ts';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { FaramListElement } from '#rscg/FaramElements';
import NormalTable from '#rscv/Table';
import { compareString } from '#rsu/common';

import Actions from './Actions';

import styles from './styles.scss';

const Table = FaramListElement(NormalTable);

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
};

const defaultProps = {
    className: '',
};

const requests = {
    usergroupListRequest: {
        onMount: true,
        onPropsChange: ['projectId'],
        url: '/project-usergroups',
        method: requestMethods.GET,
        query: ({ props: { projectId } }) => ({ project: projectId }),
    },
};

const emptyObject = {};
const emptyList = [];

const getComparator = (func, key) => (a, b) => func(a[key], b[key]);

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
                comparator: getComparator(compareString, this.key),
            },
            {
                key: 'actions',
                label: _ts('project.users', 'actionsTitle'),
                order: 4,
                modifier: row => (
                    <Actions row={row} />
                ),
            },
        ];
    }

    render() {
        const {
            className: classNameFromProps,
            projectId,
            usergroupListRequest: {
                pending: pendingUsergroupList,
                response: {
                    results: usergroupList = emptyList,
                } = emptyObject,
            },
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.projectUsergroupList}
        `;

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
                        data={usergroupList}
                        headers={this.headers}
                        keySelector={d => d.id}
                    />
                )}
            </div>
        );
    }
}
