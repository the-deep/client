import PropTypes from 'prop-types';
import React from 'react';

import FixedTabs from '#rscv/FixedTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';

import Cloak from '#components/Cloak';

import _ts from '#ts';

import General from './General';
import Users from './Users';
import Regions from './Regions';
import Frameworks from './Frameworks';
import WordCategories from './WordCategories';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

export default class ProjectDetails extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static shouldDisableDetails = ({ setupPermissions }) => !setupPermissions.modify;

    constructor(props) {
        super(props);

        this.routes = {
            general: _ts('project', 'generalDetailsTitle'),
            users: _ts('project', 'usersTitle'),
            regions: _ts('project', 'regionsTitle'),
            frameworks: _ts('project', 'analysisFrameworkTitle'),
            categoryEditors: _ts('project', 'categoryEditorTitle'),
        };

        this.defaultHash = 'general';

        this.views = {
            general: {
                component: () => (
                    <Cloak
                        makeReadOnly={ProjectDetails.shouldDisableDetails}
                        render={
                            <General
                                className={styles.content}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
            users: {
                component: () => (
                    <Cloak
                        makeReadOnly={ProjectDetails.shouldDisableDetails}
                        render={
                            <Users
                                className={styles.content}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
            regions: {
                component: () => (
                    <Cloak
                        makeReadOnly={ProjectDetails.shouldDisableDetails}
                        render={
                            <Regions
                                className={styles.content}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
            frameworks: {
                component: () => (
                    <Cloak
                        makeReadOnly={ProjectDetails.shouldDisableDetails}
                        render={
                            <Frameworks
                                className={styles.content}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
            categoryEditors: {
                component: () => (
                    <Cloak
                        makeReadOnly={ProjectDetails.shouldDisableDetails}
                        render={
                            <WordCategories
                                className={styles.content}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
        };

        this.titles = {
            general: _ts('project', 'generalDetailsLabel'),
            regions: _ts('project', 'regionsLabel'),
            frameworks: _ts('project', 'analysisFrameworkLabel'),
            categoryEditors: _ts('project', 'categoryEditorLabel'),
        };
    }

    render() {
        const { className: classNameFromProps } = this.props;
        const className = `
            ${classNameFromProps}
            ${styles.projectDetails}
        `;

        return (
            <div className={className}>
                <FixedTabs
                    className={styles.tabs}
                    defaultHash={this.defaultHash}
                    replaceHistory
                    useHash
                    tabs={this.routes}
                />
                <MultiViewContainer
                    useHash
                    views={this.views}
                />
            </div>
        );
    }
}
