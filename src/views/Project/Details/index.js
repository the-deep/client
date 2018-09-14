import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import FixedTabs from '#rscv/FixedTabs';
import Message from '#rscv/Message';
import MultiViewContainer from '#rscv/MultiViewContainer';

import {
    routeUrlSelector,
    projectLocalDataSelector,
    projectServerDataSelector,
} from '#redux';

import _ts from '#ts';

import General from './General';
import Regions from './Regions';
import Frameworks from './Frameworks';
import CategoryEditors from './CategoryEditors';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectLocalData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number,
};

const defaultProps = {
    className: '',
    projectLocalData: {},
    projectId: undefined,
};

const mapStateToProps = (state, props) => ({
    projectLocalData: projectLocalDataSelector(state, props),
    projectServerData: projectServerDataSelector(state, props),
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
            regions: {
                component: Regions,
                rendererParams,
            },
            frameworks: {
                component: Frameworks,
                rendererParams,
            },
            categoryEditors: {
                component: CategoryEditors,
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
            projectLocalData: {
                faramValues: {
                    role,
                } = {},
            },
        } = this.props;

        if (role !== 'admin') {
            const className = `
                ${classNameFromProps}
                ${styles.forbiddenText}
            `;

            return (
                <Message className={className}>
                    {_ts('project', 'forbiddenText')}
                </Message>
            );
        }

        const className = `
            ${classNameFromProps}
            ${styles.details}
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
