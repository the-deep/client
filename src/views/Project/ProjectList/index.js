import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import memoize from 'memoize-one';

import Icon from '#rscg/Icon';
import ListView from '#rscv/List/ListView';
import SearchInput from '#rsci/SearchInput';
import Message from '#rscv/Message';

import {
    reverseRoute,
    caseInsensitiveSubmatch,
    compareStringSearch,
} from '@togglecorp/fujs';
import Cloak from '#components/general/Cloak';

import {
    viewsAcl,
    pathNames,
} from '#constants';

import _ts from '#ts';
import AddProjectButton from './AddProjectButton';
import ProjectListItem from './ProjectListItem';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number,
    userProjects: PropTypes.arrayOf(PropTypes.object),
    setActiveProject: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
    userProjects: [],
};

const filterProjects = memoize((userProjects, searchInputValue) => {
    const displayUserProjects = userProjects
        .filter(project => caseInsensitiveSubmatch(project.title, searchInputValue))
        .sort((a, b) => compareStringSearch(a.title, b.title, searchInputValue));

    return displayUserProjects;
});

const keySelector = project => project.id;

export default class ProjectList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { searchInputValue: '' };
    }

    handleSearchInputChange = (searchInputValue) => {
        this.setState({ searchInputValue });
    };

    projectRendererParams = (key, project) => ({
        title: project.title,
        projectId: project.id,
        currentProjectId: this.props.projectId,
        isPrivate: project.isPrivate,
    });

    renderEmptyComponent = () => (
        <Message className={styles.empty}>
            {_ts('project', 'noProjectsFound')}
        </Message>
    )

    render() {
        const {
            className: classNameFromProps,
            setActiveProject,
            userProjects,
        } = this.props;

        const { searchInputValue } = this.state;
        const displayUserProjects = filterProjects(
            userProjects,
            searchInputValue,
        );

        const className = `
            ${classNameFromProps}
            ${styles.projectList}
        `;

        return (
            <div className={className}>
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        {_ts('project', 'headerProjects')}
                    </h3>
                    <Cloak
                        {...viewsAcl.discoverProjects}
                        render={
                            <Link
                                to={reverseRoute(pathNames.discoverProjects, {})}
                                className={styles.link}
                            >
                                <Icon
                                    name="discover"
                                    className={styles.discoverIcon}
                                />
                                {_ts('project', 'discoverProjectButtonLabel')}
                            </Link>
                        }
                    />
                    <AddProjectButton
                        setActiveProject={setActiveProject}
                    />
                    <SearchInput
                        onChange={this.handleSearchInputChange}
                        placeholder={_ts('project', 'searchProjectPlaceholder')}
                        className={styles.searchInput}
                        value={this.state.searchInputValue}
                        showLabel={false}
                        showHintAndError={false}
                    />
                </header>
                <ListView
                    className={styles.projectList}
                    data={displayUserProjects}
                    keySelector={keySelector}
                    renderer={ProjectListItem}
                    rendererParams={this.projectRendererParams}
                    emptyComponent={this.renderEmptyComponent}
                />
            </div>
        );
    }
}
