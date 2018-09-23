import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import ListView from '#rscv/List/ListView';
import SearchInput from '#rsci/SearchInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import {
    reverseRoute,
    caseInsensitiveSubmatch,
} from '#rsu/common';
import Cloak from '#components/Cloak';

import {
    iconNames,
    pathNames,
} from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number,
    userProjects: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    className: '',
    projectId: undefined,
    userProjects: [],
};

export default class Sidebar extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { userProjects } = this.props;

        this.state = {
            displayUserProjects: userProjects,
        };
    }

    getStyleName = (projectId) => {
        const { projectId: projectIdFromProps } = this.props;

        const styleNames = [];
        styleNames.push(styles.listItem);
        if (projectId === projectIdFromProps) {
            styleNames.push(styles.active);
        }
        return styleNames.join(' ');
    }

    handleSearchInputChange = (searchInputValue) => {
        const { userProjects } = this.props;

        const displayUserProjects = userProjects.filter(
            project => caseInsensitiveSubmatch(project.title, searchInputValue),
        );

        this.setState({
            displayUserProjects,
            searchInputValue,
        });
    };

    renderSidebarItem = (key, project) => (
        <div
            key={key}
            className={this.getStyleName(project.id)}
        >
            <Link
                to={reverseRoute(pathNames.projects, { projectId: project.id })}
                className={styles.link}
            >
                {project.title}
            </Link>
        </div>
    )

    // FIXME: Use strings
    renderEmptyComponent = () => (
        <div className={styles.empty}>
            No projects found
        </div>
    )

    render() {
        const { className: classNameFromProps } = this.props;
        const { displayUserProjects } = this.state;

        const className = `
            ${classNameFromProps}
            ${styles.sidebar}
        `;

        return (
            <div className={className}>
                <header className={styles.header}>
                    <h2 className={styles.heading}>
                        {_ts('project', 'headerProjects')}
                    </h2>
                    <Cloak
                        hide={({ isBeta }) => isBeta}
                        render={({ disabled }) => (
                            <Link
                                to={reverseRoute(pathNames.discoverProjects, { })}
                                className={styles.link}
                                disabled={disabled}
                            >
                                <span className={`${iconNames.discover} ${styles.discoverIcon}`} />
                                {_ts('project', 'discoverProjectButtonLabel')}
                            </Link>
                        )}
                    />
                    <PrimaryButton
                        onClick={this.handleAddProjectClick}
                        iconName={iconNames.add}
                    >
                        {_ts('project', 'addProjectButtonLabel')}
                    </PrimaryButton>
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
                    keyExtractor={project => project.id}
                    modifier={this.renderSidebarItem}
                    emptyComponent={this.renderEmptyComponent}
                />
            </div>
        );
    }
}
