import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import {
    reverseRoute,
    caseInsensitiveSubmatch,
    compareStringSearch,
    compareLength,
    compareString,
    isFalsy,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Badge from '#components/viewer/Badge';
import FormattedDate from '#rscv/FormattedDate';
import Table from '#rscv/Table';
import SearchInput from '#rsci/SearchInput';

import {
    usergroupProjectsSelector,

    setUsergroupViewAction,
} from '#redux';
import { pathNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    projects: usergroupProjectsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUsergroupView: params => dispatch(setUsergroupViewAction(params)),
});

const searchProject = memoize((projects, value) => (
    !isFalsy(value)
        ? projects
            .filter(project => caseInsensitiveSubmatch(project.title, value))
            .sort((a, b) => compareStringSearch(a.title, b.title, value))
        : projects
));

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectsTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            searchProjectInputValue: '',
        };

        this.projectHeaders = [
            {
                key: 'title',
                label: _ts('userGroup', 'tableHeaderTitle'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
                modifier: row => (
                    <div>
                        {row.title}
                        {row.isPrivate &&
                            <Badge
                                className={styles.badge}
                                icon="locked"
                                title={_ts('project', 'privateProjectBadgeTitle')}
                                tooltip={_ts('project', 'privateProjectBadgeTooltip')}
                            />
                        }
                    </div>
                ),
            },
            {
                key: 'createdAt',
                label: _ts('userGroup', 'tableHeaderCreatedAt'),
                order: 2,
                modifier: row => <FormattedDate date={row.createdAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'startDate',
                label: _ts('userGroup', 'tableHeaderStartDate'),
                order: 3,
                modifier: row => <FormattedDate date={row.startDate} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'countries',
                label: _ts('userGroup', 'tableHeaderCountries'),
                order: 4,
                defaultSortOrder: 'dsc',
                sortable: true,
                modifier: d => ((d.regions || []).length),
                comparator: (a, b) => compareLength(a.regions, b.regions),
            },
            {
                key: 'status',
                label: _ts('userGroup', 'tableHeaderStatus'),
                order: 5,
                modifier: () => 'Active', // NOTE: Show 'Active' for now
            },
            {
                key: 'modifiedAt',
                label: _ts('userGroup', 'tableHeaderLastModifiedAt'),
                order: 6,
                modifier: row => <FormattedDate date={row.modifiedAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'members',
                label: _ts('userGroup', 'tableHeaderMembers'),
                order: 7,
                defaultSortOrder: 'dsc',
                sortable: true,
                modifier: d => ((d.memberships || []).length),
                comparator: (a, b) => compareLength(a.memberships, b.memberships),
            },
            {
                key: 'actions',
                label: _ts('userGroup', 'tableHeaderActions'),
                order: 8,
                modifier: row => (
                    <div>
                        <Link
                            title={_ts('userGroup', 'viewProjectLinkTitle')}
                            key={row.id}
                            to={reverseRoute(pathNames.projects, { projectId: row.id })}
                            className={styles.link}
                        >
                            <Icon name="openLink" />
                        </Link>
                    </div>
                ),
            },
        ];
    }

    handleSearchProjectChange = (value) => {
        this.setState({
            searchProjectInputValue: value,
        });
    }

    keySelector = rowData => rowData.id

    render() {
        const { projects } = this.props;
        const { searchProjectInputValue } = this.state;

        const searchedProjects = searchProject(projects, searchProjectInputValue);

        return (
            <div className={`${this.props.className} ${styles.projects}`}>
                <div className={styles.header}>
                    <h2>
                        {_ts('userGroup', 'headerProjects')}
                    </h2>
                    <div className={styles.pusher} />
                    <SearchInput
                        placeholder={_ts('userGroup', 'placeholderSearch')}
                        onChange={this.handleSearchProjectChange}
                        value={searchProjectInputValue}
                        className={styles.searchInput}
                        showLabel={false}
                        showHintAndError={false}
                    />
                </div>
                <div className={styles.content}>
                    <Table
                        className={styles.table}
                        data={searchedProjects}
                        headers={this.projectHeaders}
                        keySelector={this.keySelector}
                    />
                </div>
            </div>
        );
    }
}
