import PropTypes from 'prop-types';
import React from 'react';

import FixedTabs from '#rscv/FixedTabs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiViewContainer from '#rscv/MultiViewContainer';
import Cloak from '#components/general/Cloak';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import { getNewActiveProjectId } from '#entities/project';
import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';
import {
    projectDetailsSelector,
    unsetProjectDetailsAction,
    currentUserProjectsSelector,
} from '#redux';
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
    pending: PropTypes.bool,
};

const defaultProps = {
    className: '',
    projectId: undefined,
    pending: false,
};

export default class ProjectDetails extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.routes = {
            general: _ts('project', 'generalDetailsTitle'),
            users: _ts('project', 'usersTitle'),
            regions: _ts('project', 'regionsTitle'),
            frameworks: _ts('project', 'analysisFrameworkTitle'),
            categoryEditors: _ts('project', 'categoryEditorTitle'),
        };

        // FIXME: try writing this.views in a better way
        this.views = {
            general: {
                mount: true,
                wrapContainer: true,
                lazyMount: true,
                component: () => (
                    <Cloak
                        makeReadOnly={this.shouldDisableDetails}
                        render={
                            <General
                                className={styles.view}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
            users: {
                mount: true,
                lazyMount: true,
                wrapContainer: true,
                component: () => (
                    <Cloak
                        makeReadOnly={this.shouldDisableDetails}
                        render={
                            <Users
                                className={styles.view}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
            regions: {
                mount: true,
                lazyMount: true,
                wrapContainer: true,
                component: () => (
                    <Cloak
                        makeReadOnly={this.shouldDisableDetails}
                        render={
                            <Regions
                                className={styles.view}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
            frameworks: {
                mount: true,
                lazyMount: true,
                wrapContainer: true,
                component: () => (
                    <Cloak
                        makeReadOnly={this.shouldDisableDetails}
                        render={
                            <Frameworks
                                className={styles.view}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
            categoryEditors: {
                mount: true,
                lazyMount: true,
                wrapContainer: true,
                component: () => (
                    <Cloak
                        makeReadOnly={this.shouldDisableDetails}
                        render={
                            <WordCategories
                                className={styles.view}
                                projectId={this.props.projectId}
                            />
                        }
                    />
                ),
            },
        };
    }

    shouldDisableDetails = ({ setupPermissions }) => !setupPermissions.modify || this.props.pending;

    render() {
        const { className: classNameFromProps } = this.props;
        const { pending } = this.props;
        const className = `
            ${classNameFromProps}
            ${styles.projectDetails}
        `;

        return (
            <div className={className}>
                { pending && <LoadingAnimation /> }
                <FixedTabs
                    className={styles.tabs}
                    replaceHistory
                    useHash
                    tabs={this.routes}
                />
                <MultiViewContainer
                    useHash
                    activeClassName={styles.active}
                    containerClassName={styles.content}
                    views={this.views}
                />
            </div>
        );
    }
}
