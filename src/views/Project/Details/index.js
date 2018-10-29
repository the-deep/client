import PropTypes from 'prop-types';
import React from 'react';

import FixedTabs from '#rscv/FixedTabs';
import Message from '#rscv/Message';
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
        const { className: classNameFromProps } = this.props;

        return (
            <Cloak
                hide={({ setupPermissions }) => !setupPermissions.includes('modify')}
                render={() => (
                    <div className={`${classNameFromProps} ${styles.projectDetails}`}>
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
                )}
                renderOnHide={() => (
                    <Message
                        className={`${classNameFromProps} ${styles.forbiddenText}`}
                        large
                    >
                        {_ts('project', 'forbiddenText')}
                    </Message>
                )}
            />
        );
    }
}
