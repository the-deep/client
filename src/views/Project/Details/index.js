import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import FixedTabs from '#rscv/FixedTabs';
import Message from '#rscv/Message';
import MultiViewContainer from '#rscv/MultiViewContainer';

import {
    routeUrlSelector,
    activeProjectRoleSelector,
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
    projectRole: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    projectId: undefined,
    projectRole: {},
};

const mapStateToProps = (state, props) => ({
    projectRole: activeProjectRoleSelector(state, props),
    routeUrl: routeUrlSelector(state),
});

@connect(mapStateToProps)
export default class ProjectDetails extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.routes = {
            general: 'General',
            users: 'Users',
            regions: 'Regions',
            frameworks: 'Framework',
            categoryEditors: 'Category Editor',
        };

        this.defaultHash = 'general';

        const rendererParams = () => ({
            className: styles.content,
            projectId: this.props.projectId,
        });

        this.views = {
            general: {
                component: General,
                rendererParams,
            },
            users: {
                component: Users,
                rendererParams: () => ({ className: styles.content }),
            },
            regions: {
                component: Regions,
                rendererParams,
            },
            frameworks: {
                component: Frameworks,
                rendererParams,
            },
            categoryEditors: {
                component: WordCategories,
                rendererParams,
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
        const {
            className: classNameFromProps,
            projectRole: {
                setupPermissions = [],
            },
        } = this.props;

        if (setupPermissions.indexOf('modify') === -1) {
            const className = `
                ${classNameFromProps}
                ${styles.forbiddenText}
            `;
            return (
                <Message
                    large
                    className={className}
                >
                    {_ts('project', 'forbiddenText')}
                </Message>
            );
        }

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
