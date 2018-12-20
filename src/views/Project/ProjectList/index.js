import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import memoize from 'memoize-one';

import ListView from '#rscv/List/ListView';
import SearchInput from '#rsci/SearchInput';
import Message from '#rscv/Message';

import {
    reverseRoute,
    caseInsensitiveSubmatch,
} from '#rsu/common';
import Cloak from '#components/Cloak';

import {
    iconNames,
    viewsAcl,
    pathNames,
} from '#constants';
import _ts from '#ts';

import AddProjectButton from './AddProjectButton';
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
    const displayUserProjects = userProjects.filter(
        project => caseInsensitiveSubmatch(
            project.title,
            searchInputValue,
        ),
    );

    return displayUserProjects;
});

const keySelector = project => project.id;
const rendererParams = (key, project) => ({ project });

export default class ProjectList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    state = { searchInputValue: '' };


    getStyleName = (projectId) => {
        const { projectId: projectIdFromProps } = this.props;

        const styleNames = [
            styles.listItem,
            'project-list-item',
        ];

        if (projectId === projectIdFromProps) {
            styleNames.push(styles.active);
        }

        return styleNames.join(' ');
    }

    handleSearchInputChange = (searchInputValue) => {
        this.setState({ searchInputValue });
    };

    renderSidebarItem = ({ project }) => (
        <div className={this.getStyleName(project.id)} >
            <Link
                to={reverseRoute(pathNames.projects, { projectId: project.id })}
                className={styles.link}
            >
                {project.title}
            </Link>
        </div>
    )

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
                    <h2 className={styles.heading}>
                        {_ts('project', 'headerProjects')}
                    </h2>
                    <Cloak
                        {...viewsAcl.discoverProjects}
                        render={
                            <Link
                                to={reverseRoute(pathNames.discoverProjects, {})}
                                className={styles.link}
                            >
                                <span className={`${iconNames.discover} ${styles.discoverIcon}`} />
                                {_ts('project', 'discoverProjectButtonLabel')}
                            </Link>
                        }
                    />
                    <AddProjectButton setActiveProject={setActiveProject} />
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
                    renderer={this.renderSidebarItem}
                    rendererParams={rendererParams}
                    emptyComponent={this.renderEmptyComponent}
                />
            </div>
        );
    }
}
